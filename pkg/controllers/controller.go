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
func StartTektonControllers(clientset tektonclientset.Interface, clientresourceset tektonresourceclientset.Interface, resyncDur time.Duration, stopCh <-chan struct{}) {
	logging.Log.Info("Creating Tekton controllers")
	tektonInformerFactory := tektoninformers.NewSharedInformerFactory(clientset, resyncDur)
	tektonresourceInformerFactory := tektonresourceinformers.NewSharedInformerFactory(clientresourceset, resyncDur)
	// Add all tekton controllers
	tektoncontroller.NewClusterTaskController(tektonInformerFactory)
	tektoncontroller.NewTaskController(tektonInformerFactory)
	tektoncontroller.NewTaskRunController(tektonInformerFactory)
	tektoncontroller.NewPipelineController(tektonInformerFactory)
	tektoncontroller.NewPipelineRunController(tektonInformerFactory)
	tektoncontroller.NewPipelineResourceController(tektonresourceInformerFactory)
	// Started once all controllers have been registered
	logging.Log.Info("Starting Tekton controllers")
	tektonInformerFactory.Start(stopCh)
	tektonresourceInformerFactory.Start(stopCh)
}

// StartKubeControllers creates and starts Kube controllers
func StartKubeControllers(clientset k8sclientset.Interface, resyncDur time.Duration, installNamespace string, handler *router.Handler, stopCh <-chan struct{}) {
	logging.Log.Info("Creating Kube controllers")
	kubeInformerFactory := k8sinformers.NewSharedInformerFactory(clientset, resyncDur)
	// Add all kube controllers
	kubecontroller.NewExtensionController(kubeInformerFactory, installNamespace, handler)
	kubecontroller.NewNamespaceController(kubeInformerFactory)
	kubecontroller.NewSecretController(kubeInformerFactory)
	kubecontroller.NewServiceAccountController(kubeInformerFactory)
	// Started once all controllers have been registered
	logging.Log.Info("Starting Kube controllers")
	kubeInformerFactory.Start(stopCh)
}
