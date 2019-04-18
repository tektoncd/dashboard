package endpoints

import (
	"os"
	"bytes"
	"strings"
	"testing"
	"encoding/json"
	"net/http"
	"net/http/httptest"

	restful "github.com/emicklei/go-restful"
	"github.com/satori/go.uuid"

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
			route := strings.Replace(r.Path,"{namespace}","fake",1)
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
			t.Errorf("Content-Location header not provided in %s method for resource type: %s",request.Method,getResourceType(request.URL.Path, request.Method))
		} else {
			// "Content-Location" header is only set with single value
			resourceLocations = append(resourceLocations,contentLocation[0])
		}
	}
	// Make requests for all existing POST routes (POST data to get Content-Location header)
	makeRequests(t,methodMap[http.MethodPost],http.MethodPost,postFunc)
	// Validate Content-Location header
	makeRequests(t,resourceLocations,http.MethodGet,nil)
}

func TestPut204(t *testing.T) {
	t.Log("Checking 204 for PUT Routes")
	// Creating resources first, then update
	var resourceLocations []string
	postFunc := func(t *testing.T, request *http.Request, response *http.Response) {
		contentLocation, ok := response.Header["Content-Location"]
		if !ok {
			t.Errorf("Content-Location header not provided in %s method for resource type: %s",request.Method,getResourceType(request.URL.Path, request.Method))
		} else {
			// "Content-Location" header is only set with single value
			resourceLocations = append(resourceLocations,contentLocation[0])
		}
	}
	makeRequests(t,methodMap[http.MethodPost],http.MethodPost,postFunc)
	// Check for 204
	putFunc := func(t *testing.T, request *http.Request, response *http.Response) {
		if response.StatusCode != 204 {
			t.Error("Status code not set to 204")
		}
	}
	makeRequests(t,resourceLocations,http.MethodPut,putFunc)

}

func makeRequests(t *testing.T, routes []string, httpMethod string, postFunc func(t *testing.T, request *http.Request, response *http.Response)) {
	for _, route := range routes {
		t.Logf("%s method: %s",httpMethod,route)
		requestBody := makeRequestBody(t,route,httpMethod)
		request := dummyHTTPRequest(httpMethod,server.URL+route,requestBody)
		response, err := http.DefaultClient.Do(request)
		if err != nil {
			t.Error("Response error from server:",err)
			continue
		}
		t.Log("Response from server:",response)
		if postFunc != nil {
			postFunc(t,request,response)
		}
	}
}

func makeRequestBody(t *testing.T, route string, httpMethod string) *bytes.Reader {
	if httpMethod == http.MethodPost || httpMethod == http.MethodPut {
		resourceType := getResourceType(route,httpMethod)
		var resource interface{}
		// Pass the identifier for what is being updated
		if httpMethod != http.MethodPost {
			identifierIndex := strings.LastIndex(route,"/")+1
			resource = fakeCRD(t,resourceType,route[identifierIndex:])
		} else {
			// Get unique identifier
			resource = fakeCRD(t,resourceType,"")
		}
		if resource == nil {
			return nil
		}
		var requestBody *bytes.Reader
		b, err := json.Marshal(&resource)
		if err != nil {
			t.Error("Failed to marshal resource type:",resourceType)
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
	i := strings.Index(route,namespace)+len(namespace)+1
	if httpMethod == http.MethodPost {
		return route[i:]
	}
	i2 := strings.Index(route[i:],"/")
	return route[i:i+i2]
}


func fakeCRD(t *testing.T, crdType string, identifier string,) interface{} {
	// Use this as the CRD identifier 
	if identifier == "" {
		identifier = uuid.NewV4().String()
	}
	switch crdType {
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
		t.Error("Fake template does not exist for crdType:",crdType)
		return nil
	}
}

// 
func TestExtensionRegistration(t *testing.T) {
	t.Log("Checking extension registration")

	wsContainer := restful.NewContainer()
	resource := dummyResource()
	// Correct extension
	resource.K8sClient.CoreV1().Services(namespace).Create(
		&corev1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name: "extension", 
				Annotations: map[string]string {"tekton-dashboard-endpoints": "/path", "tekton-dashboard-bundle-location": "Location", "tekton-dashboard-display-name": "Display Name"}, 
				Labels: map[string]string {"tekton-dashboard-extension": "true",},
			},
			Spec: corev1.ServiceSpec {
				Ports: []corev1.ServicePort{{Port: 9097}},
			},
		},
	)
	// Not extension
	resource.K8sClient.CoreV1().Services(namespace).Create(
		&corev1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name: "none-extension", 
				Annotations: map[string]string {"tekton-dashboard-endpoints": "/path", "tekton-dashboard-bundle-location": "Location", "tekton-dashboard-display-name": "Display Name"}, 
			},
			Spec: corev1.ServiceSpec {
				Ports: []corev1.ServicePort{{Port: 9097}},
			},
		},
	)
	// Extension without path
	resource.K8sClient.CoreV1().Services(namespace).Create(
		&corev1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name: "extension-missing-path", 
				Annotations: map[string]string {"tekton-dashboard-bundle-location": "Location", "tekton-dashboard-display-name": "Display Name"}, 
				Labels: map[string]string {"tekton-dashboard-extension": "true",},
			},
			Spec: corev1.ServiceSpec {
				Ports: []corev1.ServicePort{{Port: 9097}},
			},
		},
	)
	resource.RegisterExtension(wsContainer, namespace)
	routes := wsContainer.RegisteredWebServices()[0].Routes()
	if len(routes) != 4 {
		t.Errorf("Number of routes: expected: %d, returned: %d", 4, len(routes))
		return
	}
	if routes[0].Path != "/path" {
		t.Errorf("Correct path is not returned: %s", routes[0].Path)
	}


	// Test getAllExtensions function
	// Sample request and response
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/fake/extension/", nil)
	req := dummyRestfulRequest(httpReq, "fake", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	//  Test the function
	resource.getAllExtensions(req, resp)

	// Decode the response
	result := []Extension{}
	json.NewDecoder(httpWriter.Body).Decode(&result)

	// Verify the response
	if len(result) != 1 {
		t.Errorf("Number of tasks: expected: %d, returned: %d", 1, len(result))
		return
	}
	if result[0].Name != "extension" {
		t.Errorf("Extension is not returned: %s", result[0].Name)
	}
}
