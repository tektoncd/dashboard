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

	restful "github.com/emicklei/go-restful"
	endpoints "github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	clientset "github.com/tektoncd/pipeline/pkg/client/clientset/versioned"
	k8sclientset "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/sample-controller/pkg/signals"
)

func main() {
	var cfg *rest.Config
	var err error
	kubeconfig := os.Getenv("KUBECONFIG")
	if len(kubeconfig) != 0 {
		cfg, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
	} else {
		cfg, err = rest.InClusterConfig()
	}
	if err != nil {
		logging.Log.Errorf("error building kubeconfig from %s: %s", kubeconfig, err.Error())
	}

	port := ":8080"
	portnumber := os.Getenv("PORT")
	if portnumber != "" {
		port = ":" + portnumber
		logging.Log.Infof("Port number from config: %s", portnumber)
	}

	wsContainer := restful.NewContainer()
	wsContainer.Router(restful.CurlyRouter{})

	pipelineClient, err := clientset.NewForConfig(cfg)
	if err != nil {
		logging.Log.Errorf("error building pipeline clientset: %s", err.Error())
	} else {
		logging.Log.Info("Got a pipeline client")
	}

	k8sClient, err := k8sclientset.NewForConfig(cfg)
	if err != nil {
		logging.Log.Errorf("error building k8s clientset: %s", err.Error())
	} else {
		logging.Log.Info("Got a k8s client")
	}

	resource := endpoints.Resource{
		PipelineClient: pipelineClient,
		K8sClient:      k8sClient,
	}

	logging.Log.Info("Registering REST endpoints")
	resource.RegisterEndpoints(wsContainer)
	resource.RegisterWebsocket(wsContainer)
	resource.RegisterHealthProbes(wsContainer)
	resource.RegisterReadinessProbes(wsContainer)

	stopCh := signals.SetupSignalHandler()
	resource.StartPipelineRunController(stopCh)

	logging.Log.Infof("Creating server and entering wait loop")
	server := &http.Server{Addr: port, Handler: wsContainer}
	logging.Log.Fatal(server.ListenAndServe())
}
