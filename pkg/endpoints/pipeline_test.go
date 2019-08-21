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

package endpoints_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strconv"
	"strings"
	"testing"

	"github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	. "github.com/tektoncd/dashboard/pkg/endpoints"
	"github.com/tektoncd/dashboard/pkg/testutils"
)

// GET taskrunlogs
func TestGETTaskRunLogs(t *testing.T) {
	server, r, namespace := testutils.DummyServer()
	defer server.Close()

	podName := "Pod1"
	// taskRun step containers
	pods := []corev1.Pod{
		corev1.Pod{
			ObjectMeta: metav1.ObjectMeta{
				Name: podName,
			},
			Spec: corev1.PodSpec{
				Containers: []corev1.Container{
					corev1.Container{
						Name: ContainerPrefix + "Container1",
					},
					corev1.Container{
						Name: ContainerPrefix + "Container2",
					},
				},
				InitContainers: []corev1.Container{
					corev1.Container{
						Name: "Container3",
					},
					corev1.Container{
						Name: "Container4",
					},
				},
			},
		},
	}
	for _, pod := range pods {
		_, err := r.K8sClient.CoreV1().Pods(namespace).Create(&pod)
		if err != nil {
			t.Fatalf("Error creating pod '%s': %v\n", pod.Name, err)
		}
	}

	taskRuns := []v1alpha1.TaskRun{
		v1alpha1.TaskRun{
			ObjectMeta: metav1.ObjectMeta{
				Name: "TaskRun1",
			},
			Spec: v1alpha1.TaskRunSpec{},
			Status: v1alpha1.TaskRunStatus{
				PodName: podName,
			},
		},
	}

	for _, taskRun := range taskRuns {
		_, err := r.PipelineClient.TektonV1alpha1().TaskRuns(namespace).Create(&taskRun)
		if err != nil {
			t.Fatalf("Error creating taskRun '%s': %v\n", taskRun.Name, err)
		}
	}

	// Test getTaskRunLog
	for _, taskRun := range taskRuns {
		httpReq := testutils.DummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/taskrunlogs/%s", server.URL, namespace, taskRun.Name), nil)
		response, err := http.DefaultClient.Do(httpReq)
		if err != nil {
			t.Fatalf("Error getting log for taskRun '%s': %v\n", taskRun.Name, err)
			continue
		}
		responseTaskRunLog := TaskRunLog{}
		if err := json.NewDecoder(response.Body).Decode(&responseTaskRunLog); err != nil {
			t.Fatalf("Error decoding getTaskRunLog response: %v\n", err)
			continue
		}
		// NOTE: TaskRunLog returned only has PodName populated
		// r.K8sClient.CoreV1().Pods(namespace).GetLogs not supported by fakeClient
		t.Logf("TaskRunLog: %v\n", responseTaskRunLog)
		checkTaskRunLog := TaskRunLog{
			PodName: podName,
		}
		if !reflect.DeepEqual(responseTaskRunLog, checkTaskRunLog) {
			t.Fatalf("Response object %v did not equal expected %v\n", responseTaskRunLog, checkTaskRunLog)
		}
	}
}

