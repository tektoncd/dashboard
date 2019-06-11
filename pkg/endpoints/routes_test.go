package endpoints

import (
	"bytes"
	"encoding/json"
	"fmt"
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
var fakePipelineRun *v1alpha1.PipelineRun

// Set up
const namespace string = "fake"

func TestMain(m *testing.M) {
	wsContainer := restful.NewContainer()

	resource := dummyResource()
	resource.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})

	pipeline := v1alpha1.Pipeline{}
	pipeline.Name = "fakepipeline"

	createdPipeline, err := resource.PipelineClient.TektonV1alpha1().Pipelines(namespace).Create(&pipeline)
	if err != nil {
		fmt.Printf("Error creating the fake pipeline to use: %s", err)
	}
	pipelineRunData := v1alpha1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "fakeresource",
			Namespace: namespace,
			Labels: map[string]string{
				"app":          "tekton-app",
				gitServerLabel: "github.com",
				gitOrgLabel:    "foo",
				gitRepoLabel:   "bar",
			},
		},

		Spec: v1alpha1.PipelineRunSpec{
			PipelineRef:    v1alpha1.PipelineRef{Name: createdPipeline.Name},
			Trigger:        v1alpha1.PipelineTrigger{Type: v1alpha1.PipelineTriggerTypeManual},
			ServiceAccount: "default",
			Timeout:        &metav1.Duration{Duration: 1 * time.Hour},
			Resources:      nil,
			Params:         nil,
			Status:         "",
		},
	}

	fakePipelineRun, err = resource.PipelineClient.TektonV1alpha1().PipelineRuns(namespace).Create(&pipelineRunData)
	if err != nil {
		fmt.Printf("Error creating the fake pipelinerun to use for tests: %s", err)
	}

	resource.RegisterWeb(wsContainer)
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

func TestGetWeb200(t *testing.T) {
	t.Log("Checking GET route for 200 StatusCode")

	getFunc := func(t *testing.T, request *http.Request, response *http.Response) {
		t.Log("Response from server:", response)
		if response.StatusCode != 200 {
			t.Error("Status code not set to 200")
		}
	}

	httpReq, _ := http.NewRequest(http.MethodGet, server.URL+"/", bytes.NewReader([]byte{}))
	response, _ := http.DefaultClient.Do(httpReq)
	getFunc(t, httpReq, response)
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
	putFunc := func(t *testing.T, request *http.Request, response *http.Response) {
		if response.StatusCode != 204 {
			t.Error("Status code not set to 204")
		}
	}
	// Make requests for all existing PUT routes
	makeRequests(t, methodMap[http.MethodPut], http.MethodPut, putFunc)
}

func TestDelete204(t *testing.T) {
	t.Log("Checking 204 for DELETE Routes")
	deleteFunc := func(t *testing.T, request *http.Request, response *http.Response) {
		if response.StatusCode != 204 {
			t.Error("Status code not set to 204")
		}
	}
	// Make requests for all existing DELETE routes
	makeRequests(t, methodMap[http.MethodDelete], http.MethodDelete, deleteFunc)
}

func makeRequests(t *testing.T, routes []string, httpMethod string, postFunc func(t *testing.T, request *http.Request, response *http.Response)) {
	for _, route := range routes {
		t.Logf("%s method: %s", httpMethod, route)
		requestBody := makeRequestBody(t, route, httpMethod)
		var request http.Request

		if httpMethod == http.MethodPost {
			request = *dummyHTTPRequest(httpMethod, server.URL+route, requestBody)
		} else {
			withID := strings.Replace(server.URL+route, "{name}", "fakeresource", -1)
			fmt.Printf("With ID replaced {name} with fakeresource is %s \n", withID)
			request = *dummyHTTPRequest(httpMethod, withID, requestBody)
		}
		response, err := http.DefaultClient.Do(&request)
		if err != nil {
			t.Error("Response error from server:", err)
			continue
		}
		t.Log("Response from server:", response)
		if postFunc != nil {
			postFunc(t, &request, response)
		}
	}
}

func makeRequestBody(t *testing.T, route string, httpMethod string) *bytes.Reader {
	if httpMethod == http.MethodPost || httpMethod == http.MethodPut {
		resourceType := getResourceType(route, httpMethod)
		var resource interface{}
		// Pass the identifier for what is being updated
		if httpMethod != http.MethodPost {
			// It's a PUT, we only support testing POSTs and PUTs currently
			identifierIndex := strings.LastIndex(route, "/") + 1
			routeToUse := route[identifierIndex:]
			fmt.Printf("Route to use is %s for resource type %s \n", routeToUse, resourceType)
			resource = fakeCRD(t, resourceType, routeToUse)

		} else {
			// Get unique identifier - this is for a POST
			resource = fakeCRD(t, resourceType, "")
		}
		if resource == nil {
			return nil
		}
		var requestBody *bytes.Reader
		var body []byte
		var err error

		if resourceType == "pipelineruns" {
			// request body should be status: PipelineRunCancelled
			if httpMethod == http.MethodPut {
				updateBody := PipelineRunUpdateBody{}
				updateBody.STATUS = "PipelineRunCancelled"
				body, err = json.Marshal(updateBody)
				if err != nil {
					t.Errorf("Failed to marshal resource type for PipelineRunUpdate: %s", err)
					return nil
				}
			} else {
				createBody := ManualPipelineRun{}
				createBody.PIPELINENAME = "fakepipeline"
				body, err = json.Marshal(createBody)
				if err != nil {
					t.Errorf("Failed to marshal resource type for PipelineRunCreate: %s", err)
					return nil
				}
			}

		} else {
			body, err = json.Marshal(&resource)
			if err != nil {
				t.Errorf("Failed to marshal resource type: %s, error: %s", resourceType, err)
				return nil
			}
		}

		requestBody = bytes.NewReader(body)
		return requestBody
	}
	return bytes.NewReader([]byte{})
}

