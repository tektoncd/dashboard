package controllers

import (
	"time"

	kubecontroller "github.com/tektoncd/dashboard/pkg/controllers/kubernetes"
	tektoncontroller "github.com/tektoncd/dashboard/pkg/controllers/tekton"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/router"
	tektonclientset "github.com/tektoncd/pipeline/pkg/client/clientset/versioned"
	tektoninformers "github.com/tektoncd/pipeline/pkg/client/informers/externalversions"
	k8sinformers "k8s.io/client-go/informers"
	k8sclientset "k8s.io/client-go/kubernetes"
)

// StartTektonControllers creates and starts Tekton controllers
func StartTektonControllers(clientset tektonclientset.Interface, resyncDur time.Duration, stopCh <-chan struct{}) {
	logging.Log.Info("Creating Tekton controllers")
	tektonInformerFactory := tektoninformers.NewSharedInformerFactory(clientset, resyncDur)
	// Add all tekton controllers
	tektoncontroller.NewClusterTaskController(tektonInformerFactory)
	tektoncontroller.NewTaskController(tektonInformerFactory)
	tektoncontroller.NewTaskRunController(tektonInformerFactory)
	tektoncontroller.NewPipelineController(tektonInformerFactory)
	tektoncontroller.NewPipelineRunController(tektonInformerFactory)
	tektoncontroller.NewPipelineResourceController(tektonInformerFactory)
	// Started once all controllers have been registered
	logging.Log.Info("Starting Tekton controllers")
	tektonInformerFactory.Start(stopCh)
}

// StartKubeControllers creates and starts Kube controllers
func StartKubeControllers(clientset k8sclientset.Interface, resyncDur time.Duration, installNamespace string, handler *router.Handler, stopCh <-chan struct{}) {
	logging.Log.Info("Creating Kube controllers")
	kubeInformerFactory := k8sinformers.NewSharedInformerFactory(clientset, resyncDur)
	// Add all kube controllers
	kubecontroller.NewExtensionController(kubeInformerFactory, installNamespace, handler)
	kubecontroller.NewNamespaceController(kubeInformerFactory)
	kubecontroller.NewSecretController(kubeInformerFactory)
	// Started once all controllers have been registered
	logging.Log.Info("Starting Kube controllers")
	kubeInformerFactory.Start(stopCh)
}
