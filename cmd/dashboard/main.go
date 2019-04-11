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

	restful "github.com/emicklei/go-restful"
	endpoints "github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	clientset "github.com/tektoncd/pipeline/pkg/client/clientset/versioned"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sclientset "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/sample-controller/pkg/signals"
)

// Should be kicked off at install time;
// the pipeline, repo and resource values here must match the values of the pipeline0 definition
var pipeline0Name = "pipeline0"
var pipeline0ResourceName = "git-source"
var pipeline0RepoName = "tekton-pipeline-config"

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
	portNumber := os.Getenv("PORT")
	if portNumber != "" {
		port = ":" + portNumber
		logging.Log.Infof("Port number from config: %s", portNumber)
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

	namespace := os.Getenv("PIPELINE_RUN_NAMESPACE")

	namespaceToUse := "default"
	if namespace != "" {
		namespaceToUse = namespace
	}

	createPipeline0(namespaceToUse, resource)

	stopCh := signals.SetupSignalHandler()
	resource.StartPipelineRunController(stopCh)

	logging.Log.Infof("Creating server and entering wait loop")
	server := &http.Server{Addr: port, Handler: wsContainer}
	logging.Log.Fatal(server.ListenAndServe())
}

/* expected behaviour:
- No PipelineRun exists already for pipeline0 at install time, create one (even on pod going away)
- A PipelineRun exists already for pipeline0, don't create again */
func createPipeline0(namespace string, resource endpoints.Resource) {
	duration := 5 * time.Second
	numAttempts := 4
	count := 0
	existingPipeline0Run := false

	/* Poll every five seconds for twenty seconds: make sure we get the list of PipelineRuns to check for Pipeline0 runs */
	for count < numAttempts {
		pipelineRunList, appError := resource.GetAllPipelineRunsImpl(namespace, "")
		if appError.ERROR != nil {
			logging.Log.Errorf("there was a problem getting all PipelineRuns: %s", appError.ERROR)
			time.Sleep(duration)
		}

		for _, pipelineRun := range pipelineRunList.Items {
			if pipelineRun.Spec.PipelineRef.Name == pipeline0Name {
				existingPipeline0Run = true
				break
			}
		}
		count++
	}

	if existingPipeline0Run == false {
		pipeline0Created := false
		numAttempts := 5
		count := 0

		/* Poll every sec for five seconds: make sure the Pipeline and Task are registered with Kube, may not be if we're too quick here */
		for count < numAttempts {
			taskExists, _ := resource.PipelineClient.TektonV1alpha1().Tasks(namespace).Get("pipeline0-task", metav1.GetOptions{})
			pipeline0Exists, _ := resource.PipelineClient.TektonV1alpha1().Pipelines(namespace).Get("pipeline0", metav1.GetOptions{})
			if taskExists.Name == "" && pipeline0Exists.Name == "" {
				logging.Log.Debug("Didn't find pipeline and task")
				time.Sleep(1 * time.Second)
			} else {
				pipeline0Created = true
				break
			}
			count++
		}

		if !pipeline0Created {
			logging.Log.Error("failed to apply Pipeline templates at install time")
		}

		pipelineTemplateRepo := os.Getenv("PIPELINE_TEMPLATE_REPO")
		pipelineTemplateRepoRevision := os.Getenv("PIPELINE_TEMPLATE_REPO_REVISION")

		pipeline0Run := endpoints.ManualPipelineRun{
			// Pipeline0 vars are declared at the top of this file
			PIPELINENAME:    pipeline0Name,
			GITRESOURCENAME: pipeline0ResourceName,
			GITCOMMIT:       pipelineTemplateRepoRevision,
			REPOURL:         pipelineTemplateRepo,
		}

		createResponse := resource.CreatePipelineRunImpl(pipeline0Run, namespace)
		if createResponse.ERROR != nil {
			logging.Log.Errorf("a problem occured creating Pipeline0 PipelineRun: %s", createResponse.MESSAGE)
		}
	}

}
