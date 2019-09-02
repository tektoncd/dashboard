package router_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"
	"time"

	restful "github.com/emicklei/go-restful"
	broadcaster "github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	. "github.com/tektoncd/dashboard/pkg/router"
	"github.com/tektoncd/dashboard/pkg/testutils"
	v1alpha1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
)

// Router successful response contract
// Does not apply to excludeRoutes
// GET:    200
// POST:   201
// PUT:    204
// Delete: 204

// Exclude testing of routes that contain any of these substring values
var excludeRoutes []string = []string{
	"/v1/websockets", // No response code
	"rebuild",        // Returns 201
	ExtensionRoot,    // Response codes dictated by extension logic
	"health",         // Returns 204
	"readiness",      // Returns 204
	"proxy",          // Kube API server has its own standard
	"ingress",        // Ingress will not exist
	"endpoints",      // Route or Ingress will not exist
}

var methodRouteMap = make(map[string][]string) // k, v := HTTP_METHOD, []route
// Stores names of resources created using POST endpoints in case id/name is modified from payload (for example, pipelineRun)
var routeNameMap = make(map[string]string)

// Populate methodMap
// Router parameters are NOT replaced
func init() {
	server, _, _ := testutils.DummyServer()
	mux, _ := server.Config.Handler.(*restful.Container)
	for _, registeredWebservices := range mux.RegisteredWebServices() {
		for _, route := range registeredWebservices.Routes() {
			for _, excludeRoute := range excludeRoutes {
				if strings.Contains(route.Path, excludeRoute) {
					goto SkipRoute
				}
			}
			methodRouteMap[route.Method] = append(methodRouteMap[route.Method], route.Path)
		SkipRoute:
		}
	}
}

// Validates router contract for CRUD endpoints (status codes, headers, etc.)
func TestRouterContract(t *testing.T) {
	server, r, namespace := testutils.DummyServer()
	defer server.Close()

	// map traversal is random
	// GET/PUT/DELETE <resource>/{name} requires object exists (POST)
	orderedHttpKeys := []string{
		"POST",
		"GET",
		"PUT",
		"DELETE",
	}
	methodStatusMap := map[string]int{
		"POST":   201,
		"GET":    200,
		"PUT":    204,
		"DELETE": 204,
	}

	for _, httpMethod := range orderedHttpKeys {
		statusCode := methodStatusMap[httpMethod]
		t.Logf("Checking %s endpoints for %d\n", httpMethod, statusCode)
		for _, route := range methodRouteMap[httpMethod] {
			validateRoute(t, r, httpMethod, statusCode, server, route, namespace)
		}
	}
}

