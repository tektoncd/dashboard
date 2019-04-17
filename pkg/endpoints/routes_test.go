package endpoints

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	restful "github.com/emicklei/go-restful"
	"github.com/satori/go.uuid"
	v1alpha1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

var server *httptest.Server
var methodMap = make(map[string][]string) // k, v := HTTP_METHOD, []route

// Set up
const namespace string = "fake"

func TestMain(m *testing.M) {
	wsContainer := restful.NewContainer()

	resource := dummyResource()
	resource.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})

	resource.RegisterEndpoints(wsContainer)
	resource.RegisterWebsocket(wsContainer)
	resource.RegisterHealthProbes(wsContainer)
	resource.RegisterReadinessProbes(wsContainer)

	for _, ws := range wsContainer.RegisteredWebServices() {
		for _, r := range ws.Routes() {
			route := strings.Replace(r.Path, "{namespace}", "fake", 1)
			methodMap[r.Method] = append(methodMap[r.Method], route)
		}
	}
	server = httptest.NewServer(wsContainer)
	os.Exit(m.Run())
}

func TestContentLocation201(t *testing.T) {
	t.Log("Checking POST routes for 201 StatusCode and valid Content-Location header")
	var resourceLocations []string
	postFunc := func(t *testing.T, request *http.Request, response *http.Response) {
		if response.StatusCode != 201 {
			t.Error("Status code not set to 201")
		}
		contentLocation, ok := response.Header["Content-Location"]
		if !ok {
			t.Errorf("Content-Location header not provided in %s method for resource type: %s", request.Method, getResourceType(request.URL.Path, request.Method))
		} else {
			// "Content-Location" header is only set with single value
			resourceLocations = append(resourceLocations, contentLocation[0])
		}
	}
	// Make requests for all existing POST routes (POST data to get Content-Location header)
	makeRequests(t, methodMap[http.MethodPost], http.MethodPost, postFunc)
	// Validate Content-Location header
	makeRequests(t, resourceLocations, http.MethodGet, nil)
}

func TestPut204(t *testing.T) {
	t.Log("Checking 204 for PUT Routes")
	// Creating resources first, then update
	// We need a Pipeline to be created or we'll get a 404 for the PipelineRun update
	// For credentials we get a 400 currently

	/*
			--- FAIL: TestPut204 (0.01s)
		    routes_test.go:68: Checking 204 for PUT Routes
		    routes_test.go:93: PUT method: /v1/namespaces/fake/pipelinerun/{name}
				routes_test.go:101: Response from server: &{404 Not Found 404 HTTP/1.1 1 1 map[Content-Length:[42] Content-Type:[text/plain] Date:[Wed, 17 Apr 2019 10:17:53 GMT]] 0xc0000cbd40 42 [] false false map[] 0xc0003b0200 <nil>}

		    routes_test.go:74: Failed: Content-Location header not provided in PUT method for resource type: pipelinerun, response was: &{404 Not Found 404 HTTP/1.1 1 1 map[Content-Length:[42] Content-Type:[text/plain] Date:[Wed, 17 Apr 201910:17:53 GMT]] 0xc0000cbd40 42 [] false false map[] 0xc0003b0200 <nil>}
		    routes_test.go:93: PUT method: /v1/namespaces/fake/credential/{name}
				routes_test.go:101: Response from server: &{400 Bad Request 400 HTTP/1.1 1 1 map[Content-Length:[46] Content-Type:[text/plain] Date:[Wed, 17 Apr 2019 10:17:53 GMT]] 0xc0000ca800 46 [] false false map[] 0xc0003b0300 <nil>}

		    routes_test.go:74: Failed: Content-Location header not provided in PUT method for resource type: credential, response was: &{400 Bad Request 400 HTTP/1.1 1 1 map[Content-Length:[46] Content-Type:[text/plain] Date:[Wed, 17 Apr 2019 10:17:53 GMT]] 0xc0000ca800 46 [] false false map[] 0xc0003b0300 <nil>}
	*/

	var resourceLocations []string
	putFunc := func(t *testing.T, request *http.Request, response *http.Response) {
		contentLocation, ok := response.Header["Content-Location"]
		if !ok {
			t.Errorf("Failed: Content-Location header not provided in %s method for resource type: %s, response was: %v", request.Method, getResourceType(request.URL.Path, request.Method), response)
		} else {
			// "Content-Location" header is only set with single value
			resourceLocations = append(resourceLocations, contentLocation[0])
		}
	}
	makeRequests(t, methodMap[http.MethodPut], http.MethodPut, putFunc)
	// Check for 204
	putFunc = func(t *testing.T, request *http.Request, response *http.Response) {
		if response.StatusCode != 204 {
			t.Error("Status code not set to 204")
		}
	}
	makeRequests(t, resourceLocations, http.MethodPut, putFunc)

}

