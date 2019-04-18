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

package endpoints

import (
	"strconv"
	"net/http/httputil"
	"net/url"
	"net/http"

	"github.com/tektoncd/dashboard/pkg/utils"
	restful "github.com/emicklei/go-restful"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	corev1 "k8s.io/api/core/v1"
)

// extensionLabel - service with this extensionLabel is registered as extension
const extensionLabel =  "tekton-dashboard-extension=true"  
// urlKey - extension path is specified by the annotation with the urlKey 
const urlKey = "tekton-dashboard-endpoints"
// bundleLocatonKey - extension UI bundle location annotation 
const bundleLocationKey = "tekton-dashboard-bundle-location"
// displayNameKey - extension display name annotation 
const displayNameKey = "tekton-dashboard-display-name"

// Register APIs to interface with core Tekton/K8s pieces
func (r Resource) RegisterEndpoints(container *restful.Container) {
	wsv1 := new(restful.WebService)
	wsv1.
		Path("/v1/namespaces").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)

	logging.Log.Info("Adding v1, and API for pipelines")

	wsv1.Route(wsv1.GET("/{namespace}/pipeline").To(r.getAllPipelines))
	wsv1.Route(wsv1.GET("/{namespace}/pipeline/{name}").To(r.getPipeline))

	wsv1.Route(wsv1.GET("/{namespace}/pipelinerun").To(r.getAllPipelineRuns))
	wsv1.Route(wsv1.GET("/{namespace}/pipelinerun/{name}").To(r.getPipelineRun))
	wsv1.Route(wsv1.PUT("/{namespace}/pipelinerun/{name}").To(r.updatePipelineRun))

	wsv1.Route(wsv1.GET("/{namespace}/pipelineresource").To(r.getAllPipelineResources))
	wsv1.Route(wsv1.GET("/{namespace}/pipelineresource/{name}").To(r.getPipelineResource))

	wsv1.Route(wsv1.GET("/{namespace}/task").To(r.getAllTasks))
	wsv1.Route(wsv1.GET("/{namespace}/task/{name}").To(r.getTask))

	wsv1.Route(wsv1.GET("/{namespace}/taskrun").To(r.getAllTaskRuns))
	wsv1.Route(wsv1.GET("/{namespace}/taskrun/{name}").To(r.getTaskRun))

	wsv1.Route(wsv1.GET("/{namespace}/log/{name}").To(r.getPodLog))

	wsv1.Route(wsv1.GET("/{namespace}/taskrunlog/{name}").To(r.getTaskRunLog))

	wsv1.Route(wsv1.GET("/{namespace}/pipelinerunlog/{name}").To(r.getPipelineRunLog))

	wsv1.Route(wsv1.GET("/{namespace}/credential").To(r.getAllCredentials))
	wsv1.Route(wsv1.GET("/{namespace}/credential/{name}").To(r.getCredential))
	wsv1.Route(wsv1.POST("/{namespace}/credential").To(r.createCredential))
	wsv1.Route(wsv1.PUT("/{namespace}/credential/{name}").To(r.updateCredential))
	wsv1.Route(wsv1.DELETE("/{namespace}/credential/{name}").To(r.deleteCredential))

	wsv1.Route(wsv1.GET("/{namespace}/extension").To(r.getAllExtensions))
	container.Add(wsv1)
}

// RegisterWebsocket - this registers a websocket with which we can send log information to
func (r Resource) RegisterWebsocket(container *restful.Container) {
	logging.Log.Info("Adding API for websocket")
	wsv2 := new(restful.WebService)
	wsv2.
		Path("/v1/websocket").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	wsv2.Route(wsv2.GET("/logs").To(r.establishPipelineLogsWebsocket))
	wsv2.Route(wsv2.GET("/pipelineruns").To(r.establishPipelineRunsWebsocket))
	container.Add(wsv2)
}

// RegisterHealthProbes - this registers the /health endpoint
func (r Resource) RegisterHealthProbes(container *restful.Container) {
	logging.Log.Info("Adding API for health")
	wsv3 := new(restful.WebService)
	wsv3.
		Path("/health")

	wsv3.Route(wsv3.GET("").To(r.checkHealth))

	container.Add(wsv3)
}