func validateRoute(t *testing.T, r *endpoints.Resource, httpMethod string, expectedStatusCode int, server *httptest.Server, route, namespace string) {
	var httpRequestBody io.Reader
	t.Logf("Validating route: %s", route)
	namelessRoute := strings.TrimSuffix(route, "/{name}")
	resource := namelessRoute[strings.LastIndex(namelessRoute, "/")+1:]
	// Remove plural
	resource = strings.TrimSuffix(resource, "s")
	resourceName := fmt.Sprintf("fake%s", resource)

	// Grab stored name, if any
	storedResourceName, ok := routeNameMap[namelessRoute]
	if ok {
		resourceName = storedResourceName
	}

	// Make request body
	if httpMethod == "POST" || httpMethod == "PUT" {
		resourceObject := fakeStub(t, r, httpMethod, resource, namespace, resourceName)
		if resourceObject == nil {
			t.Fatalf("Fake stub does not exist for %s\n", resource)
		}
		jsonBytes, err := json.Marshal(resourceObject)
		if err != nil {
			t.Fatalf("Error marshalling %s resource\n", resource)
		}
		httpRequestBody = bytes.NewReader(jsonBytes)
	} else if httpMethod == "GET" {
		// GET/{name} route
		if strings.Contains(route, "{name}") {
			// This should return nil if there is no POST fakeStub implementation
			resourceObject := fakeStub(t, r, "POST", resource, namespace, resourceName)
			if resourceObject == nil {
				makeFake(t, r, resource, namespace, resourceName)
			}
		}
	}
	// Replace path params
	serverRoute := fmt.Sprintf("%s%s", server.URL, route)
	serverRoute = strings.Replace(serverRoute, "{namespace}", namespace, 1)
	serverRoute = strings.Replace(serverRoute, "{name}", resourceName, 1)

	httpReq := testutils.DummyHTTPRequest(httpMethod, serverRoute, httpRequestBody)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("Error getting response from %s: %v\n", serverRoute, err)
	}
	if response.StatusCode != expectedStatusCode {
		t.Logf("%s route %s failure\n", httpMethod, route)
		t.Fatalf("Response code %d did not equal expected %d\n", response.StatusCode, expectedStatusCode)
	}
	// Ensure "Content-Location" header routes to resource properly
	if httpMethod == "POST" {
		contentLocationSlice := response.Header["Content-Location"]
		if len(contentLocationSlice) == 0 {
			t.Fatalf("POST route %s did not set 'Content-Location' header", route)
		}
		// "Content-Location" header should be of the form /some/path/<resource>/resource-name
		postedResourceName := contentLocationSlice[0][strings.LastIndex(contentLocationSlice[0], "/")+1:]
		t.Log("POSTed resource name:", postedResourceName)
		routeNameMap[route] = postedResourceName
		httpReq := testutils.DummyHTTPRequest("GET", fmt.Sprintf("%s%s", server.URL, contentLocationSlice[0]), httpRequestBody)
		_, err := http.DefaultClient.Do(httpReq)
		if err != nil {
			t.Fatalf("Unable to locate resource as specified by 'Content-Location' header: %s", contentLocationSlice[0])
		}
	}
}

// ALL and ONLY resourceTypes with POST/PUT routes must implement
// Returns stub to be marshalled for dashboard route validation
func fakeStub(t *testing.T, r *endpoints.Resource, httpMethod, resourceType, namespace, resourceName string) interface{} {
	t.Logf("Getting fake resource type: %s\n", resourceType)
	// Cases based on resource substring in mux routes (lowercase)
	switch resourceType {
	case "pipelinerun":
		// ManualPipelineRun require the referenced pipeline to have the same name as the pipeline being created
		switch httpMethod {
		case "POST":
			// Avoid creation collision when checking GET routes for stub
			_, err := r.PipelineClient.TektonV1alpha1().Pipelines(namespace).Get(resourceName, metav1.GetOptions{})
			// If pipeline does not exist
			if err != nil {
				// TODO: embed in pipelineRun once pipelineSpec is supported
				// Create pipeline ref for ManualPipelineRun
				pipeline := v1alpha1.Pipeline{
					ObjectMeta: metav1.ObjectMeta{
						Name:      resourceName,
						Namespace: namespace,
					},
					Spec: v1alpha1.PipelineSpec{},
				}
				_, err := r.PipelineClient.TektonV1alpha1().Pipelines(namespace).Create(&pipeline)
				if err != nil {
					t.Fatalf("Error creating pipeline for pipelinerun: %v\n", err)
				}
			}
			return endpoints.ManualPipelineRun{
				PIPELINENAME: resourceName,
			}
		case "PUT":
			return endpoints.PipelineRunUpdateBody{
				STATUS: v1alpha1.PipelineRunSpecStatusCancelled,
			}
		default:
			return nil
		}
	case "credential":
		credential := endpoints.Credential{
			Name:        "fakeCredential",
			Username:    "thisismyusername",
			Password:    "password",
			Description: "cred de jour",
			URL: map[string]string{
				"tekton.dev/git-0": "https://github.com",
			},
		}
		if httpMethod == "PUT" {
			credential.Username = "updated"
			credential.Password = "updated"
			credential.Description = "updated"
		}
		return credential

	default:
		return nil
	}
}

