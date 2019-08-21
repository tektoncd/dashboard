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

	restful "github.com/emicklei/go-restful"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/utils"
	v1alpha1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

//BuildInformation - information required to build a particular commit from a Git repository.
type BuildInformation struct {
	REPOURL   string
	SHORTID   string
	COMMITID  string
	REPONAME  string
	TIMESTAMP string
}

// AppResponse represents an error with a code, message, and the error itself
type AppResponse struct {
	ERROR   error
	MESSAGE string
	CODE    int
}

// BuildRequest - a manual submission data struct
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

// ResourceBinding - a name and a reference to a resource
type ResourceBinding struct {
	BINDINGNAME     string `json:"bindingname"`
	RESOURCEREFNAME string `json:"resourcerefname"`
}

//ManualPipelineRun - represents the data required to create a new PipelineRun
type ManualPipelineRun struct {
	PIPELINENAME      string `json:"pipelinename"`
	REGISTRYLOCATION  string `json:"registrylocation,omitempty"`
	SERVICEACCOUNT    string `json:"serviceaccount,omitempty"`
	PIPELINERUNTYPE   string `json:"pipelineruntype,omitempty"`
	GITRESOURCENAME   string `json:"gitresourcename,omitempty"`
	IMAGERESOURCENAME string `json:"imageresourcename,omitempty"`
	GITCOMMIT         string `json:"gitcommit,omitempty"`
	REPONAME          string `json:"reponame,omitempty"`
	REPOURL           string `json:"repourl,omitempty"`
	HELMSECRET        string `json:"helmsecret,omitempty"`
	APPLYDIRECTORY    string `json:"applydirectory,omitempty"`
}

// PipelineRunUpdateBody - represents a request that a user may provide for updating a PipelineRun
// Currently only modifying the status is supported but this gives us scope for adding additional fields
type PipelineRunUpdateBody struct {
	STATUS string `json:"status"`
}

// PipelineRunRebuild - a name only for now
type RebuildRequest struct {
	PIPELINERUNNAME string `json:"pipelinerunname"`
}

type PipelineRunLog []TaskRunLog
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

const CRDNameLengthLimit = 53

// Unexported field within tekton
// "github.com/tektoncd/pipeline/pkg/reconciler/v1alpha1/taskrun/resources"
const ContainerPrefix = "build-step-"

const GitServerLabel = "gitServer"
const GitOrgLabel = "gitOrg"
const GitRepoLabel = "gitRepo"

/* Get all pipelines in a given namespace: the caller needs to handle any errors,
an empty v1alpha1.Pipeline{} is returned if no pipeline is found */
func (r Resource) getPipelineImpl(name, namespace string) (v1alpha1.Pipeline, error) {
	logging.Log.Debugf("In getPipelineImpl - name: %s, namespace: %s", name, namespace)

	pipelines := r.PipelineClient.TektonV1alpha1().Pipelines(namespace)
	pipeline, err := pipelines.Get(name, metav1.GetOptions{})
	if err != nil {
		return v1alpha1.Pipeline{}, err
	}
	return *pipeline, nil
}