// RegisterReadinessProbes - this registers the /readiness endpoint
func (r Resource) RegisterReadinessProbes(container *restful.Container) {
	logging.Log.Info("Adding API for readiness")
	wsv4 := new(restful.WebService)
	wsv4.
		Path("/readiness")

	wsv4.Route(wsv4.GET("").To(r.checkHealth))

	container.Add(wsv4)
}

// Back-end extension: Requests to the URL are passed through to the Port of the Name service (extension)
// "label: tekton-dashboard-extension=true" in the service defines the extension
// "annotation: tekton-dashboard-endpoints=<URL>" specifies the path for the extension
type Extension struct {
	Name           string  `json:"name"`
	URL            string  `json:"url"`
	Port           string  `json:"port"`
	DisplayName    string  `json:"displayname"`
	BundleLocation string  `json:"bundlelocation"`
}
var	extensions     []Extension

// RegisterExtensions - this discovers the extensions and registers them as the REST API extension 
func (r Resource) RegisterExtensions(container *restful.Container, namespace string) {
	logging.Log.Info("Adding API for extensions")
	svcs, err := r.K8sClient.CoreV1().Services(namespace).List(metav1.ListOptions{LabelSelector: extensionLabel})
	if err != nil {
		logging.Log.Errorf("error occurred whilst looking for extensions: %s", err)
		return
	}
	ws := new(restful.WebService)
	ws.
		Path("/").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)

	for _, svc := range svcs.Items {
		url, ok := svc.ObjectMeta.Annotations[urlKey]
		if ok {
			logging.Log.Debugf("Extension URL: %s", url)
			ext := Extension { Name: svc.ObjectMeta.Name, URL: url, Port: getPort(svc),
 				DisplayName: svc.ObjectMeta.Annotations[displayNameKey],
				BundleLocation: svc.ObjectMeta.Annotations[bundleLocationKey]}
			// extension handler is registered at the url
			ws.Route(ws.GET(url).To(ext.HandleExtension))
			ws.Route(ws.POST(url).To(ext.HandleExtension))
			ws.Route(ws.PUT(url).To(ext.HandleExtension))
			ws.Route(ws.DELETE(url).To(ext.HandleExtension))
			extensions = append(extensions, ext)
		}
	}
	logging.Log.Debugf("Extension: %+v", extensions)
	container.Add(ws)

	logging.Log.Info("Adding API for extension")
	wsv1 := new(restful.WebService)
	wsv1.
		Path("/v1/extension")

	wsv1.Route(wsv1.GET("").To(r.getAllExtensions))

	container.Add(wsv1)
}

// HandleExtension - this routes request to the extension service
func (ext Extension) HandleExtension(request *restful.Request, response *restful.Response) {
	target, err := url.Parse("http://" +  ext.Name + ":" + ext.Port + "/")
	if err != nil {
		utils.RespondError(response, err, http.StatusInternalServerError)
		return
	}
	proxy := httputil.NewSingleHostReverseProxy(target)
	proxy.ServeHTTP(response, request.Request)
}

/* Get all extensions in the installed namespace */
func (r Resource) getAllExtensions(request *restful.Request, response *restful.Response) {
	logging.Log.Debugf("In getAllExtensions")
	logging.Log.Debugf("Extension: %+v", extensions)

	response.AddHeader("Content-Type", "application/json")
	response.WriteEntity(extensions)
}

// getPort - this gets the port of the service
func getPort(svc corev1.Service) string {
	return strconv.Itoa(int(svc.Spec.Ports[0].Port))
}
// Write Content-Location header within POST methods and set StatusCode to 201
// Headers MUST be set before writing to body (if any) to succeed
func writeResponseLocation(request *restful.Request, response *restful.Response, identifier string) {
	location := request.Request.URL.Path
	if request.Request.Method == http.MethodPost {
		location = location + "/" + identifier
	}
	response.AddHeader("Content-Location", location)
	response.WriteHeader(201)
}
