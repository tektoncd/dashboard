package endpoints

import (
	routeclient "github.com/openshift/client-go/route/clientset/versioned"
	"github.com/tektoncd/pipeline/pkg/client/clientset/versioned"
	k8sclientset "k8s.io/client-go/kubernetes"
)

// Store all types here that are reused throughout files
// Wrapper around all necessary clients used for endpoints
type Resource struct {
	PipelineClient versioned.Interface
	K8sClient      k8sclientset.Interface
	RouteClient    routeclient.Interface
}