/* Get a given pipeline run by name in a given namespace */
func (r Resource) GetPipelineRun(request *restful.Request, response *restful.Response) {
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

func (r Resource) CreatePipelineRun(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")

	pipelineRunData := ManualPipelineRun{}
	if err := request.ReadEntity(&pipelineRunData); err != nil {
		logging.Log.Error("error parsing request body on call to createPipelineRun %s", err)
		utils.RespondError(response, err, http.StatusBadRequest)
		return
	}

	createResponse, pipelineRunName := r.createPipelineRunImpl(pipelineRunData, namespace)
	if createResponse.CODE == http.StatusCreated {
		utils.WriteResponseLocation(request, response, pipelineRunName)
	} else { // anything other than 201 is an error - RespondError
		utils.RespondError(response, createResponse.ERROR, createResponse.CODE)
	}
}

/*CreatePipelineRunImpl - Create a new manual pipeline run and resources in a given namespace
method assumes you've already applied the yaml: so the pipeline definition and its tasks must exist upfront*/
func (r Resource) createPipelineRunImpl(pipelineRunData ManualPipelineRun, namespace string) (response *AppResponse, name string) {

	pipelineName := pipelineRunData.PIPELINENAME
	serviceAccount := pipelineRunData.SERVICEACCOUNT
	registryLocation := pipelineRunData.REGISTRYLOCATION

	timestamp := time.Now().UnixNano()
	generatedPipelineRunName := fmt.Sprintf("%s-run-%d", pipelineName, timestamp)
	// Shorten name
	if len(generatedPipelineRunName) > CRDNameLengthLimit {
		generatedPipelineRunName = generatedPipelineRunName[:CRDNameLengthLimit-1]
	}

	var targetNamespaceForPipeline0 string
	if pipelineName == "pipeline0" {
		// Set target namespace to apply resources in
		targetNamespaceForPipeline0 = namespace
		namespace = os.Getenv("INSTALLED_NAMESPACE")
	}

	pipeline, err := r.getPipelineImpl(pipelineName, namespace)
	if err != nil {
		errorMsg := fmt.Sprintf("could not find the pipeline template %s in namespace %s", pipelineName, namespace)
		logging.Log.Errorf(errorMsg)
		return &AppResponse{err, errorMsg, http.StatusPreconditionFailed}, ""
	}

	logging.Log.Debugf("Found the pipeline template %s OK", pipelineName)

	var gitResource v1alpha1.PipelineResourceRef
	var imageResource v1alpha1.PipelineResourceRef

	resources := []v1alpha1.PipelineResourceBinding{}

	if pipelineRunData.GITRESOURCENAME != "" {
		gitResource, err = r.createPipelineResourceForPipelineRun(pipelineRunData, namespace, pipelineRunData.GITRESOURCENAME, v1alpha1.PipelineResourceTypeGit, timestamp)
		if err != nil {
			errorMsg := fmt.Sprintf("Could not create the PipelineResource of type Git with provided name %s", pipelineRunData.GITRESOURCENAME)
			logging.Log.Error(errorMsg)
			return &AppResponse{err, errorMsg, http.StatusInternalServerError}, ""
		}
		resources = append(resources, v1alpha1.PipelineResourceBinding{Name: pipelineRunData.GITRESOURCENAME, ResourceRef: gitResource})
	}

	if pipelineRunData.IMAGERESOURCENAME != "" {
		imageResource, err = r.createPipelineResourceForPipelineRun(pipelineRunData, namespace, pipelineRunData.IMAGERESOURCENAME, v1alpha1.PipelineResourceTypeImage, timestamp)
		if err != nil {
			errorMsg := fmt.Sprintf("Could not create the PipelineResource of type Image with provided name %s", pipelineRunData.IMAGERESOURCENAME)
			logging.Log.Error(errorMsg)
			return &AppResponse{err, errorMsg, http.StatusInternalServerError}, ""
		}
		resources = append(resources, v1alpha1.PipelineResourceBinding{Name: pipelineRunData.IMAGERESOURCENAME, ResourceRef: imageResource})
	}

	repoName := pipelineRunData.REPONAME
	imageTag := pipelineRunData.GITCOMMIT
	imageName := fmt.Sprintf("%s/%s", registryLocation, strings.ToLower(repoName))
	releaseName := fmt.Sprintf("%s-%s", strings.ToLower(repoName), pipelineRunData.GITCOMMIT)
	repositoryName := strings.ToLower(repoName)

	var params []v1alpha1.Param
	if pipelineRunData.PIPELINERUNTYPE == "helm" {
		params = []v1alpha1.Param{
			{Name: "image-tag", Value: imageTag},
			{Name: "image-name", Value: imageName},
			{Name: "release-name", Value: releaseName},
			{Name: "repository-name", Value: repositoryName},
			{Name: "target-namespace", Value: namespace}}
	} else {
		params = []v1alpha1.Param{{Name: "target-namespace", Value: namespace}}
	}

	if pipelineRunData.HELMSECRET != "" {
		params = append(params, v1alpha1.Param{Name: "helm-secret", Value: pipelineRunData.HELMSECRET})
	}
	if pipelineName == "pipeline0" {
		if pipelineRunData.APPLYDIRECTORY != "" {
			params = append(params, v1alpha1.Param{Name: "apply-directory", Value: pipelineRunData.APPLYDIRECTORY})
		}
		params = append(params, v1alpha1.Param{Name: "target-namespace", Value: targetNamespaceForPipeline0})
	}

	// PipelineRun yaml defines references to resources
	newPipelineRunData, err := definePipelineRun(generatedPipelineRunName, namespace, serviceAccount, pipelineRunData.REPOURL, pipeline, v1alpha1.PipelineTriggerTypeManual, resources, params)
	if err != nil {
		errorMsg := fmt.Sprintf("there was a problem defining the pipeline run: %s", err)
		logging.Log.Error(errorMsg)
		return &AppResponse{err, errorMsg, http.StatusInternalServerError}, ""
	}

	logging.Log.Infof("Creating a new PipelineRun named %s in the namespace %s", generatedPipelineRunName, namespace)

	pipelineRun, err := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace).Create(newPipelineRunData)
	if err != nil {
		errorMsg := fmt.Sprintf("error creating the PipelineRun: %s", err)
		logging.Log.Errorf(errorMsg)
		return &AppResponse{err, errorMsg, http.StatusInternalServerError}, ""
	}

	creationMsg := fmt.Sprintf("PipelineRun created with name: %s", pipelineRun.Name)
	logging.Log.Debugf(creationMsg)
	return &AppResponse{err, creationMsg, http.StatusCreated}, pipelineRun.Name
}

