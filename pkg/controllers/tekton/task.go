package tekton

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/controllers/utils"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	tektoninformer "github.com/tektoncd/pipeline/pkg/client/informers/externalversions"
)

// NewTaskController registers a Tekton controller/informer for tasks on
// the sharedTektonInformerFactory
func NewTaskController(sharedTektonInformerFactory tektoninformer.SharedInformerFactory) {
	logging.Log.Debug("In NewTaskController")

	utils.NewController(
		"task",
		sharedTektonInformerFactory.Tekton().V1alpha1().Tasks().Informer(),
		broadcaster.TaskCreated,
		broadcaster.TaskUpdated,
		broadcaster.TaskDeleted,
		nil,
	)
}
