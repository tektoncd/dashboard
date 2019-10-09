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

package router

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"

	restful "github.com/emicklei/go-restful"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/utils"
	corev1 "k8s.io/api/core/v1"
)

// Label key required by services to be registered as a dashboard extension
const ExtensionLabelKey = "tekton-dashboard-extension"

// Label value required by services to be registered as a dashboard extension
const ExtensionLabelValue = "true"

// Full label required by services to be registered as a dashboard extension
const ExtensionLabel = ExtensionLabelKey + "=" + ExtensionLabelValue

// Annotation that specifies the valid extension path, defaults to "/"
const ExtensionUrlKey = "tekton-dashboard-endpoints"

// Delimiter to be used between the extension endpoints annotation value
const ExtensionEndpointDelimiter = "."

// Extension UI bundle location annotation
const ExtensionBundleLocationKey = "tekton-dashboard-bundle-location"

// Extension display name annotation
const ExtensionDisplayNameKey = "tekton-dashboard-display-name"

// extensionRoot
const ExtensionRoot = "/v1/extensions"

var webResourcesDir = os.Getenv("WEB_RESOURCES_DIR")

func Register(resource endpoints.Resource) *restful.Container {
	wsContainer := restful.NewContainer()
	wsContainer.Router(restful.CurlyRouter{})

	logging.Log.Info("Registering all endpoints")
	registerWeb(wsContainer)
	registerEndpoints(resource, wsContainer)
	registerPropertiesEndpoint(resource, wsContainer)
	registerWebsocket(resource, wsContainer)
	registerHealthProbe(resource, wsContainer)
	registerReadinessProbe(resource, wsContainer)
	registerExtensions(wsContainer)
	registerKubeAPIProxy(resource, wsContainer)
	return wsContainer
}

func registerKubeAPIProxy(r endpoints.Resource, container *restful.Container) {
	proxy := new(restful.WebService)
	proxy.Consumes(restful.MIME_JSON, "text/plain", "application/json-patch+json").
		Produces(restful.MIME_JSON, "text/plain", "application/json-patch+json").
		Path("/proxy")

	logging.Log.Info("Adding Kube API Proxy")

	proxy.Route(proxy.GET("/{subpath:*}").To(r.ProxyRequest))
	proxy.Route(proxy.POST("/{subpath:*}").To(r.ProxyRequest))
	proxy.Route(proxy.PUT("/{subpath:*}").To(r.ProxyRequest))
	proxy.Route(proxy.DELETE("/{subpath:*}").To(r.ProxyRequest))
	proxy.Route(proxy.PATCH("/{subpath:*}").To(r.ProxyRequest))
	container.Add(proxy)
}

func registerWeb(container *restful.Container) {
	logging.Log.Info("Adding Web API")

	container.Handle("/", http.FileServer(http.Dir(webResourcesDir)))
}

// Register APIs to interface with core Tekton/K8s pieces
func registerEndpoints(r endpoints.Resource, container *restful.Container) {
	wsv1 := new(restful.WebService)
	wsv1.
		Path("/v1/namespaces").
		Consumes(restful.MIME_JSON, "text/plain").
		Produces(restful.MIME_JSON, "text/plain")

	logging.Log.Info("Adding v1, and API for k8s resources and pipelines")

	wsv1.Route(wsv1.POST("/{namespace}/rebuild").To(r.RebuildPipelineRun))
	wsv1.Route(wsv1.GET("/{namespace}/ingress").To(r.GetIngress))
	wsv1.Route(wsv1.GET("/{namespace}/endpoints").To(r.GetEndpoints))

	wsv1.Route(wsv1.GET("/{namespace}/taskrunlogs/{name}").To(r.GetTaskRunLog))
	wsv1.Route(wsv1.GET("/{namespace}/pipelinerunlogs/{name}").To(r.GetPipelineRunLog))

	container.Add(wsv1)

}

// RegisterWebsocket - this registers a websocket with which we can send log information to
func registerWebsocket(r endpoints.Resource, container *restful.Container) {
	logging.Log.Info("Adding API for websocket")
	wsv2 := new(restful.WebService)
	wsv2.
		Path("/v1/websockets").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	wsv2.Route(wsv2.GET("/resources").To(r.EstablishResourcesWebsocket))
	container.Add(wsv2)
}

