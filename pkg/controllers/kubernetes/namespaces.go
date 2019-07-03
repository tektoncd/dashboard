package kubernetes

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	k8sinformer "k8s.io/client-go/informers"
	"k8s.io/client-go/tools/cache"
)

func NewNamespaceController(sharedK8sInformerFactory k8sinformer.SharedInformerFactory) {
	logging.Log.Debug("In NewNamespaceController")
	k8sInformer := sharedK8sInformerFactory.Core().V1().Namespaces()
	k8sInformer.Informer().AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    namespaceCreated,
		DeleteFunc: namespaceDeleted,
	})
}

func namespaceCreated(obj interface{}) {
	logging.Log.Debug("Namespace Controller Create")
	data := broadcaster.SocketData{
		MessageType: broadcaster.NamespaceCreated,
		Payload:     obj,
	}

	endpoints.ResourcesChannel <- data
}

func namespaceDeleted(obj interface{}) {
	logging.Log.Debug("Namespace Controller Delete")
	data := broadcaster.SocketData{
		MessageType: broadcaster.NamespaceDeleted,
		Payload:     obj,
	}

	endpoints.ResourcesChannel <- data
}
