package endpoints

import (
	routeclient "github.com/openshift/client-go/route/clientset/versioned"
	"github.com/tektoncd/pipeline/pkg/client/clientset/versioned"
	resourceversioned "github.com/tektoncd/pipeline/pkg/client/resource/clientset/versioned"
	k8sclientset "k8s.io/client-go/kubernetes"
)

// Options for enpoints
type Options struct {
	InstallNamespace   string
	PipelinesNamespace string
	TriggersNamespace  string
	ReadOnly           bool
	WebDir             string
	LogoutURL          string
	// Expect and forward Impersonate-* and Authorization headers
	// so requests are performed using the client's privileges instead
	// of the dashboard's privileges.
	Impersonate        bool
}

// GetPipelinesNamespace returns the PipelinesNamespace property if set
// or the InstallNamespace property otherwise (this assumes Tekton pipelines
// is installed in the same namespace as the dashboard if the property is not set)
func (o Options) GetPipelinesNamespace() string {
	if o.PipelinesNamespace != "" {
		return o.PipelinesNamespace
	}
	return o.InstallNamespace
}

// GetTriggersNamespace returns the TriggersNamespace property if set
// or the InstallNamespace property otherwise (this assumes Tekton triggers
// is installed in the same namespace as the dashboard if the property is not set)
func (o Options) GetTriggersNamespace() string {
	if o.TriggersNamespace != "" {
		return o.TriggersNamespace
	}
	return o.InstallNamespace
}

// Store all types here that are reused throughout files
// Wrapper around all necessary clients used for endpoints
type Resource struct {
	PipelineClient         versioned.Interface
	PipelineResourceClient resourceversioned.Interface
	K8sClient              k8sclientset.Interface
	RouteClient            routeclient.Interface
	Options                Options
}
