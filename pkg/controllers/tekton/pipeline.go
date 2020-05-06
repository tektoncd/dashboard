package tekton

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/controllers/utils"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	tektoninformer "github.com/tektoncd/pipeline/pkg/client/informers/externalversions"
)

// NewPipelineController registers a Tekton controller/informer for pipelines on
// the sharedTektonInformerFactory
func NewPipelineController(sharedTektonInformerFactory tektoninformer.SharedInformerFactory) {
	logging.Log.Debug("In NewPipelineController")

	utils.NewController(
		"pipeline",
		sharedTektonInformerFactory.Tekton().V1alpha1().Pipelines().Informer(),
		broadcaster.PipelineCreated,
		broadcaster.PipelineUpdated,
		broadcaster.PipelineDeleted,
	)
}
