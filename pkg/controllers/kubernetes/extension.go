package kubernetes

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/router"
	v1 "k8s.io/api/core/v1"
	k8sinformer "k8s.io/client-go/informers"
	"k8s.io/client-go/tools/cache"
)

// package scoped variables to be utilized within EventHandler funcs
var installNamespace string

// Registers the K8s shared informer that reacts to extension service updates
func NewExtensionController(sharedK8sInformerFactory k8sinformer.SharedInformerFactory, dashboardNamespace string) {
	logging.Log.Debug("In NewExtensionController")
	installNamespace = dashboardNamespace
	extensionServiceInformer := sharedK8sInformerFactory.Core().V1().Services().Informer()
	// ResourceEventHandler interface functions only pass object interfaces
	// Inlined functions to keep mux in scope rather than reconciler
	extensionServiceInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    serviceCreated,
		UpdateFunc: serviceUpdated,
		DeleteFunc: serviceDeleted,
	})
}

func serviceCreated(obj interface{}) {
	service := obj.(*v1.Service)
	if service.Namespace == installNamespace {
		if value := service.Labels[router.ExtensionLabelKey]; value == router.ExtensionLabelValue {
			logging.Log.Debugf("Extension Controller detected extension '%s' created", service.Name)
			router.RegisterExtension(service)
			data := broadcaster.SocketData{
				MessageType: broadcaster.ExtensionCreated,
				Payload:     obj,
			}
			endpoints.ResourcesChannel <- data
		}
	}
}

func serviceUpdated(oldObj, newObj interface{}) {
	oldService, newService := oldObj.(*v1.Service), newObj.(*v1.Service)
	// If resourceVersion differs between old and new, an actual update event was observed
	versionUpdated := oldService.ResourceVersion != newService.ResourceVersion
	oldExtensions := len(router.GetExtensions())
	// Updated services will still be in the same namespace
	if oldService.Namespace == installNamespace {
		if value := oldService.Labels[router.ExtensionLabelKey]; versionUpdated && value == router.ExtensionLabelValue {
			logging.Log.Debugf("Extension Controller Update: Removing old extension '%s'", oldService.Name)
			router.UnregisterExtension(oldService)
		}
		if value := newService.Labels[router.ExtensionLabelKey]; versionUpdated && value == router.ExtensionLabelValue {
			logging.Log.Debugf("Extension Controller Update: Add new extension '%s'", newService.Name)
			router.RegisterExtension(newService)
		}
		newExtensions := len(router.GetExtensions())
		switch {
		// Service has added the extension label
		case newExtensions > oldExtensions:
			data := broadcaster.SocketData{
				MessageType: broadcaster.ExtensionCreated,
				Payload:     newObj,
			}
			endpoints.ResourcesChannel <- data
		// Service has removed the extension label
		case oldExtensions > newExtensions:
			data := broadcaster.SocketData{
				MessageType: broadcaster.ExtensionDeleted,
				Payload:     newObj,
			}
			endpoints.ResourcesChannel <- data
		// Extension service was modified
		case oldService.Labels[router.ExtensionLabelKey] == router.ExtensionLabelValue &&
			newService.Labels[router.ExtensionLabelKey] == router.ExtensionLabelValue:
			data := broadcaster.SocketData{
				MessageType: broadcaster.ExtensionUpdated,
				Payload:     newObj,
			}
			endpoints.ResourcesChannel <- data
		}
	}
}

func serviceDeleted(obj interface{}) {
	service := obj.(*v1.Service)
	if service.Namespace == installNamespace {
		if value := service.Labels[router.ExtensionLabelKey]; value == router.ExtensionLabelValue {
			logging.Log.Debugf("Extension Controller detected extension '%s' deleted", service.Name)
			router.UnregisterExtension(service)
			data := broadcaster.SocketData{
				MessageType: broadcaster.ExtensionDeleted,
				Payload:     obj,
			}
			endpoints.ResourcesChannel <- data
		}
	}
}
