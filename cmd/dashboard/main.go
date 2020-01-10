/*
Copyright 2019 The Tekton Authors
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

package main

import (
	"net/http"
	"os"
	"time"

	routeclient "github.com/openshift/client-go/route/clientset/versioned"
	"github.com/tektoncd/dashboard/pkg/controllers"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/router"
	clientset "github.com/tektoncd/pipeline/pkg/client/clientset/versioned"
	k8sclientset "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/sample-controller/pkg/signals"
)

// Stores config env
type config struct {
	kubeConfigPath string
	// Should conform with http.Server.Addr field
	port             string
	installNamespace string
}

func main() {
	// Initialize config
	dashboardConfig := config{
		kubeConfigPath:   os.Getenv("KUBECONFIG"),
		port:             ":8080",
		installNamespace: os.Getenv("INSTALLED_NAMESPACE"),
	}
	portNumber := os.Getenv("PORT")
	if portNumber != "" {
		dashboardConfig.port = ":" + portNumber
		logging.Log.Infof("Port number from config: %s", portNumber)
	}

	var cfg *rest.Config
	var err error
	if len(dashboardConfig.kubeConfigPath) != 0 {
		cfg, err = clientcmd.BuildConfigFromFlags("", dashboardConfig.kubeConfigPath)
		if err != nil {
			logging.Log.Errorf("Error building kubeconfig from %s: %s", dashboardConfig.kubeConfigPath, err.Error())
		}
	} else {
		if cfg, err = rest.InClusterConfig(); err != nil {
			logging.Log.Errorf("Error building kubeconfig: %s", err.Error())
		}
	}

	pipelineClient, err := clientset.NewForConfig(cfg)
	if err != nil {
		logging.Log.Errorf("Error building pipeline clientset: %s", err.Error())
	}

	k8sClient, err := k8sclientset.NewForConfig(cfg)
	if err != nil {
		logging.Log.Errorf("Error building k8s clientset: %s", err.Error())
	}

	routeClient, err := routeclient.NewForConfig(cfg)
	if err != nil {
		logging.Log.Errorf("Error building route clientset: %s", err.Error())
	}

	resource := endpoints.Resource{
		PipelineClient: pipelineClient,
		K8sClient:      k8sClient,
		RouteClient:    routeClient,
	}

	routerHandler := router.Register(resource)
	logging.Log.Info("Creating controllers")
	stopCh := signals.SetupSignalHandler()
	resyncDur := time.Second * 30
	controllers.StartTektonControllers(resource.PipelineClient, resyncDur, stopCh)
	controllers.StartKubeControllers(resource.K8sClient, resyncDur, dashboardConfig.installNamespace, routerHandler, stopCh)

	logging.Log.Infof("Creating server and entering wait loop")
	server := &http.Server{Addr: dashboardConfig.port, Handler: routerHandler}
	logging.Log.Fatal(server.ListenAndServe())
}
