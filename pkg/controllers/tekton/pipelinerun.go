package tekton

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/controllers/utils"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	tektoninformer "github.com/tektoncd/pipeline/pkg/client/informers/externalversions"
)

// NewPipelineRunController registers a Tekton controller/informer for
// pipelineRuns on the sharedTektonInformerFactory
func NewPipelineRunController(sharedTektonInformerFactory tektoninformer.SharedInformerFactory) {
	logging.Log.Debug("In NewPipelineRunController")

	utils.NewController(
		"pipeline run",
		sharedTektonInformerFactory.Tekton().V1alpha1().PipelineRuns().Informer(),
		broadcaster.PipelineRunCreated,
		broadcaster.PipelineRunUpdated,
		broadcaster.PipelineRunDeleted,
	)
}
