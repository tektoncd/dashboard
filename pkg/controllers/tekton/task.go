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

// NewTaskController registers a Tekton controller/informer for tasks on
// the sharedTektonInformerFactory
func NewTaskController(sharedTektonInformerFactory tektoninformer.SharedInformerFactory) {
	logging.Log.Debug("In NewTaskController")
	taskInformer := sharedTektonInformerFactory.Tekton().V1alpha1().Tasks().Informer()
	taskInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    taskCreated,
		UpdateFunc: taskUpdated,
		DeleteFunc: taskDeleted,
	})
}

func taskCreated(obj interface{}) {
	logging.Log.Debugf("Task Controller detected task '%s' created", obj.(*v1alpha1.Task).Name)
	data := broadcaster.SocketData{
		MessageType: broadcaster.TaskCreated,
		Payload:     obj,
	}
	endpoints.ResourcesChannel <- data
}

func taskUpdated(oldObj, newObj interface{}) {
	if newObj.(*v1alpha1.Task).GetResourceVersion() != oldObj.(*v1alpha1.Task).GetResourceVersion() {
		logging.Log.Debugf("Task Controller detected task '%s' updated", oldObj.(*v1alpha1.Task).Name)
		data := broadcaster.SocketData{
			MessageType: broadcaster.TaskUpdated,
			Payload:     newObj,
		}
		endpoints.ResourcesChannel <- data
	}
}

func taskDeleted(obj interface{}) {
	logging.Log.Debugf("Task Controller detected task '%s' deleted", utils.GetDeletedObjectMeta(obj).GetName())
	data := broadcaster.SocketData{
		MessageType: broadcaster.TaskDeleted,
		Payload:     obj,
	}
	endpoints.ResourcesChannel <- data
}
