/*
Copyright 2019-2020 The Tekton Authors
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
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"sync"

	restful "github.com/emicklei/go-restful"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// ExtensionLabelKey is the label key required by services to be registered as a
// dashboard extension
const ExtensionLabelKey = "tekton-dashboard-extension"

// ExtensionLabelValue is the label value required by services to be registered
// as a dashboard extension
const ExtensionLabelValue = "true"

// ExtensionURLKey specifies the valid extension paths, defaults to "/"
const ExtensionURLKey = "tekton-dashboard-endpoints"

// ExtensionEndpointDelimiter is the Delimiter to be used between the extension
// endpoints annotation value
const ExtensionEndpointDelimiter = "."

// ExtensionBundleLocationKey IS the UI bundle location annotation key
const ExtensionBundleLocationKey = "tekton-dashboard-bundle-location"

// ExtensionDisplayNameKey is the display name annotation key
const ExtensionDisplayNameKey = "tekton-dashboard-display-name"

// ExtensionRoot is the URL root when accessing extensions
const ExtensionRoot = "/v1/extensions"

const webResourcesDir = "/var/run/ko"

var webResourcesStaticPattern = regexp.MustCompile("^/([[:alnum:]]+\\.)?[[:alnum:]]+\\.(js)|(css)|(png)$")
var webResourcesStaticExcludePattern = regexp.MustCompile("^/favicon.png$")

// Register returns an HTTP handler that has the Dashboard REST API registered
func Register(resource endpoints.Resource) *Handler {
	logging.Log.Info("Registering all endpoints")
	h := &Handler{
		Container:       restful.NewContainer(),
		uidExtensionMap: make(map[string]*Extension),
	}

	registerWeb(h.Container)
	registerPropertiesEndpoint(resource, h.Container)
	registerWebsocket(resource, h.Container)
	registerHealthProbe(resource, h.Container)
	registerReadinessProbe(resource, h.Container)
	registerKubeAPIProxy(resource, h.Container)
	registerCSRFTokenEndpoint(resource, h.Container)
	registerLogsProxy(resource, h.Container)
	h.registerExtensions()
	return h
}

// Handler is an HTTP handler with internal configuration to avoid global state
type Handler struct {
	*restful.Container
	// extensionWebService is the exposed dynamic route webservice that
	// extensions are added to
	extensionWebService *restful.WebService
	uidExtensionMap     map[string]*Extension
	sync.RWMutex
}

// RegisterExtension registers a discovered extension service as a webservice
// to the container/mux. The extension should have a unique name
func (h *Handler) RegisterExtension(extensionService *corev1.Service) *Extension {
	logging.Log.Infof("Adding Extension %s", extensionService.Name)

	ext := newExtension(extensionService)
	h.Lock()
	defer h.Unlock()
	// Add routes for extension service
	for _, path := range ext.endpoints {
		extensionPath := extensionPath(ext.Name, path)
		// Routes
		h.extensionWebService.Route(h.extensionWebService.GET(extensionPath).To(ext.handleExtension))
		h.extensionWebService.Route(h.extensionWebService.POST(extensionPath).To(ext.handleExtension))
		h.extensionWebService.Route(h.extensionWebService.PUT(extensionPath).To(ext.handleExtension))
		h.extensionWebService.Route(h.extensionWebService.DELETE(extensionPath).To(ext.handleExtension))
		// Subroutes
		h.extensionWebService.Route(h.extensionWebService.GET(extensionPath + "/{var:*}").To(ext.handleExtension))
		h.extensionWebService.Route(h.extensionWebService.POST(extensionPath + "/{var:*}").To(ext.handleExtension))
		h.extensionWebService.Route(h.extensionWebService.PUT(extensionPath + "/{var:*}").To(ext.handleExtension))
		h.extensionWebService.Route(h.extensionWebService.DELETE(extensionPath + "/{var:*}").To(ext.handleExtension))
	}
	h.uidExtensionMap[string(extensionService.UID)] = ext
	return ext
}

// UnregisterExtension unregisters an extension. This should be called BEFORE
// registration of extensionService on informer update
func (h *Handler) UnregisterExtension(extensionService *corev1.Service) *Extension {
	return h.UnregisterExtensionByMeta(&extensionService.ObjectMeta)
}

// UnregisterExtensionByMeta unregisters an extension by its metadata. This
// should be called BEFORE registration of extensionService on informer update
func (h *Handler) UnregisterExtensionByMeta(extensionService metav1.Object) *Extension {
	logging.Log.Infof("Removing extension %s", extensionService.GetName())
	h.Lock()
	defer h.Unlock()

	// Grab endpoints to remove from service
	uid := extensionService.GetUID()
	ext := h.uidExtensionMap[string(uid)]
	defer delete(h.uidExtensionMap, string(uid))
	for _, path := range ext.endpoints {
		extensionPath := extensionPath(ext.Name, path)
		fullPath := fmt.Sprintf("%s/%s", h.extensionWebService.RootPath(), extensionPath)
		// Routes must be removed individually and should correspond to the above registration
		h.extensionWebService.RemoveRoute(fullPath, "GET")
		h.extensionWebService.RemoveRoute(fullPath, "POST")
		h.extensionWebService.RemoveRoute(fullPath, "PUT")
		h.extensionWebService.RemoveRoute(fullPath, "DELETE")
		h.extensionWebService.RemoveRoute(fullPath+"/{var:*}", "GET")
		h.extensionWebService.RemoveRoute(fullPath+"/{var:*}", "POST")
		h.extensionWebService.RemoveRoute(fullPath+"/{var:*}", "PUT")
		h.extensionWebService.RemoveRoute(fullPath+"/{var:*}", "DELETE")
	}
	return ext
}

// registerExtensions registers the WebService responsible for
// proxying to all extensions and also the endpoint to get all extensions
func (h *Handler) registerExtensions() {
	logging.Log.Info("Adding API for Extensions")
	extensionWebService := new(restful.WebService)
	extensionWebService.SetDynamicRoutes(true)
	extensionWebService.
		Path(ExtensionRoot).
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	extensionWebService.Route(extensionWebService.GET("").To(h.getAllExtensions))
	h.Add(extensionWebService)
	h.extensionWebService = extensionWebService
}

type RedactedExtension struct {
	Name           string `json:"name"`
	DisplayName    string `json:"displayname"`
	BundleLocation string `json:"bundlelocation"`
	endpoints      []string
}

// getExtensions gets all of the registered extensions on the handler
func (h *Handler) getExtensions() []RedactedExtension {
	h.RLock()
	defer h.RUnlock()

	extensions := []RedactedExtension{}
	for _, e := range h.uidExtensionMap {
		redactedExtension := RedactedExtension{
			Name:           e.Name,
			DisplayName:    e.DisplayName,
			BundleLocation: e.BundleLocation,
			endpoints:      e.endpoints,
		}
		extensions = append(extensions, redactedExtension)
	}
	return extensions
}

// getAllExtensions returns all of the extensions within the install namespace
func (h *Handler) getAllExtensions(request *restful.Request, response *restful.Response) {
	logging.Log.Debugf("In getAllExtensions")
	extensions := h.getExtensions()
	logging.Log.Debugf("Extensions: %+v", extensions)
	response.WriteEntity(extensions)
}

func registerKubeAPIProxy(r endpoints.Resource, container *restful.Container) {
	proxy := new(restful.WebService)
	proxy.Filter(restful.NoBrowserCacheFilter)
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

	fs := http.FileServer(http.Dir(webResourcesDir))
	container.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if webResourcesStaticPattern.Match([]byte(r.URL.Path)) && !webResourcesStaticExcludePattern.Match([]byte(r.URL.Path)) {
			// Static resources are immutable and have a content hash in their URL
			w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		}
		w.Header().Set("X-Frame-Options", "deny")
		fs.ServeHTTP(w, r)
	}))
}

// registerWebsocket registers a websocket with which we can send log
// information
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

// registerHealthProbes registers the /health endpoint
func registerHealthProbe(r endpoints.Resource, container *restful.Container) {
	logging.Log.Info("Adding API for health")
	wsv3 := new(restful.WebService)
	wsv3.
		Path("/health")

	wsv3.Route(wsv3.GET("").To(r.CheckHealth))

	container.Add(wsv3)
}

// registerReadinessProbes registers the /readiness endpoint
func registerReadinessProbe(r endpoints.Resource, container *restful.Container) {
	logging.Log.Info("Adding API for readiness")
	wsv4 := new(restful.WebService)
	wsv4.
		Path("/readiness")

	wsv4.Route(wsv4.GET("").To(r.CheckHealth))

	container.Add(wsv4)
}

// registerPropertiesEndpoint adds the endpoint for obtaining any properties we
// want to serve.
func registerPropertiesEndpoint(r endpoints.Resource, container *restful.Container) {
	logging.Log.Info("Adding API for properties")
	wsDefaults := new(restful.WebService)
	wsDefaults.Filter(restful.NoBrowserCacheFilter)
	wsDefaults.
		Path("/v1/properties").
		Consumes(restful.MIME_JSON, "text/plain").
		Produces(restful.MIME_JSON, "text/plain")

	wsDefaults.Route(wsDefaults.GET("/").To(r.GetProperties))
	container.Add(wsDefaults)
}

func registerCSRFTokenEndpoint(r endpoints.Resource, container *restful.Container) {
	ws := new(restful.WebService)
	ws.Filter(restful.NoBrowserCacheFilter)
	ws.Path("/v1/token").Produces("text/plain")
	ws.Route(ws.GET("/").To(r.GetToken))
	container.Add(ws)
}

func registerLogsProxy(r endpoints.Resource, container *restful.Container) {
	if r.Options.ExternalLogsURL != "" {
		ws := new(restful.WebService)
		ws.Path("/v1/logs-proxy").Produces("text/plain")
		ws.Route(ws.GET("/{subpath:*}").To(r.LogsProxy))
		container.Add(ws)
	}
}

// Extension is the back-end representation of an extension. A service is an
// extension when it is in the dashboard namespace with the dashboard label
// key/value pair. Endpoints are specified with the extension URL annotation
type Extension struct {
	Name           string   `json:"name"`
	URL            *url.URL `json:"url"`
	Port           string   `json:"port"`
	DisplayName    string   `json:"displayname"`
	BundleLocation string   `json:"bundlelocation"`
	endpoints      []string
}

// newExtension returns a new extension
func newExtension(extService *corev1.Service) *Extension {
	port := getServicePort(extService)
	url, _ := url.ParseRequestURI(fmt.Sprintf("http://%s:%s", extService.Spec.ClusterIP, port))
	return &Extension{
		Name:           extService.ObjectMeta.Name,
		URL:            url,
		Port:           port,
		DisplayName:    extService.ObjectMeta.Annotations[ExtensionDisplayNameKey],
		BundleLocation: extService.ObjectMeta.Annotations[ExtensionBundleLocationKey],
		endpoints:      getExtensionEndpoints(extService.ObjectMeta.Annotations[ExtensionURLKey]),
	}
}

// MarshalJSON marshals the Extension into JSON. This override is explicitly
// declared since url.URL will marshal each component, where a single field of
// the string representation is desired. An alias for Extension is used to
// prevent a stack overflow
func (e Extension) MarshalJSON() ([]byte, error) {
	type Alias Extension
	return json.Marshal(&struct {
		URL string `json:"url"`
		*Alias
	}{
		URL:   e.URL.String(),
		Alias: (*Alias)(&e),
	})
}

// handleExtension handles requests to the extension service by stripping the
// extension root prefix from the request URL and reverse proxying
func (e Extension) handleExtension(request *restful.Request, response *restful.Response) {
	logging.Log.Debugf("Request Path: %s %+v", request.Request.Method, request.Request.URL.Path)
	request.Request.URL.Path = strings.TrimPrefix(request.Request.URL.Path, fmt.Sprintf("%s/%s", ExtensionRoot, e.Name))
	// Explicitly route to root, better visibility in logs
	if request.Request.URL.Path == "" {
		request.Request.URL.Path = "/"
	}
	logging.Log.Debugf("Proxy Path: %s %+v", request.Request.Method, request.Request.URL.Path)
	proxy := httputil.NewSingleHostReverseProxy(e.URL)
	proxy.ServeHTTP(response, request.Request)
}

// getExtensionEndpoints sanitizes the delimited endpoints
func getExtensionEndpoints(delimited string) []string {
	endpoints := strings.Split(delimited, ExtensionEndpointDelimiter)
	if endpoints == nil {
		return []string{""}
	}
	for i := range endpoints {
		// Remove trailing/leading slashes
		endpoints[i] = strings.TrimSuffix(endpoints[i], "/")
		endpoints[i] = strings.TrimPrefix(endpoints[i], "/")
	}
	return endpoints
}

// extensionPath constructs the extension path (excluding the root) used by
// restful.Route
func extensionPath(extName, path string) string {
	return strings.TrimSuffix(fmt.Sprintf("%s/%s", extName, path), "/")
}

// getServicePort returns the target port if exists or the source port otherwise
func getServicePort(svc *corev1.Service) string {
	if svc.Spec.Ports[0].TargetPort.StrVal != "" {
		return svc.Spec.Ports[0].TargetPort.String()
	}
	return strconv.Itoa(int(svc.Spec.Ports[0].Port))
}
