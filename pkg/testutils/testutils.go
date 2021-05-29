/*
Copyright 2019-2021 The Tekton Authors
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

// Package testutils provides utilities to simplify other `_test` packages
package testutils

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"reflect"
	"time"

	broadcaster "github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/controllers"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/router"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	fakedynamicclientset "k8s.io/client-go/dynamic/fake"
	fakek8sclientset "k8s.io/client-go/kubernetes/fake"
)

// DummyK8sClientset returns a fake K8s clientset
func DummyK8sClientset() *fakek8sclientset.Clientset {
	result := fakek8sclientset.NewSimpleClientset()
	return result
}

// DummyK8sClientset returns a fake K8s clientset
func DummyDynamicClientset() *fakedynamicclientset.FakeDynamicClient {
	result := fakedynamicclientset.NewSimpleDynamicClient(runtime.NewScheme())
	return result
}

// DummyResource returns a Resource populated by fake clientsets
func DummyResource() *endpoints.Resource {
	resource := endpoints.Resource{
		DynamicClient: DummyDynamicClientset(),
		K8sClient:     DummyK8sClientset(),
	}
	return &resource
}

// DummyHTTPRequest returns a HTTP request with a JSON content type header as
// well as the configured with the parameters
func DummyHTTPRequest(method string, url string, body io.Reader) *http.Request {
	httpReq, _ := http.NewRequest(method, url, body)
	httpReq.Header.Set("Content-Type", "application/json")
	return httpReq
}

// DummyServer returns a httptest server of the Tekton Dashboard
func DummyServer() (*httptest.Server, *endpoints.Resource, string) {
	resource := DummyResource()
	// Create subscriber to wait for controller to detect created namespace
	subscriber, _ := endpoints.ResourcesBroadcaster.Subscribe()

	// Create namespace that is referenced by extensionController
	dashboardNamespace := "tekton-pipelines"
	_, err := resource.K8sClient.CoreV1().Namespaces().Create(context.TODO(), &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: dashboardNamespace}}, metav1.CreateOptions{})
	if err != nil {
		logging.Log.Fatalf("Error creating namespace '%s': %v", dashboardNamespace, err)
	}

	// K8s signals only allows for a single channel, which will panic when executed twice
	// There should be no os signals for testing purposes
	routerHandler := router.Register(*resource)
	logging.Log.Info("Creating controllers")
	stopCh := make(<-chan struct{})
	resyncDur := time.Second * 30
	controllers.StartTektonControllers(resource.DynamicClient, resyncDur, "", stopCh)
	controllers.StartKubeControllers(resource.K8sClient, resyncDur, "", false, routerHandler, stopCh)
	// Wait until namespace is detected by informer and functionally "dropped" since the informer will be eventually consistent
	timeout := time.After(5 * time.Second)
	for {
		select {
		case <-timeout:
			logging.Log.Fatalf("Namespace informer did not detect installNamespace by deadline")
		case event := <-subscriber.SubChan():
			if event.Kind == "Namespace" && event.Operation == broadcaster.Created {
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

// ObjectListDeepEqual errors if the two object lists are not equal
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
				return fmt.Errorf("Actual object %v did not equal expected %v", actualObject, expectedObject)
			}
		}
	}
	// The two lists are equal
	return nil
}

func GetObject(version, kind, namespace, name, resourceVersion string) *unstructured.Unstructured {
	return &unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": version,
			"kind":       kind,
			"metadata": map[string]interface{}{
				"name":            name,
				"namespace":       namespace,
				"resourceVersion": resourceVersion,
			},
		},
	}
}

func GetClusterObject(version, kind, name, resourceVersion string) *unstructured.Unstructured {
	return &unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": version,
			"kind":       kind,
			"metadata": map[string]interface{}{
				"name":            name,
				"resourceVersion": resourceVersion,
			},
		},
	}
}
