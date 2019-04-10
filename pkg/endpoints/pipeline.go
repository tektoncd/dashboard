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
package endpoints

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.ibm.com/swiss-cloud/devops-back-end/pkg/broadcaster"

	restful "github.com/emicklei/go-restful"
	v1alpha1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	informers "github.com/tektoncd/pipeline/pkg/client/informers/externalversions"
	logging "github.ibm.com/swiss-cloud/devops-back-end/logging"
	"github.ibm.com/swiss-cloud/devops-back-end/pkg/utils"
	gh "gopkg.in/go-playground/webhooks.v3/github"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/tools/cache"
)

//BuildInformation - information required to build a particular commit from a Git repository.
type BuildInformation struct {
	REPOURL   string
	SHORTID   string
	COMMITID  string
	REPONAME  string
	TIMESTAMP string
}

type AppError struct {
	ERROR   error
	MESSAGE string
	CODE    int
}

//BuildRequest - a manual submission data struct
type BuildRequest struct {
	/* Example payload
	{
		"repourl": "https://github.ibm.com/your-org/test-project",
		"commitid": "7d84981c66718ee2dda1af280f915cc2feb6ffow",
		"reponame": "test-project"
	}
	*/
	REPOURL  string `json:"repourl"`
	COMMITID string `json:"commitid"`
	REPONAME string `json:"reponame"`
	BRANCH   string `json:"branch"`
}

type ResourceBinding struct {
	BINDINGNAME     string `json:"bindingname"`
	RESOURCEREFNAME string `json:"resourcerefname"`
}

//ManualPipelineRun - represents the data required to create a new PipelineRun
type ManualPipelineRun struct {
	PIPELINENAME      string `json:"pipelinename"`
	PIPELINERUNTYPE   string `json:"pipelineruntype,omitempty"`
	GITRESOURCENAME   string `json:"gitresourcename,omitempty"`
	IMAGERESOURCENAME string `json:"imageresourcename,omitempty"`
	GITCOMMIT         string `json:"gitcommit,omitempty"`
	REPONAME          string `json:"reponame,omitempty"`
	REPOURL           string `json:"repourl,omitempty"`
	HELMSECRET        string `json:"helmsecret,omitempty"`
	REGISTRYSECRET    string `json:"registrysecret,omitempty"`
}

// PipelineRunUpdateBody - represents a request that a user may provide for updating a PipelineRun
// Currently only modifying the status is supported but this gives us scope for adding additional fields
type PipelineRunUpdateBody struct {
	STATUS string `json:"status"`
}

type TaskRunLog struct {
	PodName string
	// Containers correlating to Task step definitions
	StepContainers []LogContainer
	// Additional Containers correlating to Task e.g. PipelineResources
	PodContainers  []LogContainer
	InitContainers []LogContainer
}

type LogContainer struct {
	Name string
	Logs []string
}

const gitServerLabel = "gitServer"
const gitOrgLabel = "gitOrg"
const gitRepoLabel = "gitRepo"

/* Get all pipelines in a given namespace */
func (r Resource) getAllPipelines(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	pipelines := r.PipelineClient.TektonV1alpha1().Pipelines(namespace)
	logging.Log.Debugf("In getAllPipelines: namespace: %s", namespace)

	pipelinelist, err := pipelines.List(metav1.ListOptions{})
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(pipelinelist)
}

/* API route for getting a given pipeline by name in a given namespace */
func (r Resource) getPipeline(request *restful.Request, response *restful.Response) {
	name := request.PathParameter("name")
	namespace := request.PathParameter("namespace")

	pipeline, err := r.getPipelineImpl(name, namespace)
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(pipeline)
}

/* Get all pipelines in a given namespace: the caller needs to handle any errors */
func (r Resource) getPipelineImpl(name, namespace string) (v1alpha1.Pipeline, error) {
	logging.Log.Debugf("in getPipelineImpl, name %s, namespace %s", name, namespace)

	pipelines := r.PipelineClient.TektonV1alpha1().Pipelines(namespace)
	pipeline, err := pipelines.Get(name, metav1.GetOptions{})
	if err != nil {
		logging.Log.Errorf("could not retrieve the pipeline called %s in namespace %s", name, namespace)
		return *pipeline, err
	} else {
		logging.Log.Debugf("Found the pipeline definition OK")
	}
	return *pipeline, nil
}

/* Get all pipeline runs in a given namespace */
func (r Resource) getAllPipelineRuns(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	repository := request.QueryParameter("repository")

	logging.Log.Debugf("In getAllPipelineRuns: namespace: `%s`, repository query: `%s`", namespace, repository)

	pipelinerunList, appError := r.GetAllPipelineRunsImpl(namespace, repository)
	if appError.ERROR != nil {
		logging.Log.Debugf("+%v", pipelinerunList.Items)
		utils.RespondError(response, appError.ERROR, appError.CODE)
	} else {
		// no errors so return the pipeline run list
		logging.Log.Debugf("+%v", pipelinerunList.Items)
		response.WriteEntity(pipelinerunList)
	}
}

