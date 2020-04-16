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

// NewPipelineRunController registers a Tekton controller/informer for
// pipelineRuns on the sharedTektonInformerFactory
func NewPipelineRunController(sharedTektonInformerFactory tektoninformer.SharedInformerFactory) {
	logging.Log.Debug("In NewPipelineRunController")
	pipelineRunInformer := sharedTektonInformerFactory.Tekton().V1alpha1().PipelineRuns().Informer()
	pipelineRunInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    pipelineRunCreated,
		UpdateFunc: pipelineRunUpdated,
		DeleteFunc: pipelineRunDeleted,
	})
}

// pipeline run events
func pipelineRunCreated(obj interface{}) {
	logging.Log.Debugf("PipelineRun Controller detected pipelineRun '%s' created", obj.(*v1alpha1.PipelineRun).Name)
	data := broadcaster.SocketData{
		MessageType: broadcaster.PipelineRunCreated,
		Payload:     obj,
	}
	endpoints.ResourcesChannel <- data
}

func pipelineRunUpdated(oldObj, newObj interface{}) {
	if newObj.(*v1alpha1.PipelineRun).GetResourceVersion() != oldObj.(*v1alpha1.PipelineRun).GetResourceVersion() {
		logging.Log.Debugf("PipelineRun Controller detected pipelineRun '%s' updated", oldObj.(*v1alpha1.PipelineRun).Name)
		data := broadcaster.SocketData{
			MessageType: broadcaster.PipelineRunUpdated,
			Payload:     newObj,
		}
		endpoints.ResourcesChannel <- data
	}
}

func pipelineRunDeleted(obj interface{}) {
	logging.Log.Debugf("PipelineRun Controller detected pipelineRun '%s' deleted", utils.GetDeletedObjectMeta(obj).GetName())
	data := broadcaster.SocketData{
		MessageType: broadcaster.PipelineRunDeleted,
		Payload:     obj,
	}
	endpoints.ResourcesChannel <- data
}