// GET pipelinerunlogs
func TestGETPipelineRunLogs(t *testing.T) {
	server, r, namespace := testutils.DummyServer()
	defer server.Close()

	// pipelineRun annotation for pods should be used to correlate index when creating comparison when asserting pipelineRunLog
	pipelineRunAnnotationKey := "pipelineRun"
	// taskRun step containers
	pods := []corev1.Pod{
		corev1.Pod{
			ObjectMeta: metav1.ObjectMeta{
				Name: "Pod1",
				Annotations: map[string]string{
					pipelineRunAnnotationKey: "0",
				},
			},
			Spec: corev1.PodSpec{
				Containers: []corev1.Container{
					corev1.Container{
						Name: ContainerPrefix + "Container1",
					},
					corev1.Container{
						Name: ContainerPrefix + "Container2",
					},
				},
				InitContainers: []corev1.Container{
					corev1.Container{
						Name: "Container3",
					},
					corev1.Container{
						Name: "Container4",
					},
				},
			},
		},
		corev1.Pod{
			ObjectMeta: metav1.ObjectMeta{
				Name: "Pod2",
				Annotations: map[string]string{
					pipelineRunAnnotationKey: "0",
				},
			},
			Spec: corev1.PodSpec{
				Containers: []corev1.Container{
					corev1.Container{
						Name: ContainerPrefix + "Container1",
					},
					corev1.Container{
						Name: ContainerPrefix + "Container2",
					},
				},
				InitContainers: []corev1.Container{
					corev1.Container{
						Name: "Container3",
					},
					corev1.Container{
						Name: "Container4",
					},
				},
			},
		},
	}
	for _, pod := range pods {
		_, err := r.K8sClient.CoreV1().Pods(namespace).Create(&pod)
		if err != nil {
			t.Fatalf("Error creating pod '%s': %v\n", pod.Name, err)
		}
	}

	taskRuns := []v1alpha1.TaskRun{
		v1alpha1.TaskRun{
			ObjectMeta: metav1.ObjectMeta{
				Name: "TaskRun1",
			},
			Spec: v1alpha1.TaskRunSpec{},
			Status: v1alpha1.TaskRunStatus{
				PodName: pods[0].Name,
			},
		},
		v1alpha1.TaskRun{
			ObjectMeta: metav1.ObjectMeta{
				Name: "TaskRun2",
			},
			Spec: v1alpha1.TaskRunSpec{},
			Status: v1alpha1.TaskRunStatus{
				PodName: pods[1].Name,
			},
		},
	}
	for _, taskRun := range taskRuns {
		_, err := r.PipelineClient.TektonV1alpha1().TaskRuns(namespace).Create(&taskRun)
		if err != nil {
			t.Fatalf("Error creating taskRun '%s': %v\n", taskRun.Name, err)
		}
	}

	// Construct pipelineRunTaskRunStatus from taskRun Status
	pipelineRunTaskRunStatus := map[string]*v1alpha1.PipelineRunTaskRunStatus{}
	for i, _ := range taskRuns {
		key := fmt.Sprintf("TaskRunStatus%d", i)
		// The tasks within this pipelineRunTaskRunStatus do no exist
		// The taskRuns must exist as they hold references to the pods to extract the logs
		pipelineRunTaskRunStatus[key] = &v1alpha1.PipelineRunTaskRunStatus{
			PipelineTaskName: fmt.Sprintf("Task%d", i),
			Status:           &taskRuns[i].Status,
		}
	}

	pipelineRuns := []v1alpha1.PipelineRun{
		v1alpha1.PipelineRun{
			ObjectMeta: metav1.ObjectMeta{
				Name: "PipelineRun1",
			},
			Spec: v1alpha1.PipelineRunSpec{},
			Status: v1alpha1.PipelineRunStatus{
				TaskRuns: pipelineRunTaskRunStatus,
			},
		},
	}
	for _, pipelineRun := range pipelineRuns {
		_, err := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace).Create(&pipelineRun)
		if err != nil {
			t.Fatalf("Error creating pipelineRun '%s': %v\n", pipelineRun.Name, err)
		}
	}

	// Test getPipelineRunLog
	for i, pipelineRun := range pipelineRuns {
		httpReq := testutils.DummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/pipelinerunlogs/%s", server.URL, namespace, pipelineRun.Name), nil)
		response, err := http.DefaultClient.Do(httpReq)
		if err != nil {
			t.Fatalf("Error getting log for pipelineRun '%s': %v\n", pipelineRun.Name, err)
			continue
		}
		responsePipelineRunLog := PipelineRunLog{}
		if err := json.NewDecoder(response.Body).Decode(&responsePipelineRunLog); err != nil {
			t.Fatalf("Error decoding getPipelineRunLog response: %v\n", err)
			continue
		}
		// NOTE: TaskRunLog returned only has PodName populated
		// r.K8sClient.CoreV1().Pods(namespace).GetLogs not supported by fakeClient
		// PipelineRunLogs are []TaskRunLog which is internally resolved by a map (v1alpha1.PipelineRun.Status.TaskRuns), which has nondeterministic ordering
		// To test equality, convert into maps which properly use DeepEqual()
		t.Logf("PipelineRunLog: %v\n", responsePipelineRunLog)
		checkPipelineRunLogMap := map[string]TaskRunLog{}
		for _, pod := range pods {
			if index := pod.ObjectMeta.Annotations[pipelineRunAnnotationKey]; index == strconv.Itoa(i) {
				taskRunLog := TaskRunLog{
					PodName: pod.Name,
				}
				checkPipelineRunLogMap[pod.Name] = taskRunLog
			}
		}
		responsePipelineRunLogMap := map[string]TaskRunLog{}
		for _, taskRunLog := range responsePipelineRunLog {
			responsePipelineRunLogMap[taskRunLog.PodName] = taskRunLog
		}
		if !reflect.DeepEqual(responsePipelineRunLogMap, checkPipelineRunLogMap) {
			t.Fatalf("Response object %v did not equal expected %v\n", responsePipelineRunLogMap, checkPipelineRunLogMap)
		}
	}
}