// RegisterHealthProbes - this registers the /health endpoint
func registerHealthProbe(r endpoints.Resource, container *restful.Container) {
	logging.Log.Info("Adding API for health")
	wsv3 := new(restful.WebService)
	wsv3.
		Path("/health")

	wsv3.Route(wsv3.GET("").To(r.CheckHealth))

	container.Add(wsv3)
}

// RegisterReadinessProbes - this registers the /readiness endpoint
func registerReadinessProbe(r endpoints.Resource, container *restful.Container) {
	logging.Log.Info("Adding API for readiness")
	wsv4 := new(restful.WebService)
	wsv4.
		Path("/readiness")

	wsv4.Route(wsv4.GET("").To(r.CheckHealth))

	container.Add(wsv4)
}

// Add endpoint for obtaining any properties we want to serve, such as install namespace
func registerPropertiesEndpoint(r endpoints.Resource, container *restful.Container) {
	logging.Log.Info("Adding API for properties")
	wsDefaults := new(restful.WebService)
	wsDefaults.
		Path("/v1/properties").
		Consumes(restful.MIME_JSON, "text/plain").
		Produces(restful.MIME_JSON, "text/plain")

	wsDefaults.Route(wsDefaults.GET("/").To(r.GetProperties))
	container.Add(wsDefaults)
}

// Back-end extension: Requests to the URL are passed through to the Port of the Name service (extension)
// "label: tekton-dashboard-extension=true" in the service defines the extension
// "annotation: tekton-dashboard-endpoints=<URL>" specifies the path for the extension
type Extension struct {
	Name           string `json:"name"`
	URL            string `json:"url"`
	Port           string `json:"port"`
	DisplayName    string `json:"displayname"`
	BundleLocation string `json:"bundlelocation"`
}

// Informer only receives services and must be able to map to WebService/Extension
var extensionMutex *sync.RWMutex = new(sync.RWMutex)
var extensionWebService *restful.WebService
var uidExtensionMap map[string]Extension = make(map[string]Extension)

// Registers the WebService responsible for proxying to all extensions and also to getAll extensions
func registerExtensions(container *restful.Container) {
	logging.Log.Info("Adding API for Extensions")
	extensionWebService = new(restful.WebService)
	extensionWebService.SetDynamicRoutes(true)
	extensionWebService.
		Path(ExtensionRoot).
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	extensionWebService.Route(extensionWebService.GET("").To(getAllExtensions))
	container.Add(extensionWebService)
}

func GetExtensions() []Extension {
	extensions := []Extension{}
	extensionMutex.RLock()
	for _, e := range uidExtensionMap {
		extensions = append(extensions, e)
	}
	extensionMutex.RUnlock()
	return extensions
}

/* Get all extensions in the installed namespace */
func getAllExtensions(request *restful.Request, response *restful.Response) {
	logging.Log.Debugf("In getAllExtensions")
	extensions := GetExtensions()
	logging.Log.Debugf("Extensions: %+v", extensions)
	response.WriteEntity(extensions)
}

// If the string passed is empty, return slice with empty string
func getExtensionEndpoints(delimited string) []string {
	endpoints := strings.Split(delimited, ExtensionEndpointDelimiter)
	for i := range endpoints {
		// Remove trailing/leading slashes
		endpoints[i] = strings.TrimSuffix(endpoints[i], "/")
		endpoints[i] = strings.TrimPrefix(endpoints[i], "/")
	}
	if len(endpoints) == 0 {
		endpoints = append(endpoints, "")
	}
	return endpoints
}

