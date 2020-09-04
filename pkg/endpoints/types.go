package endpoints

import (
	"net/http"

	dashboardclientset "github.com/tektoncd/dashboard/pkg/client/clientset/versioned"
	pipelineclientset "github.com/tektoncd/pipeline/pkg/client/clientset/versioned"
	resourceclientset "github.com/tektoncd/pipeline/pkg/client/resource/clientset/versioned"
	triggersclientset "github.com/tektoncd/triggers/pkg/client/clientset/versioned"
	k8sclientset "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

// Options for enpoints
type Options struct {
	InstallNamespace   string
	PipelinesNamespace string
	TriggersNamespace  string
	TenantNamespace    string
	ReadOnly           bool
	IsOpenShift        bool
	LogoutURL          string
	StreamLogs         bool
	ExternalLogsURL    string
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
	Config                 *rest.Config
	HttpClient             *http.Client
	DashboardClient        dashboardclientset.Interface
	PipelineClient         pipelineclientset.Interface
	PipelineResourceClient resourceclientset.Interface
	K8sClient              k8sclientset.Interface
	TriggersClient         triggersclientset.Interface
	Options                Options
}
