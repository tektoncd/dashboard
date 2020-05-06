package tekton

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/controllers/utils"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	tektonresourceinformer "github.com/tektoncd/pipeline/pkg/client/resource/informers/externalversions"
)

// NewPipelineResourceController registers a Tekton controller/informer for
// pipelineResources on the sharedTektonInformerFactory
func NewPipelineResourceController(sharedTektonInformerFactory tektonresourceinformer.SharedInformerFactory) {
	logging.Log.Debug("In NewPipelineResourceController")

	utils.NewController(
		"pipeline resource",
		sharedTektonInformerFactory.Tekton().V1alpha1().PipelineResources().Informer(),
		broadcaster.PipelineResourceCreated,
		broadcaster.PipelineResourceUpdated,
		broadcaster.PipelineResourceDeleted,
	)
}
