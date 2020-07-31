/*
Copyright 2019-2020 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
		http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package controllers

import (
	"time"

	dashboardclientset "github.com/tektoncd/dashboard/pkg/client/clientset/versioned"
	dashboardinformers "github.com/tektoncd/dashboard/pkg/client/informers/externalversions"
	dashboardcontroller "github.com/tektoncd/dashboard/pkg/controllers/dashboard"
	kubecontroller "github.com/tektoncd/dashboard/pkg/controllers/kubernetes"
	tektoncontroller "github.com/tektoncd/dashboard/pkg/controllers/tekton"
	triggerscontroller "github.com/tektoncd/dashboard/pkg/controllers/triggers"
	"github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/router"
	tektonclientset "github.com/tektoncd/pipeline/pkg/client/clientset/versioned"
	tektoninformers "github.com/tektoncd/pipeline/pkg/client/informers/externalversions"
	resourceclientset "github.com/tektoncd/pipeline/pkg/client/resource/clientset/versioned"
	resourceinformers "github.com/tektoncd/pipeline/pkg/client/resource/informers/externalversions"
	triggersclientset "github.com/tektoncd/triggers/pkg/client/clientset/versioned"
	triggersinformers "github.com/tektoncd/triggers/pkg/client/informers/externalversions"
	k8sinformers "k8s.io/client-go/informers"
	k8sclientset "k8s.io/client-go/kubernetes"
)

// StartTektonControllers creates and starts Tekton controllers
func StartTektonControllers(clientset tektonclientset.Interface, clientresourceset resourceclientset.Interface, tenantNamespace string, resyncDur time.Duration, stopCh <-chan struct{}) {
	logging.Log.Info("Creating Tekton controllers")
	clusterInformerFactory := tektoninformers.NewSharedInformerFactory(clientset, resyncDur)
	tenantInformerFactory := tektoninformers.NewSharedInformerFactoryWithOptions(clientset, resyncDur, tektoninformers.WithNamespace(tenantNamespace))
	tenantResourceInformerFactory := resourceinformers.NewSharedInformerFactoryWithOptions(clientresourceset, resyncDur, resourceinformers.WithNamespace(tenantNamespace))
	// Add all tekton controllers
	tektoncontroller.NewClusterTaskController(clusterInformerFactory)
	tektoncontroller.NewTaskController(tenantInformerFactory)
	tektoncontroller.NewTaskRunController(tenantInformerFactory)
	tektoncontroller.NewPipelineController(tenantInformerFactory)
	tektoncontroller.NewPipelineRunController(tenantInformerFactory)
	tektoncontroller.NewConditionController(tenantInformerFactory)
	tektoncontroller.NewPipelineResourceController(tenantResourceInformerFactory)
	// Started once all controllers have been registered
	logging.Log.Info("Starting Tekton controllers")
	clusterInformerFactory.Start(stopCh)
	tenantInformerFactory.Start(stopCh)
	tenantResourceInformerFactory.Start(stopCh)
}

// StartKubeControllers creates and starts Kube controllers
func StartKubeControllers(clientset k8sclientset.Interface, resyncDur time.Duration, tenantNamespace string, readOnly bool, handler *router.Handler, stopCh <-chan struct{}) {
	logging.Log.Info("Creating Kube controllers")
	clusterInformerFactory := k8sinformers.NewSharedInformerFactory(clientset, resyncDur)
	tenantInformerFactory := k8sinformers.NewSharedInformerFactoryWithOptions(clientset, resyncDur, k8sinformers.WithNamespace(tenantNamespace))
	// Add all kube controllers
	if tenantNamespace == "" {
		kubecontroller.NewExtensionController(clusterInformerFactory, handler)
		kubecontroller.NewNamespaceController(clusterInformerFactory)
	} else {
		kubecontroller.NewExtensionController(tenantInformerFactory, handler)
	}
	if !readOnly {
		kubecontroller.NewSecretController(tenantInformerFactory)
		kubecontroller.NewServiceAccountController(tenantInformerFactory)
	}
	// Started once all controllers have been registered
	logging.Log.Info("Starting Kube controllers")
	clusterInformerFactory.Start(stopCh)
	tenantInformerFactory.Start(stopCh)
}

func StartTriggersControllers(clientset triggersclientset.Interface, resyncDur time.Duration, tenantNamespace string, stopCh <-chan struct{}) {
	logging.Log.Info("Creating Triggers controllers")
	clusterInformerFactory := triggersinformers.NewSharedInformerFactory(clientset, resyncDur)
	tenantInformerFactory := triggersinformers.NewSharedInformerFactoryWithOptions(clientset, resyncDur, triggersinformers.WithNamespace(tenantNamespace))
	// Add all tekton controllers
	triggerscontroller.NewClusterTriggerBindingController(clusterInformerFactory)
	triggerscontroller.NewTriggerBindingController(tenantInformerFactory)
	triggerscontroller.NewTriggerTemplateController(tenantInformerFactory)
	triggerscontroller.NewEventListenerController(tenantInformerFactory)
	// Started once all controllers have been registered
	logging.Log.Info("Starting Triggers controllers")
	clusterInformerFactory.Start(stopCh)
	tenantInformerFactory.Start(stopCh)
}

// StartDashboardControllers creates and starts Dashboard controllers
func StartDashboardControllers(clientset dashboardclientset.Interface, resyncDur time.Duration, tenantNamespace string, stopCh <-chan struct{}) {
	logging.Log.Info("Creating Dashboard controllers")
	tenantInformerFactory := dashboardinformers.NewSharedInformerFactoryWithOptions(clientset, resyncDur, dashboardinformers.WithNamespace(tenantNamespace))
	dashboardcontroller.NewExtensionController(tenantInformerFactory)
	// Started once all controllers have been registered
	logging.Log.Info("Starting Dashboard controllers")
	tenantInformerFactory.Start(stopCh)
}
