/*
Copyright 2019-2021 The Tekton Authors
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
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/dynamic/dynamicinformer"
	k8sinformers "k8s.io/client-go/informers"
	k8sclientset "k8s.io/client-go/kubernetes"
)

func StartTektonControllers(clientset dynamic.Interface, resyncDur time.Duration, tenantNamespace string, stopCh <-chan struct{}) {
	logging.Log.Info("Creating Tekton controllers")
	clusterInformerFactory := dynamicinformer.NewDynamicSharedInformerFactory(clientset, resyncDur)
	tenantInformerFactory := dynamicinformer.NewFilteredDynamicSharedInformerFactory(clientset, resyncDur, tenantNamespace, nil)

	tektoncontroller.NewClusterTaskController(clusterInformerFactory)
	tektoncontroller.NewTaskController(tenantInformerFactory)
	tektoncontroller.NewTaskRunController(tenantInformerFactory)
	tektoncontroller.NewPipelineController(tenantInformerFactory)
	tektoncontroller.NewPipelineRunController(tenantInformerFactory)
	tektoncontroller.NewConditionController(tenantInformerFactory)
	tektoncontroller.NewPipelineResourceController(tenantInformerFactory)

	logging.Log.Info("Starting Tekton controllers")
	clusterInformerFactory.Start(stopCh)
	tenantInformerFactory.Start(stopCh)
}

func StartKubeControllers(clientset k8sclientset.Interface, resyncDur time.Duration, tenantNamespace string, readOnly bool, stopCh <-chan struct{}) {
	logging.Log.Info("Creating Kube controllers")
	clusterInformerFactory := k8sinformers.NewSharedInformerFactory(clientset, resyncDur)
	tenantInformerFactory := k8sinformers.NewSharedInformerFactoryWithOptions(clientset, resyncDur, k8sinformers.WithNamespace(tenantNamespace))

	if tenantNamespace == "" {
		kubecontroller.NewNamespaceController(clusterInformerFactory)
	}
	if !readOnly {
		kubecontroller.NewServiceAccountController(tenantInformerFactory)
	}

	logging.Log.Info("Starting Kube controllers")
	clusterInformerFactory.Start(stopCh)
	tenantInformerFactory.Start(stopCh)
}

func StartTriggersControllers(clientset dynamic.Interface, resyncDur time.Duration, tenantNamespace string, stopCh <-chan struct{}) {
	logging.Log.Info("Creating Triggers controllers")
	clusterInformerFactory := dynamicinformer.NewDynamicSharedInformerFactory(clientset, resyncDur)
	tenantInformerFactory := dynamicinformer.NewFilteredDynamicSharedInformerFactory(clientset, resyncDur, tenantNamespace, nil)

	triggerscontroller.NewClusterInterceptorController(clusterInformerFactory)
	triggerscontroller.NewClusterTriggerBindingController(clusterInformerFactory)
	triggerscontroller.NewTriggerController(tenantInformerFactory)
	triggerscontroller.NewTriggerBindingController(tenantInformerFactory)
	triggerscontroller.NewTriggerTemplateController(tenantInformerFactory)
	triggerscontroller.NewEventListenerController(tenantInformerFactory)

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
