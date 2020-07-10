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
	"errors"
	"fmt"
	"net/http"
	"strings"

	restful "github.com/emicklei/go-restful"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/utils"
	v1alpha1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"

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

// PipelineRunUpdateBody - represents a request that a user may provide for updating a PipelineRun
// Currently only modifying the status is supported but this gives us scope for adding additional fields
type PipelineRunUpdateBody struct {
	STATUS string `json:"status"`
}

type RerunRequest struct {
	PIPELINERUNNAME string `json:"pipelinerunname"`
}

func (r Resource) Rerun(name, namespace string) (*v1alpha1.PipelineRun, error) {
	pipelineRuns := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace)
	pipelineRun, err := pipelineRuns.Get(name, metav1.GetOptions{})

	if err != nil {
		logging.Log.Errorf("couldn't find the PipelineRun to rerun, searched for %s in namespace %s", name, namespace)
		return nil, err
	} else {
		logging.Log.Debugf("Found the PipelineRun to rerun (%s in namespace %s)", name, namespace)
	}

	newPipelineRunData := pipelineRun
	newPipelineRunData.Name = ""
	newPipelineRunData.Spec.Status = ""
	theName := generateNewNameForRerun(name)
	newPipelineRunData.GenerateName = theName
	newPipelineRunData.ResourceVersion = ""

	currentLabels := pipelineRun.GetLabels()

	if currentLabels == nil {
		logging.Log.Debug("Didn't find any existing labels, so creating a new one")
		withRerunLabel := map[string]string{"reruns": pipelineRun.Name}
		newPipelineRunData.SetLabels(withRerunLabel)
	} else {
		logging.Log.Debug("Found existing label(s), adding reruns label")
		currentLabels["reruns"] = pipelineRun.Name
		newPipelineRunData.SetLabels(currentLabels)
	}

	rebuiltRun, err := r.PipelineClient.TektonV1alpha1().PipelineRuns(pipelineRun.Namespace).Create(newPipelineRunData)

	if err != nil {
		logging.Log.Errorf("an error occurred rerunning the PipelineRun %s in namespace %s: %s", name, namespace, err)
		return nil, err
	}
	return rebuiltRun, nil
}

// If the PipelineRun does not contain -r-*digits*, add it.
// If it does replace that r-*digits* with a newly generated one.

func generateNewNameForRerun(name string) string {
	newName := name

	// Has -r- in it already?
	if strings.Contains(name, "-r-") {
		lastIndexOfDash := strings.LastIndex(name, "-r-")
		prefixToUse := fmt.Sprintf("%s-r-", name[0:lastIndexOfDash])
		return prefixToUse
	} else {
		logging.Log.Debug("Rerunning a pipelinerun that's not already been rerun")
		newName = fmt.Sprintf("%s-r-", newName)
	}

	logging.Log.Debugf("Rerun PipelineRun name is: %s", newName)

	return newName
}

/* E.g. POST to http://localhost:9097/v1/namespaces/default/rerun (provide name in the request body)
   TODO eventually this would be great to take different params too as users may want to run the \
	 same pipeline just with different inputs */

func (r Resource) rerunImpl(existingPipelineRun *v1alpha1.PipelineRun, existingPipelineRunName, namespace string) (*v1alpha1.PipelineRun, error) {
	if existingPipelineRunName != "" {
		rebuiltRun, err := r.Rerun(existingPipelineRunName, namespace)
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

	return nil, errors.New("rerun was called without a name of a PipelineRun to rerun or a PipelineRun spec - nothing to do")
}

// RerunPipelineRun reruns a given PipelineRun by name in a given namespace
func (r Resource) RerunPipelineRun(request *restful.Request, response *restful.Response) {
	logging.Log.Debugf("in RerunPipelineRun")
	namespace := request.PathParameter("namespace")

	requestData := RerunRequest{}

	if err := request.ReadEntity(&requestData); err != nil {
		logging.Log.Errorf("error parsing request body on call to rerun %s", err)
		utils.RespondError(response, err, http.StatusBadRequest)
		return
	}

	if requestData.PIPELINERUNNAME != "" {
		// It's a rerun: they've provided a name and want a new one. This is a new PipelineRun.
		logging.Log.Debugf("Rerunning PipelineRun: %s", requestData.PIPELINERUNNAME)
		// A lookup will be made for the run, so no need to provide full data
		// Method handles any error reporting through logs
		rebuiltRun, err := r.rerunImpl(nil, requestData.PIPELINERUNNAME, namespace)
		if err != nil {
			utils.RespondError(response, err, http.StatusInternalServerError)
			return
		} else {
			// All is well, include the name of the new rebuilt run in the response
			logging.Log.Debugf("Rerun ok, name is: %s", rebuiltRun.Name)
			utils.WriteResponseLocation(request, response, rebuiltRun.Name)
			return
		}
	}
	// We should never get here - but if so, they've given us a request we can't handle
	logging.Log.Error("didn't receive a request we could actually handle!")
	response.WriteHeader(http.StatusBadRequest)
}