func (r Resource) GetAllPipelineRunsImpl(namespace, repository string) (v1alpha1.PipelineRunList, AppError) {
	logging.Log.Debugf("In getAllPipelineRunsImpl: namespace: `%s`, repository query: `%s`", namespace, repository)

	pipelineruns := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace)

	var pipelinerunList *v1alpha1.PipelineRunList
	var err error
	if repository != "" {
		server, org, repo, err := getGitValues(repository)
		if err != nil {
			logging.Log.Errorf("there was an error getting the Git values: %s", err)
		}
		match := gitServerLabel + "=" + server + "," + gitOrgLabel + "=" + org + "," + gitRepoLabel + "=" + repo
		pipelinerunList, err = pipelineruns.List(metav1.ListOptions{LabelSelector: match})
	} else {
		pipelinerunList, err = pipelineruns.List(metav1.ListOptions{})
		if err != nil {
			return v1alpha1.PipelineRunList{}, AppError{err, "", http.StatusNotFound}
		}
	}
	return *pipelinerunList, AppError{}
}

/* Get a given pipeline run by name in a given namespace */
func (r Resource) getPipelineRun(request *restful.Request, response *restful.Response) {
	name := request.PathParameter("name")
	namespace := request.PathParameter("namespace")

	pipelineruns := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace)
	pipelinerun, err := pipelineruns.Get(name, metav1.GetOptions{})
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(pipelinerun)
}

func (r Resource) createPipelineRun(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")

	pipelineRunData := ManualPipelineRun{}
	if err := request.ReadEntity(&pipelineRunData); err != nil {
		logging.Log.Error("error parsing request body on call to createPipelineRun %s", err)
		utils.RespondError(response, err, http.StatusBadRequest)
		return
	}

	createResponse := r.CreatePipelineRunImpl(pipelineRunData, namespace)
	if createResponse.CODE == 204 {
		response.WriteHeader(http.StatusNoContent)
	} else { // anything other than 204 is an error - RespondError
		utils.RespondError(response, createResponse.ERROR, createResponse.CODE)
	}
}

/* Create a new manual pipeline run and resources in a given namespace */
func (r Resource) CreatePipelineRunImpl(pipelineRunData ManualPipelineRun, namespace string) *AppError {

	pipelineName := pipelineRunData.PIPELINENAME

	saName := ""
	providedSaName := os.Getenv("PIPELINE_RUN_SERVICE_ACCOUNT")
	if providedSaName != "" {
		saName = providedSaName
	} else {
		saName = "default"
	}

	logging.Log.Infof("PipelineRuns will be created in the namespace %s", namespace)
	logging.Log.Infof("PipelineRuns will be created with the service account %s", saName)

	startTime := getDateTimeAsString()

	// Assumes you've already applied the yml: so the pipeline definition and its tasks must exist upfront.
	generatedPipelineRunName := fmt.Sprintf("devops-pipeline-run-%s", startTime)

	pipeline, err := r.getPipelineImpl(pipelineName, namespace)
	// getPipelineImpl returns a null pipeline object if it doesn't exist, so be safe and check for that
	if err != nil || pipeline.Name == "" {
		errorMsg := fmt.Sprintf("could not find the pipeline template %s in namespace %s", pipelineName, namespace)
		logging.Log.Errorf(errorMsg)
		return &AppError{err, errorMsg, http.StatusPreconditionFailed}
	} else {
		logging.Log.Debugf("Found the pipeline template %s OK", pipelineName)
	}

	registryURL := os.Getenv("DOCKER_REGISTRY_LOCATION")

	var gitResource v1alpha1.PipelineResourceRef
	var imageResource v1alpha1.PipelineResourceRef

	resources := []v1alpha1.PipelineResourceBinding{}

	if pipelineRunData.GITRESOURCENAME != "" {
		gitResource = r.createPipelineResource(pipelineRunData, namespace, pipelineRunData.GITRESOURCENAME, v1alpha1.PipelineResourceTypeGit)
		resources = append(resources, v1alpha1.PipelineResourceBinding{Name: pipelineRunData.GITRESOURCENAME, ResourceRef: gitResource})
	}

	if pipelineRunData.IMAGERESOURCENAME != "" {
		imageResource = r.createPipelineResource(pipelineRunData, namespace, pipelineRunData.IMAGERESOURCENAME, v1alpha1.PipelineResourceTypeImage)
		resources = append(resources, v1alpha1.PipelineResourceBinding{Name: pipelineRunData.IMAGERESOURCENAME, ResourceRef: imageResource})
	}

	imageTag := pipelineRunData.GITCOMMIT
	imageName := fmt.Sprintf("%s/%s", registryURL, strings.ToLower(pipelineRunData.REPONAME))
	releaseName := fmt.Sprintf("%s-%s", strings.ToLower(pipelineRunData.REPONAME), pipelineRunData.GITCOMMIT)
	repositoryName := strings.ToLower(pipelineRunData.REPONAME)

	var params []v1alpha1.Param
	if pipelineRunData.PIPELINERUNTYPE == "helm" {
		params = []v1alpha1.Param{{Name: "image-tag", Value: imageTag},
			{Name: "image-name", Value: imageName},
			{Name: "release-name", Value: releaseName},
			{Name: "repository-name", Value: repositoryName},
			{Name: "target-namespace", Value: namespace}}
	} else {
		params = []v1alpha1.Param{{Name: "target-namespace", Value: namespace}}
	}

	if pipelineRunData.REGISTRYSECRET != "" {
		params = append(params, v1alpha1.Param{Name: "registry-secret", Value: pipelineRunData.REGISTRYSECRET})
	}
	if pipelineRunData.HELMSECRET != "" {
		params = append(params, v1alpha1.Param{Name: "helm-secret", Value: pipelineRunData.HELMSECRET})
	}
	// PipelineRun yaml defines references to resources
	newPipelineRunData := definePipelineRun(generatedPipelineRunName, namespace, saName, pipelineRunData.REPOURL, pipeline, v1alpha1.PipelineTriggerTypeManual, resources, params)

	logging.Log.Infof("Creating a new PipelineRun named %s in the namespace %s using the service account %s", generatedPipelineRunName, namespace, saName)

	pipelineRun, err := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace).Create(newPipelineRunData)
	if err != nil {
		errorMsg := fmt.Sprintf("error creating the PipelineRun: %s", err)
		logging.Log.Errorf(errorMsg)
		return &AppError{err, errorMsg, http.StatusInternalServerError}
	} else {
		errorMsg := fmt.Sprintf("PipelineRun created with name: %s", pipelineRun.Name)
		logging.Log.Debugf(errorMsg)
		return &AppError{err, errorMsg, http.StatusNoContent}
	}
}