// Creates resources for GET/{name} routes without corresponding POST to prevent lookup failures
func makeFake(t *testing.T, r *endpoints.Resource, resourceType, namespace, resourceName string) {
	t.Logf("Making fake resource %s with name %s\n", resourceType, resourceName)
	switch resourceType {
	case "task":
		task := v1alpha1.Task{
			ObjectMeta: metav1.ObjectMeta{
				Name:      resourceName,
				Namespace: namespace,
			},
		}
		_, err := r.PipelineClient.TektonV1alpha1().Tasks(namespace).Create(&task)
		if err != nil {
			t.Fatalf("Error creating task: %v\n", err)
		}
	case "taskrun":
		taskRun := v1alpha1.TaskRun{
			ObjectMeta: metav1.ObjectMeta{
				Name:      resourceName,
				Namespace: namespace,
			},
		}
		_, err := r.PipelineClient.TektonV1alpha1().TaskRuns(namespace).Create(&taskRun)
		if err != nil {
			t.Fatalf("Error creating taskRun: %v\n", err)
		}
	case "pipeline":
		pipeline := v1alpha1.Pipeline{
			ObjectMeta: metav1.ObjectMeta{
				Name:      resourceName,
				Namespace: namespace,
			},
		}
		_, err := r.PipelineClient.TektonV1alpha1().Pipelines(namespace).Create(&pipeline)
		if err != nil {
			t.Fatalf("Error creating pipeline: %v\n", err)
		}
	case "log":
		pod := corev1.Pod{
			ObjectMeta: metav1.ObjectMeta{
				Name:      resourceName,
				Namespace: namespace,
			},
		}
		_, err := r.K8sClient.CoreV1().Pods(namespace).Create(&pod)
		if err != nil {
			t.Fatalf("Error creating pod: %v\n", err)
		}
	case "taskrunlog":
		pod := corev1.Pod{
			ObjectMeta: metav1.ObjectMeta{
				Name:      resourceName,
				Namespace: namespace,
			},
			Spec: corev1.PodSpec{
				Containers: []corev1.Container{
					corev1.Container{
						Name: endpoints.ContainerPrefix + "Container",
					},
				},
			},
		}
		_, err := r.K8sClient.CoreV1().Pods(namespace).Create(&pod)
		if err != nil {
			t.Fatalf("Error creating pod: %v\n", err)
		}
		taskRun := v1alpha1.TaskRun{
			ObjectMeta: metav1.ObjectMeta{
				Name:      resourceName,
				Namespace: namespace,
			},
			Spec: v1alpha1.TaskRunSpec{},
			Status: v1alpha1.TaskRunStatus{
				PodName: resourceName,
			},
		}
		_, err = r.PipelineClient.TektonV1alpha1().TaskRuns(namespace).Create(&taskRun)
		if err != nil {
			t.Fatalf("Error creating taskRun: %v\n", err)
		}
	case "pipelinerunlog":
		pod := corev1.Pod{
			ObjectMeta: metav1.ObjectMeta{
				Name:      resourceName,
				Namespace: namespace,
			},
			Spec: corev1.PodSpec{
				Containers: []corev1.Container{
					corev1.Container{
						Name: endpoints.ContainerPrefix + "Container",
					},
				},
			},
		}
		_, err := r.K8sClient.CoreV1().Pods(namespace).Create(&pod)
		if err != nil {
			t.Fatalf("Error creating pod: %v\n", err)
		}
		taskRun := v1alpha1.TaskRun{
			ObjectMeta: metav1.ObjectMeta{
				Name:      resourceName,
				Namespace: namespace,
			},
			Spec: v1alpha1.TaskRunSpec{},
			Status: v1alpha1.TaskRunStatus{
				PodName: resourceName,
			},
		}
		_, err = r.PipelineClient.TektonV1alpha1().TaskRuns(namespace).Create(&taskRun)
		if err != nil {
			t.Fatalf("Error creating taskRun: %v\n", err)
		}
		pipelineRun := v1alpha1.PipelineRun{
			ObjectMeta: metav1.ObjectMeta{
				Name:      resourceName,
				Namespace: namespace,
			},
			Spec: v1alpha1.PipelineRunSpec{},
			Status: v1alpha1.PipelineRunStatus{
				TaskRuns: map[string]*v1alpha1.PipelineRunTaskRunStatus{
					resourceName: &v1alpha1.PipelineRunTaskRunStatus{
						Status: &v1alpha1.TaskRunStatus{
							PodName: resourceName,
						},
					},
				},
			},
		}
		_, err = r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace).Create(&pipelineRun)
		if err != nil {
			t.Fatalf("Error creating pipelineRun: %v\n", err)
		}
	case "pipelineresource":
		pipelineResource := v1alpha1.PipelineResource{
			ObjectMeta: metav1.ObjectMeta{
				Name:      resourceName,
				Namespace: namespace,
			},
		}
		_, err := r.PipelineClient.TektonV1alpha1().PipelineResources(namespace).Create(&pipelineResource)
		if err != nil {
			t.Fatalf("Error creating pipelineResource: %v\n", err)
		}
	}
}

