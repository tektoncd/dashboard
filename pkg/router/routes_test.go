package router_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"strconv"
	"time"

	"github.com/google/go-cmp/cmp"
	broadcaster "github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	. "github.com/tektoncd/dashboard/pkg/router"
	"github.com/tektoncd/dashboard/pkg/testutils"
	v1alpha1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	gock "gopkg.in/h2non/gock.v1"
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
	"/v1/websockets",   // No response code
	"rerun",            // Returns 201
	ExtensionRoot,      // Response codes dictated by extension logic
	"health",           // Returns 204
	"readiness",        // Returns 204
	"proxy",            // Kube API server has its own standard
	"ingress",          // Ingress will not exist
	"endpoints",        // Route or Ingress will not exist
	"dashboardversion", // Returns version of dashboard running
	"pipelineversion",  // Returns version of the pipelines running
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

// TestExtension is a mock integration test that asserts against the expected
// dynamic extension routes, which are handled by the informer controller
func TestExtension(t *testing.T) {
	tests := []struct {
		name               string
		extensionEndpoints []string
	}{
		{
			name: "Empty endpoints",
			extensionEndpoints: []string{
				"",
			},
		},
		{
			name: "One endpoint",
			extensionEndpoints: []string{
				"secrets",
			},
		},
		{
			name: "Two endpoints",
			extensionEndpoints: []string{
				"apples",
				"bananas",
			},
		},
		{
			name: "Three endpoint",
			extensionEndpoints: []string{
				"robots",
				"cowboys",
				"aliens",
			},
		},
	}
	for i := range tests {
		t.Run(tests[i].name, func(t *testing.T) {
			server, r, installNamespace := testutils.DummyServer()
			defer server.Close()
			// Subscribe for extension registration events
			subscriber, _ := endpoints.ResourcesBroadcaster.Subscribe()
			defer endpoints.ResourcesBroadcaster.Unsubscribe(subscriber)

			extensionService := &corev1.Service{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "extension",
					Namespace: installNamespace,
					UID:       types.UID(strconv.FormatInt(time.Now().UnixNano(), 10)),
					Annotations: map[string]string{
						ExtensionURLKey: strings.Join(tests[i].extensionEndpoints, ExtensionEndpointDelimiter),
					},
					Labels: map[string]string{
						ExtensionLabelKey: ExtensionLabelValue,
					},
				},
				Spec: corev1.ServiceSpec{
					ClusterIP: "127.0.0.1",
					Ports: []corev1.ServicePort{
						{
							Port: int32(8080),
						},
					},
				},
			}
			// Create extension service and await corresponding event
			_, err := r.K8sClient.CoreV1().Services(installNamespace).Create(extensionService)
			if err != nil {
				t.Fatalf("Error creating service '%s': %v\n", extensionService.Name, err)
			}
			select {
			case event := <-subscriber.SubChan():
				switch event.MessageType {
				case broadcaster.ExtensionCreated:
					break
				default:
					t.Fatalf("Unexpected event message type: %s", event.MessageType)
				}
			case <-time.After(time.Second):
				t.Fatalf("Timed out waiting for extension creation")
			}

			// Make requests to the extension endpoints(s) through the Dashboard
			// test server. Gock intercepts messages to the regex url below and
			// mocks a response
			replyCode := http.StatusNoContent
			extensionProxyRoot := fmt.Sprintf("%s%s/%s", server.URL, ExtensionRoot, extensionService.Name)
			defer gock.Off()
			gock.New(fmt.Sprintf("%s(.*)", extensionProxyRoot)).
				Persist().
				Reply(replyCode)

			for _, endpoint := range tests[i].extensionEndpoints {
				url := fmt.Sprintf("%s/%s", extensionProxyRoot, endpoint)
				for _, method := range []string{
					http.MethodGet,
					http.MethodPost,
					http.MethodPut,
					http.MethodDelete,
				} {
					httpReq := testutils.DummyHTTPRequest(method, url, bytes.NewBuffer(nil))
					resp, err := http.DefaultClient.Do(httpReq)
					if err != nil {
						t.Fatalf("Unexpected error accessing extension endpoint: %s", err)
					}
					if diff := cmp.Diff(replyCode, resp.StatusCode); diff != "" {
						t.Errorf("Extension response code mismatch: -want, +got: %s", diff)
					}
				}
			}

			// Delete extension service and await corresponding event
			err = r.K8sClient.CoreV1().Services(installNamespace).Delete(extensionService.Name, &metav1.DeleteOptions{})
			if err != nil {
				t.Fatalf("Error deleting service '%s': %v\n", extensionService.Name, err)
			}
			select {
			case event := <-subscriber.SubChan():
				switch event.MessageType {
				case broadcaster.ExtensionDeleted:
					break
				default:
					t.Fatalf("Unexpected event message type: %s", event.MessageType)
				}
			case <-time.After(time.Second):
				t.Fatal("Timed out waiting for extension deletion")
			}
		})
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