/* Get a given pipeline resource by name in a given namespace */
func (r Resource) getPipelineResource(request *restful.Request, response *restful.Response) {
	name := request.PathParameter("name")
	namespace := request.PathParameter("namespace")
	logging.Log.Debugf("In getPipelineResource, name: %s, namespace: %s", name, namespace)

	pipelineresources := r.PipelineClient.TektonV1alpha1().PipelineResources(namespace)
	pipelineresource, err := pipelineresources.Get(name, metav1.GetOptions{})
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(pipelineresource)
}

/* Get all tasks in a given namespace */
func (r Resource) getAllTasks(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	tasks := r.PipelineClient.TektonV1alpha1().Tasks(namespace)
	logging.Log.Debugf("In getAllTasks: namespace: %s", namespace)

	tasklist, err := tasks.List(metav1.ListOptions{})
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(tasklist)
}

/* Get a given task by name in a given namespace */
func (r Resource) getTask(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")
	logging.Log.Debugf("In getTask, name: %s, namespace: %s", name, namespace)
	tasks := r.PipelineClient.TektonV1alpha1().Tasks(namespace)
	task, err := tasks.Get(name, metav1.GetOptions{})
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(task)
}

/* Get all task runs in a given namespace */
func (r Resource) getAllTaskRuns(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	taskruns := r.PipelineClient.TektonV1alpha1().TaskRuns(namespace)
	logging.Log.Debugf("In getAllTaskRuns, taskruns: %s, namespace: %s", taskruns, namespace)

	taskrunlist, err := taskruns.List(metav1.ListOptions{})
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(taskrunlist)
}

/* Get a given task in a given namespace */
func (r Resource) getTaskRun(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")

	logging.Log.Debugf("In getTaskRun, name: %s, namespace: %s", name, namespace)
	taskruns := r.PipelineClient.TektonV1alpha1().TaskRuns(namespace)
	taskrun, err := taskruns.Get(name, metav1.GetOptions{})
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(taskrun)
}

/* Get the logs for a given pod by name in a given namespace */
func (r Resource) getPodLog(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")

	logging.Log.Debugf("In getPodLog, name: %s, namespace: %s", name, namespace)
	req := r.K8sClient.CoreV1().Pods(namespace).GetLogs(name, &v1.PodLogOptions{})
	podLogs, err := req.Stream()
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	defer podLogs.Close()

	buf := new(bytes.Buffer)
	_, err = io.Copy(buf, podLogs)
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	str := buf.String()
	response.AddHeader("Content-Type", "text/plain")
	response.WriteEntity(str)
}

