package kubernetes

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/controllers/utils"
	"github.com/tektoncd/dashboard/pkg/logging"
	k8sinformer "k8s.io/client-go/informers"
)

// NewNamespaceController registers the K8s shared informer that reacts to
// create and delete events for namespaces
func NewNamespaceController(sharedK8sInformerFactory k8sinformer.SharedInformerFactory) {
	logging.Log.Debug("In NewNamespaceController")

	utils.NewController(
		"namespace",
		sharedK8sInformerFactory.Core().V1().Namespaces().Informer(),
		broadcaster.NamespaceCreated,
		broadcaster.NamespaceUpdated,
		broadcaster.NamespaceDeleted,
	)
}