// Extract the CRD after namespace (set as "fake")
// .../fake/credential/{name} -> credential
func getResourceType(route string, httpMethod string) string {
	i := strings.Index(route, namespace) + len(namespace) + 1
	if httpMethod == http.MethodPost {
		theType := route[i:]
		fmt.Printf("Resource type (we're in a POST method) is: %s \n", theType)
		return theType
	}
	secondFinding := strings.Index(route[i:], "/")
	theType := route[i : i+secondFinding]
	fmt.Printf("Resource type (we're in a PUT method) is: %s \n", theType)
	return theType
}

func fakeCRD(t *testing.T, crdType string, identifier string) interface{} {
	// Use this as the CRD identifier
	if identifier == "" {
		identifier = uuid.NewV4().String()
	}
	fmt.Printf("Creating a fake CRD for resource type %s \n", crdType)

	switch crdType {
	case "pipelineruns":
		{
			return fakePipelineRun
		}
	case "credentials":
		return &credential{
			Name:        "fakeresource",
			Username:    "thisismyusername",
			Password:    "password",
			Description: "cred de jour",
			URL: map[string]string{
				"tekton.dev/git-0": "https://github.com",
			},
		}
	default:
		t.Error("Fake template does not exist for crdType:", crdType)
		return nil
	}
}

func TestExtensionRegistration(t *testing.T) {
	t.Log("Checking extension registration")

	wsContainer := restful.NewContainer()
	resource := dummyResource()
	// Correct extension
	resource.K8sClient.CoreV1().Services(namespace).Create(
		&corev1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name:        "extension",
				Annotations: map[string]string{"tekton-dashboard-endpoints": "first.next.last", "tekton-dashboard-bundle-location": "Location", "tekton-dashboard-display-name": "Display Name"},
				Labels:      map[string]string{"tekton-dashboard-extension": "true"},
			},
			Spec: corev1.ServiceSpec{
				Ports: []corev1.ServicePort{{Port: 9097}},
			},
		},
	)
	// No endpoints
	resource.K8sClient.CoreV1().Services(namespace).Create(
		&corev1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name:        "extension2",
				Annotations: map[string]string{"tekton-dashboard-bundle-location": "Location", "tekton-dashboard-display-name": "Display Name"},
				Labels:      map[string]string{"tekton-dashboard-extension": "true"},
			},
			Spec: corev1.ServiceSpec{
				Ports: []corev1.ServicePort{{Port: 9097}},
			},
		},
	)
	// Not extension
	resource.K8sClient.CoreV1().Services(namespace).Create(
		&corev1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name:        "none-extension",
				Annotations: map[string]string{"tekton-dashboard-endpoints": "/path", "tekton-dashboard-bundle-location": "Location", "tekton-dashboard-display-name": "Display Name"},
			},
			Spec: corev1.ServiceSpec{
				Ports: []corev1.ServicePort{{Port: 9097}},
			},
		},
	)
	resource.RegisterExtensions(wsContainer, namespace)
	routes := wsContainer.RegisteredWebServices()[0].Routes()
	// Remove first route (getAllExtensions)
	routes = routes[1:]

	checkRouteMap := map[string]int{}
	// Labels not supported on fake client, manual filter
	serviceList, err := resource.K8sClient.CoreV1().Services(namespace).List(metav1.ListOptions{})
	if err != nil {
		t.Errorf("Error obtaining services from K8sClient")
	}

	// Extract all endpoints from extension services
	endpoints := []string{}
	for _, service := range serviceList.Items {
		if extensionLabel := service.Annotations["tekton-dashboard-extension"]; extensionLabel == "true" {
			extensionName := service.Name
			endpointSlice := strings.Split(service.Annotations["tekton-dashboard-endpoints"], ".")
			switch len(endpointSlice) {
			case 0:
				endpoints = append(endpoints, extensionName)
			default:
				for _, e := range endpointSlice {
					endpoints = append(endpoints, fmt.Sprintf("%s/%s", extensionName, e))
				}
			}
		}
	}

	// Tally all the registered routes for each extension path
	for _, route := range routes {
		if !strings.Contains(route.Path, "{var:*}") {
			continue
		}
		noRootRoute := strings.TrimPrefix(route.Path, "/v1"+extensionRoot+"/")
		extensionPath := noRootRoute[:strings.LastIndex(noRootRoute, "/")]
		checkRouteMap[extensionPath]++
	}
	var checkSize int
	// Ensure all extension paths have the same number of routes registered
	for extensionName, count := range checkRouteMap {
		if checkSize == 0 {
			checkSize = count
		}
		if checkSize != count {
			t.Errorf("Extension %s did not have all expected routes", extensionName)
		}
	}
	// Ensure all routes were not empty
	if checkSize == 0 {
		t.Error("No routes registered on extensions")
	}

	// Test getAllExtensions function
	// Sample request and response
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1"+extensionRoot, nil)
	req := dummyRestfulRequest(httpReq, "fake", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	//  Test the function
	resource.getAllExtensions(req, resp)

	// Decode the response
	result := []Extension{}
	json.NewDecoder(httpWriter.Body).Decode(&result)

	// Verify the response
	if len(result) != 2 {
		t.Errorf("Number of entries: expected: %d, returned: %d", 2, len(result))
		return
	}
	if result[0].Name != "extension" {
		t.Errorf("Extension is not returned: %s", result[0].Name)
	}
}