/* Get the logs for a given task run by name in a given namespace */
func (r Resource) getTaskRunLog(request *restful.Request, response *restful.Response) {
	taskRunName := request.PathParameter("name")
	namespace := request.PathParameter("namespace")

	logging.Log.Debugf("In getTaskRunLog, name: %s, namespace: %s", taskRunName, namespace)
	taskRunsInterface := r.PipelineClient.TektonV1alpha1().TaskRuns(namespace)
	taskRun, err := taskRunsInterface.Get(taskRunName, metav1.GetOptions{})
	if err != nil || taskRun.Status.PodName == "" {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}

	podname := taskRun.Status.PodName
	pod, err := r.K8sClient.CoreV1().Pods(namespace).Get(podname, metav1.GetOptions{})
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}

	taskSpec := taskRun.Spec.TaskSpec
	// Attempt to get taskSpec through TaskRef
	if taskSpec == nil {
		taskRef := taskRun.Spec.TaskRef
		if taskRef != nil {
			taskInterface := r.PipelineClient.TektonV1alpha1().Tasks(namespace)
			task, err := taskInterface.Get(taskRef.Name, metav1.GetOptions{})
			if err != nil {
				utils.RespondError(response, err, http.StatusNotFound)
				return
			}
			taskSpec = &(task.Spec)
		}
	}
	// Unexported field within tekton
	containerPrefix := "build-step-"
	stepNames := make(map[string]struct{})
	if taskSpec != nil {
		for _, step := range taskSpec.Steps {
			stepNames[containerPrefix+step.Name] = struct{}{}
		}
	}

	podContainers := pod.Spec.Containers
	initContainers := pod.Spec.InitContainers

	taskRunLog := TaskRunLog{PodName: podname}
	buf := new(bytes.Buffer)
	var podLogs io.ReadCloser
	setContainers := func(containers []v1.Container, filter func(l LogContainer)) {
		for _, container := range containers {
			buf.Reset()
			step := LogContainer{Name: container.Name}
			req := r.K8sClient.CoreV1().Pods(namespace).GetLogs(podname, &v1.PodLogOptions{Container: container.Name})
			if req.URL().Path == "" {
				continue
			}
			podLogs, err = req.Stream()
			if err != nil {
				continue
			}
			_, err = io.Copy(buf, podLogs)
			if err != nil {
				podLogs.Close()
				continue
			}
			logs := strings.Split(buf.String(), "\n")
			for _, log := range logs {
				// Split does not flatten the search string
				if log != "" {
					step.Logs = append(step.Logs, log)
				}
			}
			filter(step)
			podLogs.Close()
		}
	}
	setContainers(initContainers, func(l LogContainer) {
		taskRunLog.InitContainers = append(taskRunLog.InitContainers, l)
	})
	setContainers(podContainers, func(l LogContainer) {
		if _, ok := stepNames[l.Name]; ok {
			taskRunLog.StepContainers = append(taskRunLog.StepContainers, l)
		} else {
			taskRunLog.PodContainers = append(taskRunLog.PodContainers, l)
		}
	})
	response.WriteEntity(taskRunLog)
}

/* Create a new PipelineResource: this should be of type git or image */
func definePipelineResource(name, namespace string, params []v1alpha1.Param, resourceType v1alpha1.PipelineResourceType) *v1alpha1.PipelineResource {
	pipelineResource := v1alpha1.PipelineResource{
		ObjectMeta: metav1.ObjectMeta{Name: name, Namespace: namespace},
		Spec: v1alpha1.PipelineResourceSpec{
			Type:   resourceType,
			Params: params,
		},
	}
	resourcePointer := &pipelineResource
	return resourcePointer
}

/* Create a new PipelineRun - repoUrl, resourceBinding and params can be nill depending on the Pipeline
each PipelineRun has a 1 hour timeout: */
func definePipelineRun(pipelineRunName, namespace, saName, repoUrl string,
	pipeline v1alpha1.Pipeline,
	triggerType v1alpha1.PipelineTriggerType,
	resourceBinding []v1alpha1.PipelineResourceBinding,
	params []v1alpha1.Param) *v1alpha1.PipelineRun {

	gitServer, gitOrg, gitRepo := "", "", ""
	err := errors.New("")
	if repoUrl != "" {
		gitServer, gitOrg, gitRepo, err = getGitValues(repoUrl)
		if err != nil {
			logging.Log.Errorf("there was an error getting the Git values: %s", err)
		}
	}

	pipelineRunData := v1alpha1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name:      pipelineRunName,
			Namespace: namespace,
			Labels: map[string]string{
				"app":          "devops-knative",
				gitServerLabel: gitServer,
				gitOrgLabel:    gitOrg,
				gitRepoLabel:   gitRepo,
			},
		},

		Spec: v1alpha1.PipelineRunSpec{
			PipelineRef: v1alpha1.PipelineRef{Name: pipeline.Name},
			// E.g. v1alpha1.PipelineTriggerTypeManual
			Trigger:        v1alpha1.PipelineTrigger{Type: triggerType},
			ServiceAccount: saName,
			Timeout:        &metav1.Duration{Duration: 1 * time.Hour},
			Resources:      resourceBinding,
			Params:         params,
		},
	}
	pipelineRunPointer := &pipelineRunData
	return pipelineRunPointer
}

