package utils

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	"github.com/tektoncd/dashboard/pkg/logging"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/tools/cache"
)

func NewController(kind string, informer cache.SharedIndexInformer, onCreated, onUpdated, onDeleted broadcaster.MessageType) {
	logging.Log.Debug("In NewController")

	informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			logging.Log.Debugf("Controller detected %s '%s' created", kind, obj.(metav1.Object).GetName())
			data := broadcaster.SocketData{
				MessageType: onCreated,
				Payload:     obj,
			}
			endpoints.ResourcesChannel <- data
		},
		UpdateFunc: func(oldObj, newObj interface{}) {
			oldSecret, newSecret := oldObj.(metav1.Object), newObj.(metav1.Object)
			// If resourceVersion differs between old and new, an actual update event was observed
			if oldSecret.GetResourceVersion() != newSecret.GetResourceVersion() {
				logging.Log.Debugf("Controller detected %s '%s' updated", kind, oldSecret.GetName())
				data := broadcaster.SocketData{
					MessageType: onUpdated,
					Payload:     newObj,
				}
				endpoints.ResourcesChannel <- data
			}
		},
		DeleteFunc: func(obj interface{}) {
			logging.Log.Debugf("Controller detected %s '%s' deleted", kind, GetDeletedObjectMeta(obj).GetName())
			data := broadcaster.SocketData{
				MessageType: onDeleted,
				Payload:     obj,
			}
			endpoints.ResourcesChannel <- data
		},
	})
}