/* Get the logs for a given task run by name in a given namespace */
func (r Resource) GetTaskRunLog(request *restful.Request, response *restful.Response) {
	taskRunName := request.PathParameter("name")
	namespace := request.PathParameter("namespace")

	logging.Log.Debugf("In getTaskRunLog - name: %s, namespace: %s", taskRunName, namespace)
	taskRunsInterface := r.PipelineClient.TektonV1alpha1().TaskRuns(namespace)
	taskRun, err := taskRunsInterface.Get(taskRunName, metav1.GetOptions{})
	if err != nil || taskRun.Status.PodName == "" {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}

	pod, err := r.K8sClient.CoreV1().Pods(namespace).Get(taskRun.Status.PodName, metav1.GetOptions{})
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(makeTaskRunLog(r, namespace, pod))
}

func makeTaskRunLog(r Resource, namespace string, pod *v1.Pod) TaskRunLog {
	podContainers := pod.Spec.Containers
	initContainers := pod.Spec.InitContainers

	taskRunLog := TaskRunLog{PodName: pod.Name}
	buf := new(bytes.Buffer)
	setContainers := func(containers []v1.Container, filter func(l LogContainer)) {
		for _, container := range containers {
			buf.Reset()
			step := LogContainer{Name: container.Name}
			req := r.K8sClient.CoreV1().Pods(namespace).GetLogs(pod.Name, &v1.PodLogOptions{Container: container.Name})
			if req.URL().Path == "" {
				continue
			}
			podLogs, _ := req.Stream()
			if podLogs == nil {
				continue
			}
			_, err := io.Copy(buf, podLogs)
			if err != nil {
				podLogs.Close()
				continue
			}
			logs := strings.Split(buf.String(), "\n")
			for _, log := range logs {
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
		if strings.HasPrefix(l.Name, ContainerPrefix) {
			taskRunLog.StepContainers = append(taskRunLog.StepContainers, l)
		} else {
			taskRunLog.PodContainers = append(taskRunLog.PodContainers, l)
		}
	})
	return taskRunLog
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

/* Create a new PipelineRun - repoUrl, resourceBinding and params can be nil depending on the Pipeline
each PipelineRun has a 1 hour timeout: */
func definePipelineRun(pipelineRunName, namespace, saName, repoUrl string,
	pipeline v1alpha1.Pipeline,
	triggerType v1alpha1.PipelineTriggerType,
	resourceBinding []v1alpha1.PipelineResourceBinding,
	params []v1alpha1.Param) (*v1alpha1.PipelineRun, error) {

	gitServer, gitOrg, gitRepo := "", "", ""
	var err error
	if repoUrl != "" {
		gitServer, gitOrg, gitRepo, err = getGitValues(repoUrl)
		if err != nil {
			logging.Log.Errorf("there was an error getting the Git values: %s", err)
			return &v1alpha1.PipelineRun{}, err
		}
	}

	pipelineRunData := v1alpha1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name:      pipelineRunName,
			Namespace: namespace,
			Labels: map[string]string{
				"app":          "tekton-app",
				GitServerLabel: gitServer,
				GitOrgLabel:    gitOrg,
				GitRepoLabel:   gitRepo,
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
	return pipelineRunPointer, nil
}

// defines and creates a resource of a specifed type and returns a pipeline resource reference for this resource
// takes a manual pipeline run data struct, namespace for the resource creation, resource name to refer to it and the resource type
func (r Resource) createPipelineResourceForPipelineRun(resourceData ManualPipelineRun, namespace, resourceName string,
	resourceType v1alpha1.PipelineResourceType, timestamp int64) (v1alpha1.PipelineResourceRef, error) {

	logging.Log.Debugf("Creating PipelineResource of type %s", resourceType)

	registryURL := resourceData.REGISTRYLOCATION
	resourceName = fmt.Sprintf("%s-%d", resourceName, timestamp)
	// Shorten name
	if len(resourceName) > CRDNameLengthLimit {
		resourceName = resourceName[:CRDNameLengthLimit-1]
	}

	var paramsForResource []v1alpha1.Param
	// Unique names are required so timestamp them.
	if resourceType == v1alpha1.PipelineResourceTypeGit {
		paramsForResource = []v1alpha1.Param{{Name: "revision", Value: resourceData.GITCOMMIT}, {Name: "url", Value: resourceData.REPOURL}}
	} else if resourceType == v1alpha1.PipelineResourceTypeImage {
		urlToUse := fmt.Sprintf("%s/%s:%s", registryURL, strings.ToLower(resourceData.REPONAME), resourceData.GITCOMMIT)
		paramsForResource = []v1alpha1.Param{{Name: "url", Value: urlToUse}}
	}

	pipelineResource := definePipelineResource(resourceName, namespace, paramsForResource, resourceType)
	createdPipelineImageResource, err := r.PipelineClient.TektonV1alpha1().PipelineResources(namespace).Create(pipelineResource)
	if err != nil {
		logging.Log.Errorf("could not create pipeline %s resource to be used in the pipeline, error: %s", resourceType, err)
		return v1alpha1.PipelineResourceRef{}, err
	} else {
		logging.Log.Infof("Created pipeline %s resource %s successfully", resourceType, createdPipelineImageResource.Name)
	}

	resourceRef := v1alpha1.PipelineResourceRef{Name: resourceName}
	return resourceRef, nil
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

	repoURL = strings.TrimSuffix(repoURL, "/")

	// example at this point: github.com/tektoncd/pipeline
	numSlashes := strings.Count(repoURL, "/")
	if numSlashes < 2 {
		return "", "", "", errors.New("Url didn't match the requirements (at least two slashes)")
	}

	gitServer = repoURL[0:strings.Index(repoURL, "/")]
	gitOrg = repoURL[strings.Index(repoURL, "/")+1 : strings.LastIndex(repoURL, "/")]
	gitRepo = repoURL[strings.LastIndex(repoURL, "/")+1:]

	return gitServer, gitOrg, gitRepo, nil
}

/* Get the logs for a given pipelinerun by name in a given namespace */
func (r Resource) GetPipelineRunLog(request *restful.Request, response *restful.Response) {
	namespace := request.PathParameter("namespace")
	name := request.PathParameter("name")

	pipelineruns := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace)
	pipelinerun, err := pipelineruns.Get(name, metav1.GetOptions{})
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}

	var pipelineRunLogs PipelineRunLog
	for _, taskrunstatus := range pipelinerun.Status.TaskRuns {
		podname := taskrunstatus.Status.PodName
		pod, err := r.K8sClient.CoreV1().Pods(namespace).Get(podname, metav1.GetOptions{})
		if err != nil {
			continue
		}
		pipelineRunLogs = append(pipelineRunLogs, makeTaskRunLog(r, namespace, pod))
	}
	response.WriteEntity(pipelineRunLogs)
}

/* Update a given PipelineRun by name in a given namespace */
func (r Resource) UpdatePipelineRun(request *restful.Request, response *restful.Response) {
	name := request.PathParameter("name")
	namespace := request.PathParameter("namespace")
	logging.Log.Debugf("In updatePipelineRun - name: %s, namespace: %s", name, namespace)

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
	if desiredStatus != v1alpha1.PipelineRunSpecStatusCancelled {
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

	response.WriteHeader(204)
}

func (r Resource) rebuildRun(name, namespace string) (*v1alpha1.PipelineRun, error) {
	pipelineRuns := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace)
	pipelineRun, err := pipelineRuns.Get(name, metav1.GetOptions{})

	if err != nil {
		logging.Log.Errorf("couldn't find the PipelineRun to rebuild, searched for %s in namespace %s", name, namespace)
		return nil, err
	} else {
		logging.Log.Debugf("Found the PipelineRun to rebuild (%s in namespace %s)", name, namespace)
	}

	newPipelineRunData := pipelineRun
	newPipelineRunData.Name = generateNewNameForRebuild(name)
	newPipelineRunData.ResourceVersion = ""

	// It's mandatory, so if it's not set already choose manual
	if newPipelineRunData.Spec.Trigger.Type == "" {
		newPipelineRunData.Spec.Trigger.Type = v1alpha1.PipelineTriggerTypeManual
	}

	currentLabels := pipelineRun.GetLabels()

	if currentLabels == nil {
		logging.Log.Debug("Didn't find any existing labels, so creating a new one")
		withRebuildLabel := map[string]string{"rebuilds": pipelineRun.Name}
		newPipelineRunData.SetLabels(withRebuildLabel)
	} else {
		logging.Log.Debug("Found existing label(s), adding rebuilds label")
		currentLabels["rebuilds"] = pipelineRun.Name
		newPipelineRunData.SetLabels(currentLabels)
	}

	logging.Log.Debugf("new PipelineRun data is: %v", newPipelineRunData)

	rebuiltRun, err := r.PipelineClient.TektonV1alpha1().PipelineRuns(pipelineRun.Namespace).Create(newPipelineRunData)

	if err != nil {
		logging.Log.Errorf("an error occurred rebuilding the PipelineRun %s in namespace %s: %s", name, namespace, err)
		return nil, err
	}
	return rebuiltRun, nil
}

// If the PipelineRun does not contain -r-*five digits*, add it. The five digits being time in nanoseconds.
// If it does replace that r-*digits* with a new generated one using the new timestamp.

func generateNewNameForRebuild(name string) string {
	newName := name

	endsInDashAndNumbers := false
	// Has -r- in it already?
	if strings.Contains(name, "-r-") {
		lastIndexOfDash := strings.LastIndex(name, "-r-")
		charsAfterLastIndex := name[lastIndexOfDash+2:]
		// We found digits: no error when converting from str to int
		if asANumber, err := strconv.Atoi(charsAfterLastIndex); err == nil {
			endsInDashAndNumbers = true
			// Get a timestamp now
			newTimestamp := time.Now().Nanosecond()
			previousTimestampAsString := strconv.Itoa(asANumber)
			// We want it as a string to use in the name
			newTimestampAsString := strconv.Itoa(newTimestamp)
			// Get the last five chars
			newStringTrimmed := fmt.Sprintf("-%s", newTimestampAsString[4:])
			newName = strings.Replace(name, previousTimestampAsString, newStringTrimmed, 1)
		}
	}

	// It doesn't already, so add this new suffix
	if !endsInDashAndNumbers {
		newName = fmt.Sprintf("%s-r-%s", newName, strconv.Itoa(time.Now().Nanosecond())[4:])
	}

	logging.Log.Debugf("Rebuilt PipelineRun name: %s", newName)

	return newName
}

/* E.g. POST to http://localhost:9097/v1/namespaces/default/rebuild (provide name in the request body)
   TODO eventually this would be great to take different params too as users may want to run the \
	 same pipeline just with different inputs */

func (r Resource) rebuildImpl(existingPipelineRun *v1alpha1.PipelineRun, existingPipelineRunName, namespace string) (*v1alpha1.PipelineRun, error) {
	logging.Log.Debug("in rebuildImpl")

	if existingPipelineRunName != "" {
		// rebuildRun handles errors and logs them
		rebuiltRun, err := r.rebuildRun(existingPipelineRunName, namespace)
		if err != nil {
			return nil, err
		}
		return rebuiltRun, nil
	}

	if existingPipelineRun != nil {
		madeRun, err := r.PipelineClient.TektonV1alpha1().PipelineRuns(existingPipelineRun.Namespace).Create(existingPipelineRun)
		if err != nil {
			logging.Log.Errorf("error creating a new PipelineRun from spec: %s", err)
			return nil, err
		}
		return madeRun, nil
	}

	return nil, errors.New("rebuild was called without a name of a PipelineRun to rebuild or a PipelineRun spec - nothing to do")
}

// RebuildPipelineRun rebuilds a given PipelineRun by name in a given namespace
func (r Resource) RebuildPipelineRun(request *restful.Request, response *restful.Response) {
	logging.Log.Debugf("in RebuildPipelineRun")
	namespace := request.PathParameter("namespace")

	requestData := RebuildRequest{}

	if err := request.ReadEntity(&requestData); err != nil {
		logging.Log.Errorf("error parsing request body on call to rebuild %s", err)
		utils.RespondError(response, err, http.StatusBadRequest)
		return
	}

	logging.Log.Debugf("Request data: %v", requestData)

	if requestData.PIPELINERUNNAME != "" {
		// It's a rebuild: they've provided a name and want a new one. This is a new PipelineRun.
		logging.Log.Debug("No name has been provided and a request has been made to rebuild with the name of an existing PipelineRun")
		logging.Log.Debugf("Rebuilding PipelineRun: %s", requestData.PIPELINERUNNAME)
		// A lookup will be made for the run, so no need to provide full data
		// Method handles any error reporting through logs
		rebuiltRun, err := r.rebuildImpl(nil, requestData.PIPELINERUNNAME, namespace)
		if err != nil {
			utils.RespondError(response, err, http.StatusInternalServerError)
			return
		} else {
			// All is well, include the name of the new rebuilt run in the response
			logging.Log.Debugf("Rebuilt ok, name is: %s", rebuiltRun.Name)
			utils.WriteResponseLocation(request, response, rebuiltRun.Name)
			return
		}
	}
	// We should never get here - but if so, they've given us a request we can't handle
	logging.Log.Error("didn't receive a request we could actually handle!")
	response.WriteHeader(http.StatusBadRequest)
}