func getDateTimeAsString() string {
	return strconv.FormatInt(time.Now().Unix(), 10)
}

/* This is the main flow that handles building and deploying: given everything we need to kick off a build, do so */
func createPipelineRunFromWebhookData(buildInformation BuildInformation, r Resource) {
	logging.Log.Debugf("In createPipelineRunFromWebhookData, build information: %s", buildInformation)

	// These can be set either when creating the event handler/github source manually through yml or when installing the Helm chart.
	// For the chart, PIPELINE_RUN_NAMESPACE picks up the specified namespace. If this is set it will be used.

	// Otherwise, we use the namespace where this has been installed. This allows us to have PipelineRuns in namespaces other than the installed to namespace
	// but may require additional RBAC configuration depending on your cluster configuration and service account permissions.

	// The specified service account name is also exposed through the chart's values.yaml: defaulting to "tekton-pipelines".

	pipelineRunNamespaceToUse := ""

	specifiedPipelineRunNamespace := os.Getenv("PIPELINE_RUN_NAMESPACE") // Through the chart's values.yaml: optional
	installedNamespace := os.Getenv("INSTALLED_NAMESPACE")               // This comes from the chart and is always set

	if specifiedPipelineRunNamespace != "" {
		pipelineRunNamespaceToUse = specifiedPipelineRunNamespace
	} else if installedNamespace != "" {
		pipelineRunNamespaceToUse = installedNamespace
	} else {
		pipelineRunNamespaceToUse = "default"
	}

	saName := ""
	providedSaName := os.Getenv("PIPELINE_RUN_SERVICE_ACCOUNT")
	if providedSaName != "" {
		saName = providedSaName
	} else {
		saName = "default"
	}

	logging.Log.Infof("PipelineRuns will be created in the namespace %s", pipelineRunNamespaceToUse)
	logging.Log.Infof("PipelineRuns will be created with the service account %s", saName)

	startTime := getDateTimeAsString()

	// Assumes you've already applied the yml: so the pipeline definition and its tasks must exist upfront.
	generatedPipelineRunName := fmt.Sprintf("devops-pipeline-run-%s", startTime)

	// Todo allow these to be in a different namespace.
	pipelineNs := pipelineRunNamespaceToUse

	// get information from related githubsource instance
	registrySecret, helmSecret, pipelineTemplateName := r.getGitHubSourceInfo(buildInformation.REPOURL, pipelineNs)

	// Unique names are required so timestamp them.
	imageResourceName := fmt.Sprintf("docker-image-%s", startTime)
	gitResourceName := fmt.Sprintf("git-source-%s", startTime)

	pipeline, err := r.getPipelineImpl(pipelineTemplateName, pipelineNs)
	if err != nil {
		logging.Log.Errorf("could not find the pipeline template %s in namespace %s", pipelineTemplateName, pipelineNs)
		return
	} else {
		logging.Log.Debugf("Found the pipeline template %s OK", pipelineTemplateName)
	}

	logging.Log.Debug("Creating PipelineResources next...")

	registryURL := os.Getenv("DOCKER_REGISTRY_LOCATION")
	urlToUse := fmt.Sprintf("%s/%s:%s", registryURL, strings.ToLower(buildInformation.REPONAME), buildInformation.SHORTID)
	logging.Log.Infof("Pushing the image to %s", urlToUse)

	paramsForImageResource := []v1alpha1.Param{{Name: "url", Value: urlToUse}}
	pipelineImageResource := definePipelineResource(imageResourceName, pipelineNs, paramsForImageResource, "image")
	createdPipelineImageResource, err := r.PipelineClient.TektonV1alpha1().PipelineResources(pipelineNs).Create(pipelineImageResource)
	if err != nil {
		logging.Log.Errorf("could not create pipeline image resource to be used in the pipeline, error: %s", err)
	} else {
		logging.Log.Infof("Created pipeline image resource %s successfully", createdPipelineImageResource.Name)
	}

	paramsForGitResource := []v1alpha1.Param{{Name: "revision", Value: buildInformation.COMMITID}, {Name: "url", Value: buildInformation.REPOURL}}
	pipelineGitResource := definePipelineResource(gitResourceName, pipelineNs, paramsForGitResource, "git")
	createdPipelineGitResource, err := r.PipelineClient.TektonV1alpha1().PipelineResources(pipelineNs).Create(pipelineGitResource)

	if err != nil {
		logging.Log.Errorf("could not create pipeline git resource to be used in the pipeline, error: %s", err)
	} else {
		logging.Log.Infof("Created pipeline git resource %s successfully", createdPipelineGitResource.Name)
	}

	gitResourceRef := v1alpha1.PipelineResourceRef{Name: gitResourceName}
	imageResourceRef := v1alpha1.PipelineResourceRef{Name: imageResourceName}

	resources := []v1alpha1.PipelineResourceBinding{{Name: "docker-image", ResourceRef: imageResourceRef}, {Name: "git-source", ResourceRef: gitResourceRef}}

	imageTag := buildInformation.SHORTID
	imageName := fmt.Sprintf("%s/%s", registryURL, strings.ToLower(buildInformation.REPONAME))
	releaseName := fmt.Sprintf("%s-%s", strings.ToLower(buildInformation.REPONAME), buildInformation.SHORTID)
	repositoryName := strings.ToLower(buildInformation.REPONAME)
	params := []v1alpha1.Param{{Name: "image-tag", Value: imageTag},
		{Name: "image-name", Value: imageName},
		{Name: "release-name", Value: releaseName},
		{Name: "repository-name", Value: repositoryName},
		{Name: "target-namespace", Value: pipelineRunNamespaceToUse}}

	if registrySecret != "" {
		params = append(params, v1alpha1.Param{Name: "registry-secret", Value: registrySecret})
	}
	if helmSecret != "" {
		params = append(params, v1alpha1.Param{Name: "helm-secret", Value: helmSecret})
	}

	// PipelineRun yml defines the references to the above named resources.
	pipelineRunData := definePipelineRun(generatedPipelineRunName, pipelineRunNamespaceToUse, saName, buildInformation.REPOURL,
		pipeline, v1alpha1.PipelineTriggerTypeManual, resources, params)

	logging.Log.Infof("Creating a new PipelineRun named %s in the namespace %s using the service account %s", generatedPipelineRunName, pipelineRunNamespaceToUse, saName)

	pipelineRun, err := r.PipelineClient.TektonV1alpha1().PipelineRuns(pipelineRunNamespaceToUse).Create(pipelineRunData)
	if err != nil {
		logging.Log.Errorf("error creating the PipelineRun: %s", err)
	} else {
		logging.Log.Infof("PipelineRun created: %s", pipelineRun)
	}
}

