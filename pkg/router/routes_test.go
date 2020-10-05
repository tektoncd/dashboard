package router_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"reflect"
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	"github.com/tektoncd/dashboard/pkg/router"
	. "github.com/tektoncd/dashboard/pkg/router"
	"github.com/tektoncd/dashboard/pkg/testutils"
	v1alpha1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	v1beta1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1beta1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
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
	ExtensionRoot,    // Response codes dictated by extension logic
	"health",         // Returns 204
	"readiness",      // Returns 204
	"proxy",          // Kube API server has its own standard
	"properties",     // Pods and namespace will not exist
}

var methodRouteMap = make(map[string][]string) // k, v := HTTP_METHOD, []route
// Stores names of resources created using POST endpoints in case id/name is modified from payload (for example, pipelineRun)
var routeNameMap = make(map[string]string)

// Populate methodMap
// Router parameters are NOT replaced
func init() {
	server, _, _ := testutils.DummyServer()
	mux, _ := server.Config.Handler.(*Handler)
	for _, registeredWebservices := range mux.Container.RegisteredWebServices() {
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
	return nil
}

// Creates resources for GET/{name} routes without corresponding POST to prevent lookup failures
func makeFake(t *testing.T, r *endpoints.Resource, resourceType, namespace, resourceName string) {
	t.Logf("Making fake resource %s with name %s\n", resourceType, resourceName)
	switch resourceType {
	case "task":
		task := v1beta1.Task{
			ObjectMeta: metav1.ObjectMeta{
				Name:      resourceName,
				Namespace: namespace,
			},
		}
		_, err := r.PipelineClient.TektonV1beta1().Tasks(namespace).Create(&task)
		if err != nil {
			t.Fatalf("Error creating task: %v\n", err)
		}
	case "taskrun":
		taskRun := v1beta1.TaskRun{
			ObjectMeta: metav1.ObjectMeta{
				Name:      resourceName,
				Namespace: namespace,
			},
		}
		_, err := r.PipelineClient.TektonV1beta1().TaskRuns(namespace).Create(&taskRun)
		if err != nil {
			t.Fatalf("Error creating taskRun: %v\n", err)
		}
	case "pipeline":
		pipeline := v1beta1.Pipeline{
			ObjectMeta: metav1.ObjectMeta{
				Name:      resourceName,
				Namespace: namespace,
			},
		}
		_, err := r.PipelineClient.TektonV1beta1().Pipelines(namespace).Create(&pipeline)
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
	case "pipelineresource":
		pipelineResource := v1alpha1.PipelineResource{
			ObjectMeta: metav1.ObjectMeta{
				Name:      resourceName,
				Namespace: namespace,
			},
		}
		_, err := r.PipelineResourceClient.TektonV1alpha1().PipelineResources(namespace).Create(&pipelineResource)
		if err != nil {
			t.Fatalf("Error creating pipelineResource: %v\n", err)
		}
	}
}

func TestMarshalJSON_Extension(t *testing.T) {
	tests := []struct {
		name      string
		extension Extension
		json      []byte
	}{
		{
			name: "Extension 1",
			extension: Extension{
				Name: "ext1",
				URL: &url.URL{
					Scheme: "http",
					Host:   "127.0.0.1",
					Path:   "/",
				},
				Port:           "8080",
				DisplayName:    "display",
				BundleLocation: "bundle",
			},
			json: []byte(`{"url":"http://127.0.0.1/","name":"ext1","port":"8080","displayname":"display","bundlelocation":"bundle"}`),
		},
	}
	for i := range tests {
		t.Run(tests[i].name, func(t *testing.T) {
			json, err := tests[i].extension.MarshalJSON()
			if err != nil {
				t.Fatal(err)
			}
			if diff := cmp.Diff(tests[i].json, json); diff != "" {
				t.Errorf("MarshalJSON() mismatch (-want +got):\n%s", diff)
			}
		})
	}
}

func TestGetAllExtensions(t *testing.T) {
	server, r, _ := testutils.DummyServer()
	defer server.Close()

	annotations := make(map[string]string)
	annotations["tekton-dashboard-bundle-location"] = "web/extension.86386c2c.js"
	annotations["tekton-dashboard-display-name"] = "Webhooks"
	annotations["tekton-dashboard-endpoints"] = "webhooks.web"

	labels := make(map[string]string)
	labels["app"] = "webhooks-extension"
	labels["tekton-dashboard-extension"] = "true"

	servicePort := corev1.ServicePort{
		NodePort: 30810, Port: 8080, TargetPort: intstr.FromInt(8080),
	}
	servicePorts := []corev1.ServicePort{servicePort}

	service := corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:        "testExtension",
			Namespace:   "tekton-pipelines",
			Annotations: annotations,
			Labels:      labels,
			UID:         "65e6ab11-939b-486a-b2f1-323675676c84",
		},
		Spec: corev1.ServiceSpec{
			ClusterIP: "172.30.155.248",
			Ports:     servicePorts,
		},
	}
	h := router.Register(*r)
	h.RegisterExtension(&service)
	server.Config.Handler = h

	httpReq := testutils.DummyHTTPRequest("GET", fmt.Sprintf("%s/v1/extensions", server.URL), nil)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("Error getting extensions: %s", err.Error())
	}

	var extensions []RedactedExtension
	if err := json.NewDecoder(response.Body).Decode(&extensions); err != nil {
		t.Fatalf("Error decoding getAllExtensions response: %v\n", err)
	}

	url, _ := url.ParseRequestURI(fmt.Sprintf("http://%s:%d", service.Spec.ClusterIP, servicePort.TargetPort.IntVal))

	structValue := reflect.ValueOf((extensions[0]))
	structType := structValue.Type()

	// This test is roughly to check that the Extension struct is not returned
	// as it contains a URL element that exposes the IP address.
	for i := 0; i < structValue.NumField(); i++ {
		if structType.Field(i).Name == "URL" {
			t.Error("URL was returned and would expose sensitive data")
		}
		if structValue.Field(i).CanInterface() {
			if structValue.Field(i).Interface() == url {
				t.Error("URL was found exposing sensitive data")
			}
		}
	}
}
