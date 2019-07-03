/*
Copyright 2019 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
		http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// This package provides utilities to simplify other `_test` packages
package testutils

import (
	"fmt"
	restful "github.com/emicklei/go-restful"
	broadcaster "github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/controllers"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/router"
	fakeclientset "github.com/tektoncd/pipeline/pkg/client/clientset/versioned/fake"
	"io"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	fakek8sclientset "k8s.io/client-go/kubernetes/fake"
	"net/http"
	"net/http/httptest"
	"reflect"
	"time"
)

func DummyK8sClientset() *fakek8sclientset.Clientset {
	result := fakek8sclientset.NewSimpleClientset()
	return result
}

func DummyClientset() *fakeclientset.Clientset {
	result := fakeclientset.NewSimpleClientset()
	return result
}

func DummyResource() *endpoints.Resource {
	resource := endpoints.Resource{
		PipelineClient: DummyClientset(),
		K8sClient:      DummyK8sClientset(),
	}
	return &resource
}

func DummyHTTPRequest(method string, url string, body io.Reader) *http.Request {
	httpReq, _ := http.NewRequest(method, url, body)
	httpReq.Header.Set("Content-Type", "application/json")
	return httpReq
}

// Use alongside DummyHTTPRequest
func DummyServer() (*httptest.Server, *endpoints.Resource, string) {
	resource := DummyResource()
	// Create namespace that is referenced by extensionController
	dashboardNamespace := "tekton-pipelines"
	_, err := resource.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: dashboardNamespace}})
	if err != nil {
		logging.Log.Fatalf("Error creating namespace '%s': %v", dashboardNamespace, err)
	}

	// Create subscriber to wait for controller to detect created namespace
	subscriber, _ := endpoints.ResourcesBroadcaster.Subscribe()

	// K8s signals only allows for a single channel, which will panic when executed twice
	// There should be no os signals for testing purposes
	routerHandler := router.Register(*resource)
	logging.Log.Info("Creating controllers")
	stopCh := make(<-chan struct{})
	resyncDur := time.Second * 30
	controllers.StartTektonControllers(resource.PipelineClient, resyncDur, stopCh)
	controllers.StartKubeControllers(resource.K8sClient, resyncDur, dashboardNamespace, stopCh)
	// Wait until namespace is detected by informer and functionally "dropped" since the informer will be eventually consistent
	timeout := time.After(5 * time.Second)
	for {
		select {
		case <-timeout:
			logging.Log.Fatalf("Namespace informer did not detect installNamespace by deadline")
		case event := <-subscriber.SubChan():
			if event.MessageType == broadcaster.NamespaceCreated {
				goto NamespaceDetected
			}
		}
	}
NamespaceDetected:
	// Remove subscriber from pool
	endpoints.ResourcesBroadcaster.Unsubscribe(subscriber)
	server := httptest.NewServer(routerHandler)
	return server, resource, dashboardNamespace
}

// Takes list of endpoints and returns test server that serves each
func DummyExtension(endpoints ...string) *httptest.Server {
	if len(endpoints) == 0 {
		endpoints = []string{""}
	}
	wsContainer := restful.NewContainer()
	ws := new(restful.WebService)
	ws.
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)

	// Stub function to validate extension route active
	routeFunction := func(request *restful.Request, response *restful.Response) {
		response.WriteHeader(http.StatusOK)
	}

	for _, endpoint := range endpoints {
		ws.Route(ws.GET(endpoint).To(routeFunction))
		ws.Route(ws.POST(endpoint).To(routeFunction))
		ws.Route(ws.PUT(endpoint).To(routeFunction))
		ws.Route(ws.DELETE(endpoint).To(routeFunction))
		ws.Route(ws.GET(endpoint + "/{var:*}").To(routeFunction))
		ws.Route(ws.POST(endpoint + "/{var:*}").To(routeFunction))
		ws.Route(ws.PUT(endpoint + "/{var:*}").To(routeFunction))
		ws.Route(ws.DELETE(endpoint + "/{var:*}").To(routeFunction))
	}
	wsContainer.Add(ws)
	return httptest.NewServer(wsContainer)
}

func ObjectListDeepEqual(expectedListPointer interface{}, actualListPointer interface{}) error {
	createNamespaceToNameObjectMap := func(slicePointer interface{}) (map[string]map[string]interface{}, error) {
		// slicePointer should refer to a slice of struct (likely a CRD)
		slice := reflect.ValueOf(slicePointer)
		if slice.Kind() != reflect.Slice {
			return nil, fmt.Errorf("Interface passed was a non-slice type")
		}

		// Convert *[]someType (interface{}) to []interface{}
		interfaceList := make([]interface{}, 0, slice.Len())
		for i := 0; i < slice.Len(); i++ {
			object := slice.Index(i).Interface()
			interfaceList = append(interfaceList, object)
		}
		// Separate objects/CRD by assumed `Namespace` and `Name` fields
		namespaceNameObjectMap := make(map[string]map[string]interface{})
		for _, object := range interfaceList {
			name := reflect.ValueOf(object).FieldByName("Name").String()
			namespace := reflect.ValueOf(object).FieldByName("Namespace").String()
			// Create map[string]interface{} value for namespace key, if nil
			if namespaceNameObjectMap[namespace] == nil {
				namespaceNameObjectMap[namespace] = make(map[string]interface{})
			}
			// Add object
			namespaceNameObjectMap[namespace][name] = object
		}
		return namespaceNameObjectMap, nil
	}
	// actual/response
	actualMap, err := createNamespaceToNameObjectMap(actualListPointer)
	if err != nil {
		return fmt.Errorf("Unable to create map for actual list: %v", err)
	}
	expectedMap, err := createNamespaceToNameObjectMap(expectedListPointer)
	if err != nil {
		return fmt.Errorf("Unable to create map for expected list: %v", err)
	}
	for namespace, actualNameObjectMap := range actualMap {
		for name, actualObject := range actualNameObjectMap {
			expectedNameObjectMap, found := expectedMap[namespace]
			if !found {
				return fmt.Errorf("Actual object list has references to namespace %s that expected list does not", namespace)
			}
			expectedObject, found := expectedNameObjectMap[name]
			if !found {
				return fmt.Errorf("Did not find object in %s namespace with name %s in expectedList", namespace, name)
			}
			if !reflect.DeepEqual(expectedObject, actualObject) {
				return fmt.Errorf("Actual object %v did not equal expected %v\n", actualObject, expectedObject)
			}
		}
	}
	// The two lists are equal
	return nil
}