// defines and creates a resource of a specifed type and returns a pipeline resource reference for this resource
// takes a manual pipeline run data struct, namespace for the resource creation, resource name to refer to it and the resource type
func (r Resource) createPipelineResource(resourceData ManualPipelineRun, namespace, resourceName string, resourceType v1alpha1.PipelineResourceType) v1alpha1.PipelineResourceRef {
	logging.Log.Debug("Creating PipelineResource of type %s", resourceType)

	startTime := getDateTimeAsString()

	registryURL := os.Getenv("DOCKER_REGISTRY_LOCATION")
	resourceName = fmt.Sprintf("%s-%s", resourceName, startTime)

	var paramsForResource []v1alpha1.Param
	var typeToUse v1alpha1.PipelineResourceType
	// Unique names are required so timestamp them.
	if resourceType == v1alpha1.PipelineResourceTypeGit {
		typeToUse = resourceType
		paramsForResource = []v1alpha1.Param{{Name: "revision", Value: resourceData.GITCOMMIT}, {Name: "url", Value: resourceData.REPOURL}}
	} else if resourceType == v1alpha1.PipelineResourceTypeImage {
		urlToUse := fmt.Sprintf("%s/%s:%s", registryURL, strings.ToLower(resourceData.REPONAME), resourceData.GITCOMMIT)
		typeToUse = resourceType
		paramsForResource = []v1alpha1.Param{{Name: "url", Value: urlToUse}}
	}

	pipelineResource := definePipelineResource(resourceName, namespace, paramsForResource, typeToUse)
	createdPipelineImageResource, err := r.PipelineClient.TektonV1alpha1().PipelineResources(namespace).Create(pipelineResource)
	if err != nil {
		logging.Log.Errorf("could not create pipeline %s resource to be used in the pipeline, error: %s", resourceType, err)
	} else {
		logging.Log.Infof("Created pipeline %s resource %s successfully", typeToUse, createdPipelineImageResource.Name)
	}

	resourceRef := v1alpha1.PipelineResourceRef{Name: resourceName}
	return resourceRef
}