/*
	Test the update PipelineRun functionality: we want to test four different responses.
	TODO can we remove much of the set up duplication while retaining variables? Perhaps a function that returns all of the initialised objects.
	1: 200 (status updated ok)
	2: 400 (bad request)
	3: 404 (no such PipelineRun found in this namespace)
	4: 500 (internal server error: we couldn't do the update)
	The manual testing for this can be done as follows. Build the devops-back-end image, configure the handler/git repo yaml to point to a repository so you have a webhook.
	Make sure you've got the templates all applied from the config directory so you've got a Pipeline and Task definitions.
	Push code to the repository after verifying you've got a webhook and this kicks off a PipelineRun.
	Retrieve the name of your PipelineRun e.g. with `kubectl get pipelinerun`.
	With Postman send a PUT to <your kservice domain for the github event pipeline>/v1/namespaces/<namespace>/pipelineruns/<name of pipeline run>
	In the body you want "status": "PipelineRunCancelled"
	Observe the PipelineRun is cancelled.
*/

// PUT pipelineruns
func TestPUTPipelineRunUpdates(t *testing.T) {
	server, r, namespace := testutils.DummyServer()
	defer server.Close()

	// taskRun step containers
	pods := []corev1.Pod{
		corev1.Pod{
			ObjectMeta: metav1.ObjectMeta{
				Name: "Pod1",
			},
			Spec: corev1.PodSpec{
				Containers: []corev1.Container{
					corev1.Container{
						Name: "Container1",
					},
				},
				InitContainers: []corev1.Container{
					corev1.Container{
						Name: "Container2",
					},
				},
			},
		},
	}
	for _, pod := range pods {
		_, err := r.K8sClient.CoreV1().Pods(namespace).Create(&pod)
		if err != nil {
			t.Fatalf("Error creating pod '%s': %v\n", pod.Name, err)
		}
	}

	taskRuns := []v1alpha1.TaskRun{
		v1alpha1.TaskRun{
			ObjectMeta: metav1.ObjectMeta{
				Name: "TaskRun1",
			},
			Spec: v1alpha1.TaskRunSpec{},
			Status: v1alpha1.TaskRunStatus{
				PodName: pods[0].Name,
			},
		},
	}
	for _, taskRun := range taskRuns {
		_, err := r.PipelineClient.TektonV1alpha1().TaskRuns(namespace).Create(&taskRun)
		if err != nil {
			t.Fatalf("Error creating taskRun '%s': %v\n", taskRun.Name, err)
		}
	}

	// Construct pipelineRunTaskRunStatus from taskRun Status
	pipelineRunTaskRunStatus := map[string]*v1alpha1.PipelineRunTaskRunStatus{}
	for i, _ := range taskRuns {
		key := fmt.Sprintf("TaskRunStatus%d", i)
		// The tasks within this pipelineRunTaskRunStatus do no exist
		pipelineRunTaskRunStatus[key] = &v1alpha1.PipelineRunTaskRunStatus{
			PipelineTaskName: fmt.Sprintf("Task%d", i),
			Status:           &taskRuns[i].Status,
		}
	}

	pipelineName := "PipelineRun1"
	pipelineRuns := []v1alpha1.PipelineRun{
		v1alpha1.PipelineRun{
			ObjectMeta: metav1.ObjectMeta{
				Name: pipelineName,
			},
			Spec: v1alpha1.PipelineRunSpec{},
			Status: v1alpha1.PipelineRunStatus{
				TaskRuns: pipelineRunTaskRunStatus,
			},
		},
	}
	for _, pipelineRun := range pipelineRuns {
		_, err := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace).Create(&pipelineRun)
		if err != nil {
			t.Fatalf("Error creating pipelineRun '%s': %v\n", pipelineRun.Name, err)
		}
	}
	// Test updatePipelineRun: good request
	httpRequestBody := strings.NewReader(`{"status" : "PipelineRunCancelled"}`)
	httpReq := testutils.DummyHTTPRequest("PUT", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns/%s", server.URL, namespace, pipelineName), httpRequestBody)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("Error getting updatePipelineRun response for pipelineRun '%s': %v\n", pipelineName, err)
	} else {
		expectedStatusCode := 204
		if response.StatusCode != expectedStatusCode {
			t.Fatalf("Response code %d did not equal expected %d\n", response.StatusCode, expectedStatusCode)
		} else { // Test duplicate cancel/update if successful
			// Test updatePipelineRun function: second good request
			httpRequestBody := strings.NewReader(`{"status" : "PipelineRunCancelled"}`)
			httpReq := testutils.DummyHTTPRequest("PUT", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns/%s", server.URL, namespace, pipelineName), httpRequestBody)
			response, err := http.DefaultClient.Do(httpReq)
			if err != nil {
				t.Fatalf("Error getting updatePipelineRun response for pipelineRun '%s': %v\n", pipelineName, err)
			} else {
				expectedStatusCode := 412
				if response.StatusCode != expectedStatusCode {
					t.Fatalf("Response code %d did not equal expected %d\n", response.StatusCode, expectedStatusCode)
				}
			}
		}
	}
	// Test updatePipelineRun: bad request
	httpRequestBody = strings.NewReader(`{"notstatus" : "foo"}`)
	httpReq = testutils.DummyHTTPRequest("PUT", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns/%s", server.URL, namespace, pipelineName), httpRequestBody)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("Error getting updatePipelineRun response for pipelineRun '%s': %v\n", pipelineName, err)
	} else {
		expectedStatusCode := 400
		if response.StatusCode != expectedStatusCode {
			t.Fatalf("Response code %d did not equal expected %d\n", response.StatusCode, expectedStatusCode)
		}
	}
	// Test updatePipelineRun: invalid pipelineRun name
	invalidPipelineRunName := "DNE"
	httpRequestBody = strings.NewReader(`{"status" : "foo"}`)
	httpReq = testutils.DummyHTTPRequest("PUT", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns/%s", server.URL, namespace, invalidPipelineRunName), httpRequestBody)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("Error getting updatePipelineRun response for pipelineRun '%s': %v\n", invalidPipelineRunName, err)
	} else {
		expectedStatusCode := 404
		if response.StatusCode != expectedStatusCode {
			t.Fatalf("Response code %d did not equal expected %d\n", response.StatusCode, expectedStatusCode)
		}
	}
	// Test updatePipelineRun: invalid namespace
	invalidNamespace := "DNE"
	httpRequestBody = strings.NewReader(`{"status" : "foo"}`)
	httpReq = testutils.DummyHTTPRequest("PUT", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns/%s", server.URL, invalidNamespace, pipelineName), httpRequestBody)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("Error getting updatePipelineRun response for pipelineRun '%s': %v\n", pipelineName, err)
	} else {
		expectedStatusCode := 404
		if response.StatusCode != expectedStatusCode {
			t.Fatalf("Response code %d did not equal expected %d\n", response.StatusCode, expectedStatusCode)
		}
	}
}

