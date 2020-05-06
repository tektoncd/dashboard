package kubernetes

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/controllers/utils"
	"github.com/tektoncd/dashboard/pkg/logging"
	k8sinformer "k8s.io/client-go/informers"
)

// NewSecretController registers the K8s shared informer that reacts to
// create, update and delete events for secrets
func NewSecretController(sharedK8sInformerFactory k8sinformer.SharedInformerFactory) {
	logging.Log.Debug("In NewSecretController")

	utils.NewController(
		"secret",
		sharedK8sInformerFactory.Core().V1().Secrets().Informer(),
		broadcaster.SecretCreated,
		broadcaster.SecretUpdated,
		broadcaster.SecretDeleted,
	)
}
