package endpoints

import (
	"github.com/tektoncd/pipeline/pkg/client/clientset/versioned"
	k8sclientset "k8s.io/client-go/kubernetes"
)

// Store all types here that are reused throughout files
type Resource struct {
	PipelineClient versioned.Interface
	K8sClient      k8sclientset.Interface
}