func TestExtensionRegistration(t *testing.T) {
	t.Log("In TestExtensionRegistration")
	server, r, installNamespace := testutils.DummyServer()
	defer server.Close()

	otherNamespace := "ns1"
	_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: otherNamespace}})
	if err != nil {
		t.Fatalf("Error creating namespace '%s': %s\n", otherNamespace, err)
	}

	extensionEndpoints := []string{
		"robots",
		"secrets",
		"pipelineruns",
	}
	extensionUrlValue := strings.Join(extensionEndpoints, ExtensionEndpointDelimiter)
	extensionServers := []*httptest.Server{
		testutils.DummyExtension(extensionEndpoints...),
		testutils.DummyExtension(),
	}
	var extensionPorts []int32
	for _, extensionServer := range extensionServers {
		portDelimiterIndex := strings.LastIndex(extensionServer.URL, ":")
		port, _ := strconv.Atoi(extensionServer.URL[portDelimiterIndex+1:])
		extensionPorts = append(extensionPorts, int32(port))
	}

	// It's important the UID's really are unique! Use 123, 456, 789 to make sure
	// the extension IDs all differ from each other, otherwise this will lead to only
	// one instead of two being picked up by TestExtensionRegistration
	extensionServices := []corev1.Service{
		corev1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "extension1",
				Namespace: installNamespace,
				UID:       types.UID(strconv.FormatInt(123+time.Now().UnixNano(), 10)),
				Annotations: map[string]string{
					ExtensionUrlKey:            extensionUrlValue,
					ExtensionBundleLocationKey: "Location",
					ExtensionDisplayNameKey:    "Display Name",
				},
				Labels: map[string]string{
					ExtensionLabelKey: ExtensionLabelValue,
				},
			},
			Spec: corev1.ServiceSpec{
				ClusterIP: "127.0.0.1",
				Ports: []corev1.ServicePort{
					{
						Port: extensionPorts[0],
					},
				},
			},
		},
		// No endpoints annotation
		corev1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "extension2",
				Namespace: installNamespace,
				UID:       types.UID(strconv.FormatInt(456+time.Now().UnixNano(), 10)),
				Annotations: map[string]string{
					ExtensionBundleLocationKey: "Location",
					ExtensionDisplayNameKey:    "Display Name",
				},
				Labels: map[string]string{
					ExtensionLabelKey: ExtensionLabelValue,
				},
			},
			Spec: corev1.ServiceSpec{
				ClusterIP: "127.0.0.1",
				Ports: []corev1.ServicePort{
					{
						Port: extensionPorts[1],
					},
				},
			},
		},
	}

	nonExtensionServices := []corev1.Service{
		corev1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "non-extension",
				Namespace: installNamespace,
				Annotations: map[string]string{
					ExtensionUrlKey:            "/path",
					ExtensionBundleLocationKey: "Location",
					ExtensionDisplayNameKey:    "Display Name",
				},
			},
			Spec: corev1.ServiceSpec{
				Ports: []corev1.ServicePort{{Port: 9097}},
			},
		},
		corev1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "non-install-namespace-extension",
				Namespace: otherNamespace,
				UID:       types.UID(strconv.FormatInt(789+time.Now().UnixNano(), 10)),
				Annotations: map[string]string{
					ExtensionBundleLocationKey: "Location",
					ExtensionDisplayNameKey:    "Display Name",
				},
				Labels: map[string]string{
					ExtensionLabelKey: ExtensionLabelValue,
				},
			},
			Spec: corev1.ServiceSpec{
				ClusterIP: "127.0.0.1",
				Ports: []corev1.ServicePort{
					{
						Port: extensionPorts[1],
					},
				},
			},
		},
	}
	services := append(extensionServices, nonExtensionServices...)
	subscriber, _ := endpoints.ResourcesBroadcaster.Subscribe()
	for _, svc := range services {
		// Create, Delete, then reCreate each service to test register/unregister
		_, err := r.K8sClient.CoreV1().Services(svc.Namespace).Create(&svc)
		if err != nil {
			t.Fatalf("Error creating service '%s': %v\n", svc.Name, err)
		}
		err = r.K8sClient.CoreV1().Services(svc.Namespace).Delete(svc.Name, &metav1.DeleteOptions{})
		if err != nil {
			t.Fatalf("Error deleting service '%s': %v\n", svc.Name, err)
		}
		_, err = r.K8sClient.CoreV1().Services(svc.Namespace).Create(&svc)
		if err != nil {
			t.Fatalf("Error recreating service '%s': %v\n", svc.Name, err)
		}
	}

	timeout := time.After(10 * time.Second)
	var extensionCreates int
	var extensionDeletes int
	subChan := subscriber.SubChan()
	// Wait until all extension creates/deletes are registered by extensionInformer
	for {
		select {
		case <-timeout:
			t.Fatal("Timed out waiting for expected services to be registered")
		case event := <-subChan:
			switch event.MessageType {
			case broadcaster.ExtensionCreated:
				extensionCreates++
			case broadcaster.ExtensionDeleted:
				extensionDeletes++
			}
		}
		// All events captured from Create->Delete->Create above
		if extensionCreates == 2*len(extensionServices) && extensionDeletes == len(extensionServices) {
			break
		}
	}

	// Labels not supported on fake client, manual filter
	serviceList, err := r.K8sClient.CoreV1().Services(installNamespace).List(metav1.ListOptions{})
	if err != nil {
		t.Fatalf("Error obtaining services from K8sClient")
	}

	// Make requests by parsing service labels/annotations as extensions should
	for _, service := range serviceList.Items {
		if value := service.Labels[ExtensionLabelKey]; value == ExtensionLabelValue {
			// Grab endpoints from service annotation if any
			endpoints := strings.Split(service.Annotations[ExtensionUrlKey], ExtensionEndpointDelimiter)
			if len(endpoints) == 0 {
				endpoints = []string{""}
			}
			httpMethods := []string{"GET", "POST", "PUT", "DELETE"}
			// Look for response from registered routes
			for _, endpoint := range endpoints {
				for _, method := range httpMethods {
					proxyUrl := strings.TrimSuffix(fmt.Sprintf("%s%s/%s/%s", server.URL, ExtensionRoot, service.Name, endpoint), "/")
					t.Logf("PROXY URL: %s", proxyUrl)
					httpReq := testutils.DummyHTTPRequest(method, proxyUrl, nil)
					_, err := http.DefaultClient.Do(httpReq)
					if err != nil {
						t.Fatalf("Error getting response for %s with http method %s: %v\n", proxyUrl, method, err)
					}

					// Test registered route accepts subroute wildcard
					proxySubroute := proxyUrl + "/subroute1/subroute2"
					httpReq = testutils.DummyHTTPRequest(method, proxySubroute, nil)
					_, err = http.DefaultClient.Do(httpReq)
					if err != nil {
						t.Fatalf("Error getting response for %s with http method %s: %v\n", proxySubroute, method, err)
					}
				}
			}
		}
	}
	// Test getAllExtensions function
	httpReq := testutils.DummyHTTPRequest("GET", fmt.Sprintf("%s%s", server.URL, ExtensionRoot), nil)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("Error getting response for getAllExtensions: %v\n", err)
	}
	responseExtensions := []Extension{}
	if err := json.NewDecoder(response.Body).Decode(&responseExtensions); err != nil {
		t.Fatalf("Error decoding getAllExtensions response: %v\n", err)
	}

	// Verify the response
	if len(responseExtensions) != len(extensionServices) {
		t.Fatalf("Number of extensions: expected: %d, returned: %d", len(extensionServices), len(responseExtensions))
	}
}
