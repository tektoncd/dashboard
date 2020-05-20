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

	kubecontroller "github.com/tektoncd/dashboard/pkg/controllers/kubernetes"
	tektoncontroller "github.com/tektoncd/dashboard/pkg/controllers/tekton"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/router"
	tektonclientset "github.com/tektoncd/pipeline/pkg/client/clientset/versioned"
	tektoninformers "github.com/tektoncd/pipeline/pkg/client/informers/externalversions"
	tektonresourceclientset "github.com/tektoncd/pipeline/pkg/client/resource/clientset/versioned"
	tektonresourceinformers "github.com/tektoncd/pipeline/pkg/client/resource/informers/externalversions"
	k8sinformers "k8s.io/client-go/informers"
	k8sclientset "k8s.io/client-go/kubernetes"
)

// StartTektonControllers creates and starts Tekton controllers
func StartTektonControllers(clientset tektonclientset.Interface, clientresourceset tektonresourceclientset.Interface, tenantNamespace string, resyncDur time.Duration, stopCh <-chan struct{}) {
	logging.Log.Info("Creating Tekton controllers")
	clusterInformerFactory := tektoninformers.NewSharedInformerFactory(clientset, resyncDur)
	tenantInformerFactory := tektoninformers.NewSharedInformerFactoryWithOptions(clientset, resyncDur, tektoninformers.WithNamespace(tenantNamespace))
	tenantResourceInformerFactory := tektonresourceinformers.NewSharedInformerFactoryWithOptions(clientresourceset, resyncDur, tektonresourceinformers.WithNamespace(tenantNamespace))
	// Add all tekton controllers
	tektoncontroller.NewClusterTaskController(clusterInformerFactory)
	tektoncontroller.NewTaskController(tenantInformerFactory)
	tektoncontroller.NewTaskRunController(tenantInformerFactory)
	tektoncontroller.NewPipelineController(tenantInformerFactory)
	tektoncontroller.NewPipelineRunController(tenantInformerFactory)
	tektoncontroller.NewPipelineResourceController(tenantResourceInformerFactory)
	// Started once all controllers have been registered
	logging.Log.Info("Starting Tekton controllers")
	clusterInformerFactory.Start(stopCh)
	tenantInformerFactory.Start(stopCh)
	tenantResourceInformerFactory.Start(stopCh)
}

// StartKubeControllers creates and starts Kube controllers
func StartKubeControllers(clientset k8sclientset.Interface, resyncDur time.Duration, installNamespace, tenantNamespace string, readOnly bool, handler *router.Handler, stopCh <-chan struct{}) {
	logging.Log.Info("Creating Kube controllers")
	clusterInformerFactory := k8sinformers.NewSharedInformerFactory(clientset, resyncDur)
	tenantInformerFactory := k8sinformers.NewSharedInformerFactoryWithOptions(clientset, resyncDur, k8sinformers.WithNamespace(tenantNamespace))
	// Add all kube controllers
	kubecontroller.NewExtensionController(clusterInformerFactory, installNamespace, handler)
	if tenantNamespace == "" {
		kubecontroller.NewNamespaceController(clusterInformerFactory)
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
