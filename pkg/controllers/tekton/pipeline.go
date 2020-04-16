package tekton

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/controllers/utils"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	v1alpha1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	tektoninformer "github.com/tektoncd/pipeline/pkg/client/informers/externalversions"
	"k8s.io/client-go/tools/cache"
)

// NewPipelineController registers a Tekton controller/informer for pipelines on
// the sharedTektonInformerFactory
func NewPipelineController(sharedTektonInformerFactory tektoninformer.SharedInformerFactory) {
	logging.Log.Debug("In NewPipelineController")
	pipelineInformer := sharedTektonInformerFactory.Tekton().V1alpha1().Pipelines().Informer()
	pipelineInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    pipelineCreated,
		UpdateFunc: pipelineUpdated,
		DeleteFunc: pipelineDeleted,
	})
}

// pipeline events
func pipelineCreated(obj interface{}) {
	logging.Log.Debugf("Pipeline Controller detected pipeline '%s' created", obj.(*v1alpha1.Pipeline).Name)
	data := broadcaster.SocketData{
		MessageType: broadcaster.PipelineCreated,
		Payload:     obj,
	}
	endpoints.ResourcesChannel <- data
}

func pipelineUpdated(oldObj, newObj interface{}) {
	if newObj.(*v1alpha1.Pipeline).GetResourceVersion() != oldObj.(*v1alpha1.Pipeline).GetResourceVersion() {
		logging.Log.Debugf("Pipeline Controller detected pipeline '%s' updated", oldObj.(*v1alpha1.Pipeline).Name)
		data := broadcaster.SocketData{
			MessageType: broadcaster.PipelineUpdated,
			Payload:     newObj,
		}
		endpoints.ResourcesChannel <- data
	}
}

func pipelineDeleted(obj interface{}) {
	logging.Log.Debugf("Pipeline Controller detected pipeline '%s' deleted", utils.GetDeletedObjectMeta(obj).GetName())
	data := broadcaster.SocketData{
		MessageType: broadcaster.PipelineDeleted,
		Payload:     obj,
	}
	endpoints.ResourcesChannel <- data
}
