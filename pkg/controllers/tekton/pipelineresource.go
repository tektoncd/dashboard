package tekton

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	v1alpha1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	tektoninformer "github.com/tektoncd/pipeline/pkg/client/informers/externalversions"
	"k8s.io/client-go/tools/cache"
)

// NewPipelineResourceController registers a Tekton controller/informer for
// pipelineResources on the sharedTektonInformerFactory
func NewPipelineResourceController(sharedTektonInformerFactory tektoninformer.SharedInformerFactory) {
	logging.Log.Debug("In NewPipelineResourceController")
	pipelineResourceInformer := sharedTektonInformerFactory.Tekton().V1alpha1().PipelineResources().Informer()
	pipelineResourceInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    pipelineResourceCreated,
		UpdateFunc: pipelineResourceUpdated,
		DeleteFunc: pipelineResourceDeleted,
	})
}

//pipelineResource events
func pipelineResourceCreated(obj interface{}) {
	logging.Log.Debugf("PipelineResource Controller detected pipelineResource '%s' created", obj.(*v1alpha1.PipelineResource).Name)
	data := broadcaster.SocketData{
		MessageType: broadcaster.PipelineResourceCreated,
		Payload:     obj,
	}
	endpoints.ResourcesChannel <- data
}

func pipelineResourceUpdated(oldObj, newObj interface{}) {
	if newObj.(*v1alpha1.PipelineResource).GetResourceVersion() != oldObj.(*v1alpha1.PipelineResource).GetResourceVersion() {
		logging.Log.Debugf("PipelineResource Controller detected pipelineResource '%s' updated", oldObj.(*v1alpha1.PipelineResource).Name)
		data := broadcaster.SocketData{
			MessageType: broadcaster.PipelineResourceUpdated,
			Payload:     newObj,
		}
		endpoints.ResourcesChannel <- data
	}
}

func pipelineResourceDeleted(obj interface{}) {
	logging.Log.Debugf("PipelineResource Controller detected pipelineResource '%s' deleted", obj.(*v1alpha1.PipelineResource).Name)
	data := broadcaster.SocketData{
		MessageType: broadcaster.PipelineResourceDeleted,
		Payload:     obj,
	}
	endpoints.ResourcesChannel <- data
}