// POST pipelineruns
func TestPOSTCreatePipelineRuns(t *testing.T) {
	server, r, namespace := testutils.DummyServer()
	defer server.Close()

	pipelineRefName := "Pipeline1"
	// Pipelines referenced by PipelineRuns
	pipelines := []v1alpha1.Pipeline{
		v1alpha1.Pipeline{
			ObjectMeta: metav1.ObjectMeta{
				Name:      pipelineRefName,
				Namespace: namespace,
			},
			Spec: v1alpha1.PipelineSpec{},
		},
	}
	for _, pipeline := range pipelines {
		_, err := r.PipelineClient.TektonV1alpha1().Pipelines(namespace).Create(&pipeline)
		if err != nil {
			t.Fatalf("Error creating pipeline '%s': %v\n", pipeline.Name, err)
		}
	}
	// Detected pipeline resources always attempt to be created
	// All Resources names should be different between pipelineRuns
	manualPipelineRuns := []ManualPipelineRun{
		ManualPipelineRun{
			PIPELINENAME: pipelineRefName,
		},
		ManualPipelineRun{
			PIPELINENAME:    pipelineRefName,
			GITRESOURCENAME: "git-source1",
			GITCOMMIT:       "12345",
			REPOURL:         "http://github.com/testorg/testrepo",
		},
		ManualPipelineRun{
			PIPELINENAME:      pipelineRefName,
			IMAGERESOURCENAME: "image-source1",
			GITCOMMIT:         "12345",
			REPONAME:          "testreponame",
		},
		ManualPipelineRun{
			PIPELINENAME:      pipelineRefName,
			IMAGERESOURCENAME: "image-source2",
			GITRESOURCENAME:   "git-source2",
			GITCOMMIT:         "12345",
			REPONAME:          "testreponame",
			REPOURL:           "http://github.com/testorg/testrepo",
		},
	}
	// Test createPipelineRun: bad request
	httpRequestBody := strings.NewReader(`{"fielddoesnotexist": "pipeline",}`)
	httpReq := testutils.DummyHTTPRequest("POST", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns", server.URL, namespace), httpRequestBody)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("Error getting createPipelineRun response for pipelineRun '%s': %v\n", pipelineRefName, err)
	} else {
		expectedStatusCode := 400
		if response.StatusCode != expectedStatusCode {
			t.Fatalf("Response code %d did not equal expected %d\n", response.StatusCode, expectedStatusCode)
		}
	}
	// Test createPipelinerun: non-existant pipeline reference
	httpRequestBody = strings.NewReader(`{"pipelinename": "Pipelinedoesnotexist"}`)
	httpReq = testutils.DummyHTTPRequest("POST", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns", server.URL, namespace), httpRequestBody)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("Error getting createPipelineRun response for pipelineRun '%s': %v\n", pipelineRefName, err)
	} else {
		expectedStatusCode := 412
		if response.StatusCode != expectedStatusCode {
			t.Fatalf("Response code %d did not equal expected %d\n", response.StatusCode, expectedStatusCode)
		}
	}
	// Test createPipelineRun: good requests with/without pipelineResources
	for index, manualPipelineRun := range manualPipelineRuns {
		jsonMarshalledBytes, err := json.Marshal(&manualPipelineRun)
		if err != nil {
			t.Fatalf("Error marshalling manualPipelineRun[%d]: %v\n", index, err)
			continue
		}
		t.Logf("createPipelineRun payload: %v\n", string(jsonMarshalledBytes))
		httpRequestBody := bytes.NewReader(jsonMarshalledBytes)
		httpReq := testutils.DummyHTTPRequest("POST", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns", server.URL, namespace), httpRequestBody)
		response, err := http.DefaultClient.Do(httpReq)
		if err != nil {
			t.Fatalf("Error getting createPipelineRun response for pipelineRun '%s': %v\n", pipelineRefName, err)
			continue
		}
		expectedStatusCode := 201
		if response.StatusCode != expectedStatusCode {
			t.Fatalf("Response code %d did not equal expected %d\n", response.StatusCode, expectedStatusCode)
			continue
		}
		// The manualPipelineRun resources names do not match the actual pipelineResourceRef
		// Set to K8s client specified name if matching name on resource binding
		expectedPipelineResources := map[string]*v1alpha1.PipelineResource{}
		if manualPipelineRun.GITRESOURCENAME != "" {
			gitResource := &v1alpha1.PipelineResource{
				ObjectMeta: metav1.ObjectMeta{
					Name:      manualPipelineRun.GITRESOURCENAME,
					Namespace: namespace,
				},
				Spec: v1alpha1.PipelineResourceSpec{
					Type: v1alpha1.PipelineResourceTypeGit,
					Params: []v1alpha1.ResourceParam{
						{
							Name:  "revision",
							Value: manualPipelineRun.GITCOMMIT,
						},
						{
							Name:  "url",
							Value: manualPipelineRun.REPOURL,
						},
					},
				},
			}
			expectedPipelineResources[manualPipelineRun.GITRESOURCENAME] = gitResource
		}
		if manualPipelineRun.IMAGERESOURCENAME != "" {
			registry := manualPipelineRun.REGISTRYLOCATION
			repoName := strings.ToLower(manualPipelineRun.REPONAME)
			commit := manualPipelineRun.GITCOMMIT
			imageResource := &v1alpha1.PipelineResource{
				ObjectMeta: metav1.ObjectMeta{
					Name:      manualPipelineRun.IMAGERESOURCENAME,
					Namespace: namespace,
				},
				Spec: v1alpha1.PipelineResourceSpec{
					Type: v1alpha1.PipelineResourceTypeImage,
					Params: []v1alpha1.ResourceParam{
						{
							Name:  "url",
							Value: fmt.Sprintf("%s/%s:%s", registry, repoName, commit),
						},
					},
				},
			}
			expectedPipelineResources[manualPipelineRun.IMAGERESOURCENAME] = imageResource
		}
		// Skip checks if there are no expected pipelineResources
		if len(expectedPipelineResources) == 0 {
			continue
		}
		var responsePipelineRun v1alpha1.PipelineRun
		// Get the pipelineRun for the v1alpha1.PipelineRunSpec Resources field
		httpReq = testutils.DummyHTTPRequest("GET", fmt.Sprintf("%s/%s", server.URL, response.Header["Content-Location"][0]), nil)
		response, err = http.DefaultClient.Do(httpReq)
		if err := json.NewDecoder(response.Body).Decode(&responsePipelineRun); err != nil {
			t.Fatalf("Error unmarshalling response into pipelineRun: %v\n", err)
			continue
		}
		resourceBindings := responsePipelineRun.Spec.Resources
		if len(expectedPipelineResources) != len(resourceBindings) {
			t.Fatalf("Actual pipelineResources returned %d did not equal expected %d\n", len(resourceBindings), len(expectedPipelineResources))
			continue
		}
		// Obtain actual names from references
		for _, resourceBinding := range resourceBindings {
			resource, ok := expectedPipelineResources[resourceBinding.Name]
			if !ok {
				t.Fatalf("Response pipelineResource name '%s' did not match an expected pipelineResource name\n", resourceBinding.Name)
				continue
			}
			// Set actual name on resources
			resource.Name = resourceBinding.ResourceRef.Name
			delete(expectedPipelineResources, resourceBinding.Name)
			expectedPipelineResources[resourceBinding.Name] = resource
		}
		// Ensure all expected pipelineResources match
		for _, expectedPipelineResource := range expectedPipelineResources {
			// Debug purposes
			t.Logf("Expected Pipeline resource: %v\n", expectedPipelineResource)
			actualPipelineResource, err := r.PipelineClient.TektonV1alpha1().PipelineResources(namespace).Get(expectedPipelineResource.Name, metav1.GetOptions{})
			if err != nil {
				t.Fatalf("Error getting pipelineResource '%s': %v\n", expectedPipelineResource.Name, err)
				continue
			}
			if !reflect.DeepEqual(actualPipelineResource, expectedPipelineResource) {
				t.Fatalf("Response object %v did not equal expected %v\n", actualPipelineResource, expectedPipelineResource)
			}
		}
	}
}

func createPipelineForTesting(name, namespace string, server *httptest.Server, r *Resource, t *testing.T) *v1alpha1.Pipeline {
	// Pipelines referenced by PipelineRuns
	pipeline := &v1alpha1.Pipeline{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
		},
		Spec: v1alpha1.PipelineSpec{},
	}
	_, err := r.PipelineClient.TektonV1alpha1().Pipelines(namespace).Create(pipeline)
	if err != nil {
		t.Fatalf("Error creating Pipeline '%s': %v", pipeline.Name, err)
	}
	return pipeline
}

