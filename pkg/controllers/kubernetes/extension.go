package kubernetes

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/controllers/utils"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/router"
	v1 "k8s.io/api/core/v1"
	k8sinformer "k8s.io/client-go/informers"
	"k8s.io/client-go/tools/cache"
)

// extensionHandler is a wrapper around the router Handler so that it can be
// used within informer handler functions
type extensionHandler struct {
	*router.Handler
	installNamespace string
}

// NewExtensionController registers the K8s shared informer that reacts to
// extension service updates
func NewExtensionController(sharedK8sInformerFactory k8sinformer.SharedInformerFactory, dashboardNamespace string, handler *router.Handler) {
	logging.Log.Debug("In NewExtensionController")
	h := extensionHandler{
		Handler:          handler,
		installNamespace: dashboardNamespace,
	}
	extensionServiceInformer := sharedK8sInformerFactory.Core().V1().Services().Informer()
	// ResourceEventHandler interface functions only pass object interfaces
	// Inlined functions to keep mux in scope rather than reconciler
	extensionServiceInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    h.serviceCreated,
		UpdateFunc: h.serviceUpdated,
		DeleteFunc: h.serviceDeleted,
	})
}

func (e extensionHandler) serviceCreated(obj interface{}) {
	service := obj.(*v1.Service)
	if service.Namespace == e.installNamespace {
		if value := service.Labels[router.ExtensionLabelKey]; value == router.ExtensionLabelValue && service.Spec.ClusterIP != "" {
			logging.Log.Debugf("Extension Controller detected extension '%s' created", service.Name)
			e.RegisterExtension(service)
			data := broadcaster.SocketData{
				MessageType: broadcaster.ExtensionCreated,
				Payload:     obj,
			}
			endpoints.ResourcesChannel <- data
		}
	}
}

func (e extensionHandler) serviceUpdated(oldObj, newObj interface{}) {
	oldService, newService := oldObj.(*v1.Service), newObj.(*v1.Service)
	// If resourceVersion differs between old and new, an actual update event was observed
	versionUpdated := oldService.ResourceVersion != newService.ResourceVersion
	// Updated services will still be in the same namespace
	if oldService.Namespace == e.installNamespace {
		var event string
		if value := oldService.Labels[router.ExtensionLabelKey]; versionUpdated && value == router.ExtensionLabelValue && oldService.Spec.ClusterIP != "" {
			logging.Log.Debugf("Extension Controller Update: Removing old extension '%s'", oldService.Name)
			e.UnregisterExtension(oldService)
			event = "delete"
		}
		if value := newService.Labels[router.ExtensionLabelKey]; versionUpdated && value == router.ExtensionLabelValue && newService.Spec.ClusterIP != "" {
			logging.Log.Debugf("Extension Controller Update: Add new extension '%s'", newService.Name)
			e.RegisterExtension(newService)
			if len(event) != 0 {
				event = "update"
			} else {
				event = "create"
			}
		}
		switch event {
		case "delete": // Service has removed the extension label
			data := broadcaster.SocketData{
				MessageType: broadcaster.ExtensionDeleted,
				Payload:     newObj,
			}
			endpoints.ResourcesChannel <- data
		case "create": // Service has added the extension label
			data := broadcaster.SocketData{
				MessageType: broadcaster.ExtensionCreated,
				Payload:     newObj,
			}
			endpoints.ResourcesChannel <- data
		case "update": // Extension service was modified
			data := broadcaster.SocketData{
				MessageType: broadcaster.ExtensionUpdated,
				Payload:     newObj,
			}
			endpoints.ResourcesChannel <- data
		}
	}
}

func (e extensionHandler) serviceDeleted(obj interface{}) {
	serviceMeta := utils.GetDeletedObjectMeta(obj)
	if serviceMeta.GetNamespace() == e.installNamespace {
		if value := serviceMeta.GetLabels()[router.ExtensionLabelKey]; value == router.ExtensionLabelValue {
			logging.Log.Debugf("Extension Controller detected extension '%s' deleted", serviceMeta.GetName())
			if serviceMeta.GetUID() != "" {
				e.UnregisterExtensionByMeta(serviceMeta)
			}
			data := broadcaster.SocketData{
				MessageType: broadcaster.ExtensionDeleted,
				Payload:     obj,
			}
			endpoints.ResourcesChannel <- data
		}
	}
}
