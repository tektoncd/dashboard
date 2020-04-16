package kubernetes

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/controllers/utils"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	v1 "k8s.io/api/core/v1"
	k8sinformer "k8s.io/client-go/informers"
	"k8s.io/client-go/tools/cache"
)

// NewSecretController registers the K8s shared informer that reacts to
// create, update and delete events for secrets
func NewSecretController(sharedK8sInformerFactory k8sinformer.SharedInformerFactory) {
	logging.Log.Debug("In NewSecretController")
	k8sInformer := sharedK8sInformerFactory.Core().V1().Secrets()
	k8sInformer.Informer().AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    secretCreated,
		UpdateFunc: secretUpdated,
		DeleteFunc: secretDeleted,
	})
}

func secretCreated(obj interface{}) {
	logging.Log.Debugf("Secret Controller detected secret '%s' created", obj.(*v1.Secret).Name)
	data := broadcaster.SocketData{
		MessageType: broadcaster.SecretCreated,
		Payload:     obj,
	}

	endpoints.ResourcesChannel <- data
}

func secretUpdated(oldObj, newObj interface{}) {
	oldSecret, newSecret := oldObj.(*v1.Secret), newObj.(*v1.Secret)
	// If resourceVersion differs between old and new, an actual update event was observed
	if oldSecret.ResourceVersion != newSecret.ResourceVersion {
		logging.Log.Debugf("Secret Controller detected secret '%s' updated", oldSecret.Name)
		data := broadcaster.SocketData{
			MessageType: broadcaster.SecretUpdated,
			Payload:     newObj,
		}
		endpoints.ResourcesChannel <- data
	}
}

func secretDeleted(obj interface{}) {
	logging.Log.Debugf("Secret Controller detected secret '%s' deleted", utils.GetDeletedObjectMeta(obj).GetName())
	data := broadcaster.SocketData{
		MessageType: broadcaster.SecretDeleted,
		Payload:     obj,
	}

	endpoints.ResourcesChannel <- data
}