// Returns the git server excluding transport, org and repo
func getGitValues(url string) (gitServer, gitOrg, gitRepo string, err error) {
	repoURL := ""
	if url != "" {
		url = strings.ToLower(url)
		if strings.Contains(url, "https://") {
			repoURL = strings.TrimPrefix(url, "https://")
		} else {
			repoURL = strings.TrimPrefix(url, "http://")
		}
	}

	// example at this point: github.com/tektoncd/pipeline
	numSlashes := strings.Count(repoURL, "/")
	if numSlashes < 2 {
		return "", "", "", errors.New("Url didn't match the requirements (at least two slashes)")
	}
	repoURL = strings.TrimSuffix(repoURL, "/")

	gitServer = repoURL[0:strings.Index(repoURL, "/")]
	gitOrg = repoURL[strings.Index(repoURL, "/")+1 : strings.LastIndex(repoURL, "/")]
	gitRepo = repoURL[strings.LastIndex(repoURL, "/")+1:]

	return gitServer, gitOrg, gitRepo, nil
}

// HandleWebhook should be called when we hit the / endpoint with webhook data. Todo provide proper responses e.g. 503, server errors, 200 if good
func (r Resource) HandleWebhook(request *restful.Request, response *restful.Response) {
	logging.Log.Debugf("In HandleWebhook code with error handling for a GitHub event...")
	buildInformation := BuildInformation{}
	gitHubEvent := os.Getenv("EVENT_HEADER_NAME")
	logging.Log.Infof("Github event name to look for is: %s", gitHubEvent)
	gitHubEventType := request.HeaderParameter(gitHubEvent)

	if len(gitHubEventType) < 1 {
		logging.Log.Errorf("found header (%s) exists but has no value! Request is: %s", gitHubEvent, request)
		return
	}

	gitHubEventTypeString := strings.Replace(gitHubEventType, "\"", "", -1)

	logging.Log.Debugf("GitHub event type is %s", gitHubEventTypeString)

	timestamp := getDateTimeAsString()

	if gitHubEventTypeString == "push" {
		logging.Log.Debugf("Handling a push event...")

		webhookData := gh.PushPayload{}

		if err := request.ReadEntity(&webhookData); err != nil {
			logging.Log.Errorf("an error occurred decoding webhook data: %s", err)
			return
		}

		buildInformation.REPOURL = webhookData.Repository.URL
		buildInformation.SHORTID = webhookData.HeadCommit.ID[0:7]
		buildInformation.COMMITID = webhookData.HeadCommit.ID
		buildInformation.REPONAME = webhookData.Repository.Name
		buildInformation.TIMESTAMP = timestamp

		createPipelineRunFromWebhookData(buildInformation, r)
		logging.Log.Debugf("Build information for repository %s:%s %s", buildInformation.REPOURL, buildInformation.SHORTID, buildInformation)

	} else if gitHubEventTypeString == "pull_request" {
		logging.Log.Debugf("Handling a pull request event...")

		webhookData := gh.PullRequestPayload{}

		if err := request.ReadEntity(&webhookData); err != nil {
			logging.Log.Errorf("an error occurred decoding webhook data: %s", err)
			return
		}

		buildInformation.REPOURL = webhookData.Repository.HTMLURL
		buildInformation.SHORTID = webhookData.PullRequest.Head.Sha[0:7]
		buildInformation.COMMITID = webhookData.PullRequest.Head.Sha
		buildInformation.REPONAME = webhookData.Repository.Name
		buildInformation.TIMESTAMP = timestamp

		createPipelineRunFromWebhookData(buildInformation, r)
		logging.Log.Debugf("Build information for repository %s:%s %s", buildInformation.REPOURL, buildInformation.SHORTID, buildInformation)

	} else {
		logging.Log.Errorf("event wasn't a push or pull event, no action will be taken")
	}

}

/* Get the logs for a given pipelinerun by name in a given namespace */
func (r Resource) getPipelineRunLog(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")

	pipelineruns := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace)
	pipelinerun, err := pipelineruns.Get(name, metav1.GetOptions{})
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}

	buf := new(bytes.Buffer)
	var podLogs io.ReadCloser
	for key, taskrunstatus := range pipelinerun.Status.TaskRuns {
		podname := taskrunstatus.Status.PodName
		pod, err := r.K8sClient.CoreV1().Pods(namespace).Get(podname, metav1.GetOptions{})
		if err != nil {
			continue
		}
		containers := append(append([]v1.Container{}, pod.Spec.Containers...), pod.Spec.InitContainers...)
		for _, container := range containers {
			buf.WriteString("\n=== " + podname + ": " + key + ": " + container.Name + " ===\n")
			req := r.K8sClient.CoreV1().Pods(namespace).GetLogs(podname, &v1.PodLogOptions{Container: container.Name})
			if req.URL().Path == "" {
				continue
			}
			podLogs, err = req.Stream()
			if err != nil {
				continue
			}
			_, err = io.Copy(buf, podLogs)
			if err != nil {
				podLogs.Close()
				continue
			}
			podLogs.Close()
		}
	}

	str := buf.String()
	response.AddHeader("Content-Type", "text/plain")
	response.WriteEntity(str)
}

