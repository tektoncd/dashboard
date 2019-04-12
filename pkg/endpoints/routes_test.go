package endpoints

import (
	"os"
	"bytes"
	"strings"
	"testing"
	"regexp"
	"encoding/json"
	"net/http"
	"net/http/httptest"

	restful "github.com/emicklei/go-restful"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)


var server *httptest.Server
var methodMap = make(map[string][]string) // k, v := HTTP_METHOD, []route

// Set up
func TestMain(m *testing.M) {
	wsContainer := restful.NewContainer()

	resource := dummyResource()
	namespace := "fake"
	resource.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})

	resource.RegisterEndpoints(wsContainer)
	resource.RegisterWebsocket(wsContainer)
	resource.RegisterHealthProbes(wsContainer)
	resource.RegisterReadinessProbes(wsContainer)

	regex := regexp.MustCompile("{[^}]*}")
	for _, ws := range wsContainer.RegisteredWebServices() {
		for _, r := range ws.Routes() {
			// /{namespace}/pipeline/{name} -> /fake/pipeline/fake
			// This replacement makes the following assumption:
			// The below tests should only create one instance of particular CRDs where the identifier is also "fake"
			fakeRoute := regex.ReplaceAllLiteralString(r.Path,"fake")
			methodMap[r.Method] = append(methodMap[r.Method], fakeRoute)
		}
	}

	// Remove all Put methods that do not have a corresponding POST
	// Cannot update what can not be created
	postMap := make(map[string]struct{})
	for _, route := range methodMap[http.MethodPost] {
		postMap[route] = struct{}{}
	}

	oldPutRoutes := methodMap[http.MethodPut]
	var newPutRoutes []string
	for _, route := range oldPutRoutes {
		if _, ok := postMap[route]; ok {
			newPutRoutes = append(newPutRoutes, route)
		}
	}
	methodMap[http.MethodPut] = newPutRoutes

	server = httptest.NewServer(wsContainer)
	os.Exit(m.Run())
}


func Test201Url(t *testing.T) {
	// POST ROUTES:
	t.Log("Checking POST routes for 201 StatusCode and valid Content-Location header")
	// Make requests for all existing POST routes (POST data to get Content-Location header)
	checkPostRoutes := sendRequests(t,methodMap[http.MethodPost],http.MethodPost)
	// Validate Content-Location header
	getRequests(t,checkPostRoutes)

	// PUT ROUTES:
	t.Log("Checking PUT routes for 201 StatusCode and valid Content-Location header")
	// Make requests for all existing PUT routes (PUT "updates" data to the same values as POST to get Content-Location header)
	checkPutRoutes := sendRequests(t,methodMap[http.MethodPut],http.MethodPut)
	// Validate Content-Location header
	getRequests(t,checkPutRoutes)
}

// POST/PUT CRDs according to routes
// Return Content-Location of resources created
func sendRequests(t *testing.T, routes []string, httpMethod string) []string {
	var resourceLocations []string
	for _, route := range routes {
		t.Logf("%s method: %s",httpMethod,route)
		resourceType := getResourceType(route,httpMethod)
		resource := fakeCRD(t,resourceType)
		if resource == nil {
			continue
		}
		b, err := json.Marshal(&resource)
		if err != nil {
			t.Error("Failed to marshal resource type:",resourceType)
			continue
		}
		requestBody := bytes.NewReader(b)
		request := dummyHTTPRequest(httpMethod,server.URL+route,requestBody)
		t.Log("Request URL:",request.URL)
		response, err := http.DefaultClient.Do(request)
		if err != nil {
			t.Error("Response error from server:",err)
			continue
		}
		t.Log("Response from server:",response)
		if response.StatusCode != 201 {
			t.Error("Status code not set to 201")
		}
		contentLocation, ok := response.Header["Content-Location"]
		if !ok {
			t.Errorf("Content-Location header not provided in %s method for resource type: %s",httpMethod,resourceType)
		} else {
			// "Content-Location" header is only set with single value
			resourceLocations = append(resourceLocations,contentLocation[0])
		}
	}
	return resourceLocations
}

// Check that resource exists
func getRequests(t *testing.T, routes []string) {
	for _, route := range routes {
		t.Log("GET method:",route)
		request := dummyHTTPRequest(http.MethodGet,server.URL+route,bytes.NewReader([]byte{}))
		t.Log("Request URL:",request.URL)
		response, err := http.DefaultClient.Do(request)
		if err != nil {
			t.Error("Response error from server:",err)
			continue
		}
		t.Log("Response from server:",response)
	}
}

func getResourceType(route string, httpMethod string) string {
	switch httpMethod {
	case http.MethodPost:
		resourceIndex := strings.LastIndex(route,"/") + 1
		return route[resourceIndex:]
	case http.MethodGet:
		fallthrough
	case http.MethodPut:
		lastIndex := strings.LastIndex(route,"/")
		secondLastIndex := strings.LastIndex(route[:lastIndex],"/")
		return route[secondLastIndex+1:lastIndex]
	default:
		return ""
	}
}

// All identifiers/names must be set to "fake"
func fakeCRD(t *testing.T, crdType string) interface{} {
	switch crdType {
	case "credential":
		return &credential{
			ID:          "fake",
			Username:    "personal-access-token",
			Password:    "passwordaccesstoken",
			Description: "access token credential",
			Type:        "accesstoken",
			URL: map[string]string{
				"tekton.dev/git-0": "https://github.com",
			},
		}
	default:
		t.Error("Fake template does not exist for crdType:",crdType)
		return nil
	}
}