func createPipelineRunForTesting(pipelineNameToUse, namespace string, server *httptest.Server, r *Resource, t *testing.T) *v1alpha1.PipelineRun {
	manualPipelineRun := ManualPipelineRun{
		PIPELINENAME:      pipelineNameToUse,
		IMAGERESOURCENAME: "image-source-" + pipelineNameToUse,
		GITRESOURCENAME:   "git-source - " + pipelineNameToUse,
		GITCOMMIT:         "12345",
		REPONAME:          "testreponame",
		REPOURL:           "http://github.com/testorg/testrepo",
	}

	jsonMarshalledBytes, err := json.Marshal(&manualPipelineRun)
	if err != nil {
		t.Fatalf("Error marshalling manualPipelineRun: %v", err)
	}

	httpRequestBody := bytes.NewReader(jsonMarshalledBytes)
	//
	httpReq := testutils.DummyHTTPRequest("POST", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns", server.URL, namespace), httpRequestBody)
	response, err := http.DefaultClient.Do(httpReq)

	if err != nil {
		t.Fatalf("Error getting create PipelineRun response for PipelineRun '%s': %v", pipelineNameToUse, err)
	}
	expectedStatusCode := 201
	if response.StatusCode != expectedStatusCode {
		t.Fatalf("Response code %d did not equal expected %d", response.StatusCode, expectedStatusCode)
	}

	foundPipelineRuns, err := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace).List(metav1.ListOptions{})
	if len(foundPipelineRuns.Items) != 1 {
		t.Errorf("Didn't find the PipelineRun to rebuild")
	}
	return &foundPipelineRuns.Items[0]
}