/* Get all pipeline resources in a given namespace */
func (r Resource) getAllPipelineResources(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	pipelineresources := r.PipelineClient.TektonV1alpha1().PipelineResources(namespace)
	logging.Log.Debugf("In getAllPipelineResources: namespace: %s", namespace)

	pipelineresourcelist, err := pipelineresources.List(metav1.ListOptions{})
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(pipelineresourcelist)
}

/* Update a given PipelineRun by name in a given namespace */
func (r Resource) updatePipelineRun(request *restful.Request, response *restful.Response) {
	name := request.PathParameter("name")
	namespace := request.PathParameter("namespace")
	logging.Log.Debugf("In updatePipelineRun, name: %s, namespace: %s", name, namespace)

	pipelineRun, err := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace).Get(name, metav1.GetOptions{})
	if err != nil || pipelineRun == nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	} else {
		logging.Log.Debug("Found the PipelineRun ok")
	}

	// We've found the PipelineRun at this stage

	updateBody := PipelineRunUpdateBody{}
	updateBody.STATUS = ""

	if err := request.ReadEntity(&updateBody); err != nil {
		logging.Log.Errorf("error decoding the PipelineRun status request body: %s", err)
		utils.RespondError(response, err, http.StatusBadRequest)
		return
	}

	currentStatus := pipelineRun.Spec.Status
	desiredStatus := v1alpha1.PipelineRunSpecStatus(updateBody.STATUS)

	logging.Log.Debugf("Current status of PipelineRun %s in namespace %s is: %s, wanting status: %s", name, namespace, currentStatus, desiredStatus)

	// If there's anything else we want to allow, update this code
	if desiredStatus != "PipelineRunCancelled" {
		errorMsg := "error updating PipelineRun status (bad request received), status must be set to PipelineRunCancelled."
		logging.Log.Errorf(errorMsg)
		err := errors.New(errorMsg)
		utils.RespondError(response, err, http.StatusBadRequest)
		return
	}

	if currentStatus != desiredStatus {
		pipelineRun.Spec.Status = desiredStatus
		_, err := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace).Update(pipelineRun)
		if err != nil {
			logging.Log.Errorf("error updating PipelineRun status: %s", err)
			utils.RespondError(response, err, http.StatusInternalServerError)
			return
		} else {
			logging.Log.Debugf("PipelineRun status updated OK to %s", pipelineRun.Spec.Status)
		}
	} else {
		errorMsg := fmt.Sprintf("error: Status was already set to %s", desiredStatus)
		logging.Log.Error(errorMsg)
		err := errors.New(errorMsg)
		utils.RespondError(response, err, http.StatusPreconditionFailed)
		return
	}
	logging.Log.Debug("Update performed successfully, returning http code 204")
	// Not to be confused with WriteEntity which always gives a 200 even if the parameter is something other than StatusOk
	response.WriteHeader(http.StatusNoContent)
}

// StartPipelineRunController - registers the code that reacts to changes in kube PipelineRuns
func (r Resource) StartPipelineRunController(stopCh <-chan struct{}) {
	logging.Log.Debug("Into StartPipelineRunController")

	pipelineRunInformerFactory := informers.NewSharedInformerFactory(r.PipelineClient, time.Second*30)
	pipelineRunInformer := pipelineRunInformerFactory.Tekton().V1alpha1().PipelineRuns()
	pipelineRunInformer.Informer().AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    r.pipelineRunCreated,
		UpdateFunc: r.pipelineRunUpdated,
		DeleteFunc: r.pipelineRunDeleted,
	})
	go pipelineRunInformerFactory.Start(stopCh)
	logging.Log.Info("PipelineRun Controller Started")
}

func (r Resource) pipelineRunCreated(obj interface{}) {
	logging.Log.Debug("In pipelineRunCreated")

	data := broadcaster.SocketData{
		MessageType: broadcaster.PipelineRunCreated,
		Payload:     obj.(*v1alpha1.PipelineRun),
	}

	pipelineRunsChannel <- data
}

func (r Resource) pipelineRunUpdated(oldObj, newObj interface{}) {

	if newObj.(*v1alpha1.PipelineRun).GetResourceVersion() != oldObj.(*v1alpha1.PipelineRun).GetResourceVersion() {
		logging.Log.Debug("Pipelinerun update recorded")
		data := broadcaster.SocketData{
			MessageType: broadcaster.PipelineRunUpdated,
			Payload:     newObj.(*v1alpha1.PipelineRun),
		}
		pipelineRunsChannel <- data
	}
}

func (r Resource) pipelineRunDeleted(obj interface{}) {
	logging.Log.Debug("In pipelineRunDeleted")

	data := broadcaster.SocketData{
		MessageType: broadcaster.PipelineRunDeleted,
		Payload:     obj.(*v1alpha1.PipelineRun),
	}

	pipelineRunsChannel <- data
}
