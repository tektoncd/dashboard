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
	restful "github.com/emicklei/go-restful"
	eventsrcclient "github.com/knative/eventing-sources/pkg/client/clientset/versioned/typed/sources/v1alpha1"
	"github.com/tektoncd/pipeline/pkg/client/clientset/versioned"
	logging "github.ibm.com/swiss-cloud/devops-back-end/logging"
	k8sclientset "k8s.io/client-go/kubernetes"
)

// Store all types here that are reused throughout files
type Resource struct {
	PipelineClient versioned.Interface
	K8sClient      k8sclientset.Interface
	EventSrcClient eventsrcclient.SourcesV1alpha1Interface
}

// RegisterPipeline
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
	wsv1.Route(wsv1.POST("/{namespace}/pipelinerun").To(r.createPipelineRun))

	wsv1.Route(wsv1.GET("/{namespace}/pipelineresource").To(r.getAllPipelineResources))
	wsv1.Route(wsv1.GET("/{namespace}/pipelineresource/{name}").To(r.getPipelineResource))

	wsv1.Route(wsv1.GET("/{namespace}/task").To(r.getAllTasks))
	wsv1.Route(wsv1.GET("/{namespace}/task/{name}").To(r.getTask))

	wsv1.Route(wsv1.GET("/{namespace}/taskrun").To(r.getAllTaskRuns))
	wsv1.Route(wsv1.GET("/{namespace}/taskrun/{name}").To(r.getTaskRun))

	wsv1.Route(wsv1.GET("/{namespace}/log/{name}").To(r.getPodLog))

	wsv1.Route(wsv1.GET("/{namespace}/taskrunlog/{name}").To(r.getTaskRunLog))

	wsv1.Route(wsv1.GET("/{namespace}/pipelinerunlog/{name}").To(r.getPipelineRunLog))

	wsv1.Route(wsv1.GET("/{namespace}/githubsource/").To(r.getAllGitHubSource))
	wsv1.Route(wsv1.GET("/{namespace}/githubsource/{name}").To(r.getGitHubSource))
	wsv1.Route(wsv1.POST("/{namespace}/githubsource").To(r.createGitHubSource))
	wsv1.Route(wsv1.PUT("/{namespace}/githubsource/{name}").To(r.updateGitHubSource))
	wsv1.Route(wsv1.DELETE("/{namespace}/githubsource/{name}").To(r.deleteGitHubSource))

	wsv1.Route(wsv1.GET("/{namespace}/credentials/").To(r.getAllCredentials))
	wsv1.Route(wsv1.GET("/{namespace}/credentials/{id}").To(r.getCredential))
	wsv1.Route(wsv1.POST("/{namespace}/credentials").To(r.createCredential))
	wsv1.Route(wsv1.PUT("/{namespace}/credentials/{id}").To(r.updateCredential))
	wsv1.Route(wsv1.DELETE("/{namespace}/credentials/{id}").To(r.deleteCredential))

	wsv1.Route(wsv1.GET("/{namespace}/knative/installstatus").To(r.checkResourceRegistered))

	wsv1.Route(wsv1.GET("/{namespace}/health").To(r.checkHealth))

	container.Add(wsv1)
}

// RegisterWebhook ...
func (r Resource) RegisterWebhook(container *restful.Container) {
	logging.Log.Info("Adding API for webhook")
	ws := new(restful.WebService)
	ws.
		Path("/").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	ws.Route(ws.POST("").To(r.HandleWebhook))
	container.Add(ws)
}

func (r Resource) RegisterWebsocket(container *restful.Container) {
	logging.Log.Info("Adding API for websocket")
	wsv1 := new(restful.WebService)
	wsv1.
		Path("/v1/websocket").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)
	wsv1.Route(wsv1.GET("/logs").To(r.establishPipelineLogsWebsocket))
	wsv1.Route(wsv1.GET("/pipelineruns").To(r.establishPipelineRunsWebsocket))
	container.Add(wsv1)
}