// Add a discovered extension as a webservice (that must have a unique rootPath) to the container/mux
func RegisterExtension(extensionService *corev1.Service) {
	logging.Log.Infof("Adding Extension %s", extensionService.Name)

	// May be empty
	endpoints := extensionService.ObjectMeta.Annotations[ExtensionUrlKey]
	ext := Extension{
		Name:           extensionService.ObjectMeta.Name,
		URL:            extensionService.Spec.ClusterIP,
		Port:           getServicePort(*extensionService),
		DisplayName:    extensionService.ObjectMeta.Annotations[ExtensionDisplayNameKey],
		BundleLocation: extensionService.ObjectMeta.Annotations[ExtensionBundleLocationKey],
	}
	// Service does not have a ClusterIP
	if ext.URL == "" {
		logging.Log.Errorf("Extension service %s does not have ClusterIP. Cannot add route", extensionService.Name)
		return
	}
	paths := getExtensionEndpoints(endpoints)

	extensionMutex.Lock()
	defer extensionMutex.Unlock()
	// Add routes for extension service
	for _, path := range paths {
		// Prepend extension name
		fullPath := strings.TrimSuffix(fmt.Sprintf("%s/%s", ext.Name, path), "/")
		debugFullPath := fmt.Sprintf("%s/%s", extensionWebService.RootPath(), fullPath)
		logging.Log.Debugf("Registering path: %s", debugFullPath)
		// Routes
		extensionWebService.Route(extensionWebService.GET(fullPath).To(ext.handleExtension))
		extensionWebService.Route(extensionWebService.POST(fullPath).To(ext.handleExtension))
		extensionWebService.Route(extensionWebService.PUT(fullPath).To(ext.handleExtension))
		extensionWebService.Route(extensionWebService.DELETE(fullPath).To(ext.handleExtension))
		// Subroutes
		extensionWebService.Route(extensionWebService.GET(fullPath + "/{var:*}").To(ext.handleExtension))
		extensionWebService.Route(extensionWebService.POST(fullPath + "/{var:*}").To(ext.handleExtension))
		extensionWebService.Route(extensionWebService.PUT(fullPath + "/{var:*}").To(ext.handleExtension))
		extensionWebService.Route(extensionWebService.DELETE(fullPath + "/{var:*}").To(ext.handleExtension))
	}
	uidExtensionMap[string(extensionService.UID)] = ext
}

// Should be called PRIOR to registration of extensionService on informer update
func UnregisterExtension(extensionService *corev1.Service) {
	logging.Log.Infof("Removing extension %s", extensionService.Name)
	serviceRootPath := fmt.Sprintf("%s/%s", extensionWebService.RootPath(), extensionService.Name)
	extensionMutex.Lock()
	defer extensionMutex.Unlock()
	// Grab endpoints to remove from service
	paths := getExtensionEndpoints(extensionService.ObjectMeta.Annotations[ExtensionUrlKey])
	for _, path := range paths {
		fullPath := strings.TrimSuffix(fmt.Sprintf("%s/%s", serviceRootPath, path), "/")
		// Routes must be removed individually and should correspond to the above registration
		extensionWebService.RemoveRoute(fullPath, "GET")
		extensionWebService.RemoveRoute(fullPath, "POST")
		extensionWebService.RemoveRoute(fullPath, "PUT")
		extensionWebService.RemoveRoute(fullPath, "DELETE")
		extensionWebService.RemoveRoute(fullPath+"/{var:*}", "GET")
		extensionWebService.RemoveRoute(fullPath+"/{var:*}", "POST")
		extensionWebService.RemoveRoute(fullPath+"/{var:*}", "PUT")
		extensionWebService.RemoveRoute(fullPath+"/{var:*}", "DELETE")
	}
	delete(uidExtensionMap, string(extensionService.UID))
}

// HandleExtension - this routes request to the extension service
func (ext Extension) handleExtension(request *restful.Request, response *restful.Response) {
	target, err := url.Parse("http://" + ext.URL + ":" + ext.Port)
	if err != nil {
		utils.RespondError(response, err, http.StatusInternalServerError)
		return
	}
	logging.Log.Debugf("Request Path: %s %+v", request.Request.Method, request.Request.URL.Path)
	request.Request.URL.Path = strings.TrimPrefix(request.Request.URL.Path, fmt.Sprintf("%s/%s", ExtensionRoot, ext.Name))
	// Explicitly route to root, better visibility in logs
	if request.Request.URL.Path == "" {
		request.Request.URL.Path = "/"
	}
	logging.Log.Debugf("Proxy   Path: %s %+v", request.Request.Method, request.Request.URL.Path)
	proxy := httputil.NewSingleHostReverseProxy(target)
	proxy.ServeHTTP(response, request.Request)
}

// Returns target port if exists, else source == target
func getServicePort(svc corev1.Service) string {
	if svc.Spec.Ports[0].TargetPort.StrVal != "" {
		return svc.Spec.Ports[0].TargetPort.String()
	}
	return strconv.Itoa(int(svc.Spec.Ports[0].Port))
}
