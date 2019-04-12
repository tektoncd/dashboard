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
)


var server *httptest.Server
var routeMap = make(map[string][]string) // k, v := HTTP_METHOD, []route
// Temporary measure as not all GET routes have corresponding POST, but the reverse is true
// After POST/PUT, populate this map with 'Content-Location' values to check for object
var getRoutesMap = make(map[string][]string) // k, v := HTTP_METHOD, []route

// Set up
func TestMain(m *testing.M) {
	wsContainer := restful.NewContainer()

	resource := dummyResource()
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
			routeMap[r.Method] = append(routeMap[r.Method], fakeRoute)
		}
	}

	server = httptest.NewServer(wsContainer)
	os.Exit(m.Run())
}


func Test201Url(t *testing.T) {
	// POST ROUTES:
	// Make requests for all existing POST routes (POST data to get Content-Location header)
	makeRequests(t,routeMap,http.MethodPost)
	// Gets are against individual resources, identifier populated above
	makeRequests(t,getRoutesMap,http.MethodGet)

	// Reset
	getRoutesMap = make(map[string][]string)

	// PUT ROUTES:
	// Make requests for all existing PUT routes (PUT "updates" data to the same values as POST to get Content-Location header)
	makeRequests(t,routeMap,http.MethodPut)
	// Gets are against individual resources, identifier populated above
	makeRequests(t,getRoutesMap,http.MethodGet)
}

// routeMap overrides global variable
func makeRequests(t *testing.T, routeMap map[string][]string, httpMethod string) {
	// Supported HTTP methods
	switch httpMethod {
	case http.MethodGet:
	case http.MethodPost:
	case http.MethodPut:
	default:
		t.Errorf("%s not supported",httpMethod)
	}

	for _, route := range routeMap[httpMethod] {
		t.Logf("%s method: %s",httpMethod,route)
		var resourceType string
		switch httpMethod {
		case http.MethodPost:
			resourceIndex := strings.LastIndex(route,"/") + 1
			resourceType = route[resourceIndex:]
		case http.MethodGet:
			fallthrough
		case http.MethodPut:
			lastIndex := strings.LastIndex(route,"/")
			secondLastIndex := strings.LastIndex(route[:lastIndex],"/")
			resourceType = route[secondLastIndex+1:lastIndex]
		}
		var requestBody *bytes.Reader
		if isDataMethod(httpMethod) {
			resource := fakeCRD(t,resourceType)
			if resource == nil {
				continue
			}
			b, err := json.Marshal(&resource)
			if err != nil {
				t.Error("Failed to marshal resource type:",resourceType)
				continue
			}
			requestBody = bytes.NewReader(b)
		}
		request := httptest.NewRequest(httpMethod,server.URL+route,requestBody)
		response, err := http.DefaultClient.Do(request)
		if err != nil {
			t.Error("Response error from server:",err)
			continue
		}
		if isDataMethod(httpMethod) {
			if response.StatusCode != 201 {
				t.Error("Status code not set to 201")
			}
			contentLocation, ok := response.Header["Content-Location"]
			if !ok {
				t.Errorf("Content-Location header not provided in %s method for resource type: %s",httpMethod,resourceType)
			} else {
				// We specify a single Content-Location, only grab first index
				getRoutesMap[http.MethodGet] = append(getRoutesMap[http.MethodGet], contentLocation[0])
			}
		}
	}
}

func isDataMethod(httpMethod string) bool {
	return httpMethod == http.MethodPost || httpMethod == http.MethodPut
}

func fakeCRD(t *testing.T, crdType string) interface{} {
	switch crdType {
	case "credential":
		return &credential{
			Id:          "credentialaccesstoken",
			Username:    "personal-access-token",
			Password:    "passwordaccesstoken",
			Description: "access token credential",
			Type:        "accesstoken",
			Url: map[string]string{
				"tekton.dev/git-0": "https://github.com",
			},
		}
	default:
		t.Error("Fake template does not exist for crdType:",crdType)
		return nil
	}
}