// Create a PipelineRun then rebuild it using the "from name" API.
// Ensure it's identical apart from the name and resource version

func TestRebuildWithExistingRunFromName(t *testing.T) {
	server, r, namespace := testutils.DummyServer()
	testPipelineNameToRun := "testPipeline1"

	pipeline := createPipelineForTesting(testPipelineNameToRun, namespace, server, r, t)
	pipelineRun := createPipelineRunForTesting(testPipelineNameToRun, namespace, server, r, t)

	foundPipelineRuns, err := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace).List(metav1.ListOptions{})
	if len(foundPipelineRuns.Items) != 1 {
		t.Errorf("Didn't find a created PipelineRun, items: %v", foundPipelineRuns.Items)
		t.Fail()
	}

	t.Logf("Created Pipeline: %v", pipeline)
	t.Logf("Created PipelineRun: %v", pipelineRun)

	rebuildRequest := RebuildRequest{
		PIPELINERUNNAME: pipelineRun.Name,
	}

	jsonMarshalledRebuildBytes, err := json.Marshal(&rebuildRequest)
	if err != nil {
		t.Fatalf("Error marshalling rebuild request: %v", err)
	}

	t.Logf("rebuild payload: %v", string(jsonMarshalledRebuildBytes))

	httpRequestRebuildBody := bytes.NewReader(jsonMarshalledRebuildBytes)
	httpRebuildReq := testutils.DummyHTTPRequest("POST", fmt.Sprintf("%s/v1/namespaces/%s/rebuild", server.URL, namespace), httpRequestRebuildBody)
	response, err := http.DefaultClient.Do(httpRebuildReq)

	if response.StatusCode != 201 {
		t.Errorf("Didn't get a response 201 from using rebuild, got %d instead", response.StatusCode)
	}

	// Check we've got a new rebuilt PipelineRun and its the same as the first (for params, resources, SA, namespace)
	// It should be labelled and named accordingly
	foundPipelineRuns, err = r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace).List(metav1.ListOptions{})
	if len(foundPipelineRuns.Items) != 2 {
		t.Errorf("Didn't find a rebuilt PipelineRun, items: %v", foundPipelineRuns.Items)
		t.Fail()
	}

	firstRun := foundPipelineRuns.Items[0]

	firstRunParams := firstRun.Spec.Params
	firstRunResources := firstRun.Spec.Resources
	firstRunSA := firstRun.Spec.ServiceAccount
	firstRunNS := firstRun.Namespace

	secondRun := foundPipelineRuns.Items[1]

	secondRunParams := secondRun.Spec.Params
	secondRunResources := secondRun.Spec.Resources
	secondRunSA := secondRun.Spec.ServiceAccount
	secondRunNS := secondRun.Namespace

	if !reflect.DeepEqual(firstRunParams, secondRunParams) {
		t.Errorf("Parameters in the rebuilt run did not match")
	}

	if !reflect.DeepEqual(firstRunResources, secondRunResources) {
		t.Errorf("Resources in the rebuilt run did not match")
	}

	if firstRunSA != secondRunSA {
		t.Errorf("Service account in the rebuilt run did not match")
	}

	if firstRunNS != secondRunNS {
		t.Errorf("Namespace in the rebuilt run did not match")
	}

	secondRunLabels := secondRun.GetLabels()

	if strings.Contains(secondRunLabels["rebuilds"], firstRun.Name) == false {
		t.Errorf("Rebuilt run was not labelled correctly: should be labelled containing rebuilds:%s, we see label: %s", firstRun.Name, secondRunLabels["rebuilds"])
	}
}
