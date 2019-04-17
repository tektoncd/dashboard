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
	"strconv"
	"strings"
	"time"

	"github.com/tektoncd/dashboard/pkg/broadcaster"

	restful "github.com/emicklei/go-restful"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/utils"
	v1alpha1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	informers "github.com/tektoncd/pipeline/pkg/client/informers/externalversions"
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

// PipelineRunUpdateBody - represents a request that a user may provide for updating a PipelineRun
// Currently only modifying the status is supported but this gives us scope for adding additional fields
type PipelineRunUpdateBody struct {
	STATUS string `json:"status"`
}

// TaskRunLog - represents a task run's logs (including logs for containers)
type TaskRunLog struct {
	PodName string
	// Containers correlating to Task step definitions
	StepContainers []LogContainer
	// Additional Containers correlating to Task e.g. PipelineResources
	PodContainers  []LogContainer
	InitContainers []LogContainer
}

// LogContainer - represents the logs for a given container
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
	}
	logging.Log.Debug("Found the pipeline definition OK")
	return *pipeline, nil
}

/* Get all pipeline runs in a given namespace, filters based on query parameters */
func (r Resource) getAllPipelineRuns(request *restful.Request, response *restful.Response) {
	// Request Params
	namespace := request.PathParameter("namespace")
	// Query Params
	repository := request.QueryParameter("repository")
	name := request.QueryParameter("name")
	logging.Log.Debugf("In getAllPipelineRuns: namespace: `%s`, repository query: `%s`, repository query: `%s`", namespace, repository, name)

	pipelinerunInterface := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace)
	var pipelinerunList *v1alpha1.PipelineRunList
	var labelSelector string // key1=value1,key2=value2, ...
	var fieldSelector string // metadata.something=something, ...
	var err error

	// repository query filter
	if repository != "" {
		server, org, repo := getGitValues(repository)
		labels := []string {
			gitServerLabel + "=" + server,
			gitOrgLabel + "=" + org,
			gitRepoLabel + "=" + repo,
		}
		labelSelector = strings.Join(labels,",")
	}
	// name query filter
	if name != "" {
		fieldSelector = "metadata.name=" + name
	}
	pipelinerunList, err = pipelinerunInterface.List(metav1.ListOptions{LabelSelector: labelSelector,FieldSelector: fieldSelector})
	logging.Log.Debugf("+%v", pipelinerunList.Items)
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(pipelinerunList)
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

/* Get all task runs in a given namespace, filters based on query parameters */
func (r Resource) getAllTaskRuns(request *restful.Request, response *restful.Response) {
	// Path params
	namespace := request.PathParameter("namespace")
	// Query params
	name := request.QueryParameter("name")
	logging.Log.Debugf("In getAllTaskRuns, namespace: `%s`, name query: `%s`", namespace, name)

	taskrunInterface := r.PipelineClient.TektonV1alpha1().TaskRuns(namespace)

	var fieldSelector string // metadata.something=something, ...
	// name query filter
	if name != "" {
		fieldSelector = "metadata.name=" + name
	}
	taskrunList, err := taskrunInterface.List(metav1.ListOptions{FieldSelector: fieldSelector})
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(taskrunList)
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

/* Create a new PipelineResource: this should be of type git or image */
func definePipelineRun(pipelineRunName, namespace, saName, gitServer, gitOrg, gitRepo string,
	pipeline v1alpha1.Pipeline,
	triggerType v1alpha1.PipelineTriggerType,
	resourceBinding []v1alpha1.PipelineResourceBinding,
	params []v1alpha1.Param) *v1alpha1.PipelineRun {

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

// Returns the git server excluding transport, org and repo
func getGitValues(url string) (gitServer, gitOrg, gitRepo string) {
	repoURL := ""
	if url != "" {
		url = strings.ToLower(url)
		if strings.Contains(url, "https://") {
			repoURL = strings.TrimPrefix(url, "https://")
		} else {
			repoURL = strings.TrimPrefix(url, "http://")
		}
	}
	repoURL = strings.TrimSuffix(repoURL, "/")
	gitServer = repoURL[0:strings.Index(repoURL, "/")]
	gitOrg = repoURL[strings.Index(repoURL, "/")+1 : strings.LastIndex(repoURL, "/")]
	gitRepo = repoURL[strings.LastIndex(repoURL, "/")+1:]

	return gitServer, gitOrg, gitRepo
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
	}
	logging.Log.Debug("Found the PipelineRun ok")

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
		}
		logging.Log.Debugf("PipelineRun status updated OK to %s", pipelineRun.Spec.Status)
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