func makeRequests(t *testing.T, routes []string, httpMethod string, postFunc func(t *testing.T, request *http.Request, response *http.Response)) {
	for _, route := range routes {
		t.Logf("%s method: %s", httpMethod, route)
		requestBody := makeRequestBody(t, route, httpMethod)
		request := dummyHTTPRequest(httpMethod, server.URL+route, requestBody)
		response, err := http.DefaultClient.Do(request)
		if err != nil {
			t.Error("Response error from server:", err)
			continue
		}
		t.Log("Response from server:", response)
		if postFunc != nil {
			postFunc(t, request, response)
		}
	}
}

func makeRequestBody(t *testing.T, route string, httpMethod string) *bytes.Reader {
	if httpMethod == http.MethodPost || httpMethod == http.MethodPut {
		resourceType := getResourceType(route, httpMethod)
		var resource interface{}
		// Pass the identifier for what is being updated
		if httpMethod != http.MethodPost {
			identifierIndex := strings.LastIndex(route, "/") + 1
			resource = fakeCRD(t, resourceType, route[identifierIndex:])
		} else {
			// Get unique identifier
			resource = fakeCRD(t, resourceType, "")
		}
		if resource == nil {
			return nil
		}
		var requestBody *bytes.Reader
		b, err := json.Marshal(&resource)
		if err != nil {
			t.Error("Failed to marshal resource type:", resourceType)
			return nil
		}
		requestBody = bytes.NewReader(b)
		return requestBody
	}
	return bytes.NewReader([]byte{})
}

// Extract the CRD after namespace (set as "fake")
// .../fake/credential/{name} -> credential
func getResourceType(route string, httpMethod string) string {
	i := strings.Index(route, namespace) + len(namespace) + 1
	if httpMethod == http.MethodPost {
		return route[i:]
	}
	i2 := strings.Index(route[i:], "/")
	return route[i : i+i2]
}

func fakeCRD(t *testing.T, crdType string, identifier string) interface{} {
	// Use this as the CRD identifier
	if identifier == "" {
		identifier = uuid.NewV4().String()
	}
	switch crdType {

	case "pipelinerun":
		{

			pipeline := v1alpha1.Pipeline{}
			pipeline.Name = "fakepipeline"

			resource := dummyResource()

			createdPipeline, err := resource.PipelineClient.TektonV1alpha1().Pipelines(namespace).Create(&pipeline)
			if err != nil {
				t.Errorf("Error creating the fake pipeline to use: %s", err)
			}
			pipelineRunData := v1alpha1.PipelineRun{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "anything",
					Namespace: namespace,
					Labels: map[string]string{
						"app":          "",
						gitServerLabel: "github.com",
						gitOrgLabel:    "foo",
						gitRepoLabel:   "bar",
					},
				},

				Spec: v1alpha1.PipelineRunSpec{
					PipelineRef: v1alpha1.PipelineRef{Name: createdPipeline.Name},
					// E.g. v1alpha1.PipelineTriggerTypeManual
					Trigger:        v1alpha1.PipelineTrigger{Type: v1alpha1.PipelineTriggerTypeManual},
					ServiceAccount: "default",
					Timeout:        &metav1.Duration{Duration: 1 * time.Hour},
					Resources:      nil,
					Params:         nil,
				},
			}

			return pipelineRunData

		}
	case "credential":
		return &credential{
			Name:        identifier,
			Username:    "personal-access-token",
			Password:    "passwordaccesstoken",
			Description: "access token credential",
			Type:        "accesstoken",
			URL: map[string]string{
				"tekton.dev/git-0": "https://github.com",
			},
		}
	default:
		t.Error("Fake template does not exist for crdType:", crdType)
		return nil
	}
}
