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
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"strconv"
	"strings"
	"testing"

	v1alpha1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Namespaces are specified on K8s CRD initialization (not client creation) to assert DeepEqual

// Task test
func TestTask(t *testing.T) {
	server, r := dummyServer()
	namespace := "ns1"
	_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	if err != nil {
		t.Fatalf("Error creating namespace '%s': %v\n", namespace, err)
	}

	tasks := []v1alpha1.Task{
		v1alpha1.Task{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "Task1",
				Namespace: namespace,
			},
			Spec: v1alpha1.TaskSpec{},
		},
		v1alpha1.Task{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "Task2",
				Namespace: namespace,
			},
			Spec: v1alpha1.TaskSpec{},
		},
		v1alpha1.Task{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "Task3",
				Namespace: namespace,
			},
			Spec: v1alpha1.TaskSpec{},
		},
	}
	for _, task := range tasks {
		_, err := r.PipelineClient.TektonV1alpha1().Tasks(namespace).Create(&task)
		if err != nil {
			t.Fatalf("Error creating task '%s': %v\n", task.Name, err)
		}
	}

	// Test getAllTasks function
<<<<<<< HEAD
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/tasks/", nil)
	req := dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	r.getAllTasks(req, resp)

	result := v1alpha1.TaskList{}
	json.NewDecoder(httpWriter.Body).Decode(&result)

	if len(result.Items) != 2 {
		t.Errorf("Number of tasks: expected: %d, returned: %d", 2, len(result.Items))
	}
	if result.Items[0].Name != "Task1" && result.Items[1].Name != "Task1" {
		t.Errorf("Task1 is not returned: %s, %s", result.Items[0].Name, result.Items[1].Name)
	}
	if result.Items[0].Name != "Task2" && result.Items[1].Name != "Task2" {
		t.Errorf("Task2 is not returned: %s, %s", result.Items[0].Name, result.Items[1].Name)
=======
	httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/tasks", server.URL, namespace), nil)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllTasks response error: %v\n", err)
	} else {
		responseTaskList := v1alpha1.TaskList{}
		if err := json.NewDecoder(response.Body).Decode(&responseTaskList); err != nil {
			t.Fatalf("Error decoding getAllTasks response: %v\n", err)
		} else {
			if len(responseTaskList.Items) != len(tasks) {
				t.Error("All expected tasks were not returned")
			}
		}
>>>>>>> 43416c478a912f83d35cc5d5ab5bd39002d2220e
	}
	// Test getTask function
<<<<<<< HEAD
	httpReq = dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/tasks/Task2", nil)
	req = dummyRestfulRequest(httpReq, "ns1", "Task2")
	httpWriter = httptest.NewRecorder()
	resp = dummyRestfulResponse(httpWriter)

	r.getTask(req, resp)

	result1 := v1alpha1.Task{}
	json.NewDecoder(httpWriter.Body).Decode(&result1)

	if result1.Name != "Task2" {
		t.Errorf("Task2 is not returned: %s", result1.Name)
=======
	for _, task := range tasks {
		httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/tasks/%s", server.URL, namespace, task.Name), nil)
		response, err := http.DefaultClient.Do(httpReq)
		if err != nil {
			t.Fatalf("Error getting task '%s': %v\n", task.Name, err)
			continue
		}
		responseTask := v1alpha1.Task{}
		if err := json.NewDecoder(response.Body).Decode(&responseTask); err != nil {
			t.Fatalf("Error decoding getTask response: %v\n", err)
			continue
		}
		if !reflect.DeepEqual(responseTask, task) {
			t.Fatalf("Response object %v did not equal expected %v\n", responseTask, task)
		}
>>>>>>> 43416c478a912f83d35cc5d5ab5bd39002d2220e
	}
}

// Pipeline test
func TestPipeline(t *testing.T) {
	server, r := dummyServer()
	namespace := "ns1"
	_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	if err != nil {
		t.Fatalf("Error creating namespace '%s': %v\n", namespace, err)
	}

	pipelines := []v1alpha1.Pipeline{
		v1alpha1.Pipeline{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "Pipeline1",
				Namespace: namespace,
			},
			Spec: v1alpha1.PipelineSpec{},
		},
		v1alpha1.Pipeline{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "Pipeline2",
				Namespace: namespace,
			},
			Spec: v1alpha1.PipelineSpec{},
		},
		v1alpha1.Pipeline{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "Pipeline3",
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

	// Test getAllPipelines function
<<<<<<< HEAD
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelines/", nil)
	req := dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	r.getAllPipelines(req, resp)

	result := v1alpha1.PipelineList{}
	json.NewDecoder(httpWriter.Body).Decode(&result)

	if len(result.Items) != 2 {
		t.Errorf("Number of tasks: expected: %d, returned: %d", 2, len(result.Items))
	}
	if result.Items[0].Name != "Pipeline1" && result.Items[1].Name != "Pipeline1" {
		t.Errorf("Task1 is not returned: %s, %s", result.Items[0].Name, result.Items[1].Name)
	}
	if result.Items[0].Name != "Pipeline2" && result.Items[1].Name != "Pipeline2" {
		t.Errorf("Task2 is not returned: %s, %s", result.Items[0].Name, result.Items[1].Name)
=======
	httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/pipelines", server.URL, namespace), nil)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllPipelines response error: %v\n", err)
	} else {
		responsePipelineList := v1alpha1.PipelineList{}
		if err := json.NewDecoder(response.Body).Decode(&responsePipelineList); err != nil {
			t.Fatalf("Error decoding getAllPipelines response: %v\n", err)
		} else {
			if len(responsePipelineList.Items) != len(pipelines) {
				t.Error("All expected pipelines were not returned")
			}
		}
>>>>>>> 43416c478a912f83d35cc5d5ab5bd39002d2220e
	}
	// Test getPipeline function
<<<<<<< HEAD
	httpReq = dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelines/Pipeline2", nil)
	req = dummyRestfulRequest(httpReq, "ns1", "Pipeline2")
	httpWriter = httptest.NewRecorder()
	resp = dummyRestfulResponse(httpWriter)

	r.getPipeline(req, resp)

	result1 := v1alpha1.Pipeline{}
	json.NewDecoder(httpWriter.Body).Decode(&result1)

	if result1.Name != "Pipeline2" {
		t.Errorf("Pipeline2 is not returned: %s", result1.Name)
=======
	for _, pipeline := range pipelines {
		httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/pipelines/%s", server.URL, namespace, pipeline.Name), nil)
		response, err := http.DefaultClient.Do(httpReq)
		if err != nil {
			t.Fatalf("Error getting pipeline '%s': %v\n", pipeline.Name, err)
			continue
		}
		responsePipeline := v1alpha1.Pipeline{}
		if err := json.NewDecoder(response.Body).Decode(&responsePipeline); err != nil {
			t.Fatalf("Error decoding getPipeline response: %v\n", err)
			continue
		}
		if !reflect.DeepEqual(responsePipeline, pipeline) {
			t.Fatalf("Response object %v did not equal expected %v\n", responsePipeline, pipeline)
		}
>>>>>>> 43416c478a912f83d35cc5d5ab5bd39002d2220e
	}
}

// TaskRun test
func TestTaskRun(t *testing.T) {
	server, r := dummyServer()
	namespace := "ns1"
	_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	if err != nil {
		t.Fatalf("Error creating namespace '%s': %s\n", namespace, err)
	}

	taskRefName := "Task1"
	// Tasks referenced by TaskRuns
	tasks := []v1alpha1.Task{
		v1alpha1.Task{
			ObjectMeta: metav1.ObjectMeta{
				Name:      taskRefName,
				Namespace: namespace,
			},
			Spec: v1alpha1.TaskSpec{},
		},
	}
<<<<<<< HEAD
	TaskRun2 := v1alpha1.TaskRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "TaskRun2",
		},
		Spec: v1alpha1.TaskRunSpec{
			TaskRef: &v1alpha1.TaskRef{
				Name: "Task2",
=======
	for _, task := range tasks {
		_, err := r.PipelineClient.TektonV1alpha1().Tasks(namespace).Create(&task)
		if err != nil {
			t.Fatalf("Error creating task '%s': %v\n", task.Name, err)
		}
	}

	unreferencedTaskRuns := []v1alpha1.TaskRun{
		v1alpha1.TaskRun{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "TaskRun1",
				Namespace: namespace,
>>>>>>> 43416c478a912f83d35cc5d5ab5bd39002d2220e
			},
			Spec: v1alpha1.TaskRunSpec{},
		},
	}
	referencedTaskRuns := []v1alpha1.TaskRun{
		v1alpha1.TaskRun{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "TaskRun2",
				Namespace: namespace,
			},
			Spec: v1alpha1.TaskRunSpec{
				TaskRef: &v1alpha1.TaskRef{
					Name: taskRefName,
				},
			},
		},
<<<<<<< HEAD
		Spec: v1alpha1.TaskRunSpec{
			TaskRef: &v1alpha1.TaskRef{
				Name: "Task3",
=======
		v1alpha1.TaskRun{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "TaskRun3",
				Namespace: namespace,
			},
			Spec: v1alpha1.TaskRunSpec{
				TaskRef: &v1alpha1.TaskRef{
					Name: taskRefName,
				},
>>>>>>> 43416c478a912f83d35cc5d5ab5bd39002d2220e
			},
		},
	}
	taskRuns := append(unreferencedTaskRuns, referencedTaskRuns...)
	for _, taskRun := range taskRuns {
		_, err := r.PipelineClient.TektonV1alpha1().TaskRuns(namespace).Create(&taskRun)
		if err != nil {
			t.Fatalf("Error creating taskRun '%s': %v\n", taskRun.Name, err)
		}
	}

	// Test getAllTaskRuns function
<<<<<<< HEAD
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/taskruns/", nil)
	req := dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	r.getAllTaskRuns(req, resp)

	result := v1alpha1.TaskRunList{}
	json.NewDecoder(httpWriter.Body).Decode(&result)

	if len(result.Items) != 2 {
		t.Errorf("Number of tasks: expected: %d, returned: %d", 2, len(result.Items))
	}
	if result.Items[0].Name != "TaskRun1" && result.Items[1].Name != "TaskRun1" {
		t.Errorf("Task1 is not returned: %s, %s", result.Items[0].Name, result.Items[1].Name)
	}
	if result.Items[0].Name != "TaskRun2" && result.Items[1].Name != "TaskRun2" {
		t.Errorf("Task2 is not returned: %s, %s", result.Items[0].Name, result.Items[1].Name)
	}

	// Test getAllTaskRuns function with name query
	// Sample request and response
	httpReq = dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/taskruns?name=Task2", nil)
	req = dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter = httptest.NewRecorder()
	resp = dummyRestfulResponse(httpWriter)

	// //  Test the function
	r.getAllTaskRuns(req, resp)

	// // Decode the response
	result = v1alpha1.TaskRunList{}
	json.NewDecoder(httpWriter.Body).Decode(&result)
	// Verify the response
	if len(result.Items) != 1 {
		t.Errorf("Number of tasks: expected: %d, returned: %d", 1, len(result.Items))
=======
	httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/taskruns", server.URL, namespace), nil)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllTaskRuns response error: %v\n", err)
	} else {
		responseTaskRunList := v1alpha1.TaskRunList{}
		if err := json.NewDecoder(response.Body).Decode(&responseTaskRunList); err != nil {
			t.Fatalf("Error decoding getAllTaskRuns response: %v\n", err)
		} else {
			if len(responseTaskRunList.Items) != len(taskRuns) {
				t.Error("All expected taskRuns were not returned")
			}
		}
>>>>>>> 43416c478a912f83d35cc5d5ab5bd39002d2220e
	}
	// Test getAllTaskRuns function: name filter
	httpReq = dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/taskruns?name=%s", server.URL, namespace, taskRefName), nil)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllTaskRuns response error with filter name '%s': %v\n", taskRefName, err)
	} else {
		responseTaskRunList := v1alpha1.TaskRunList{}
		if err := json.NewDecoder(response.Body).Decode(&responseTaskRunList); err != nil {
			t.Fatalf("Error decoding getAllTaskRuns response: %v\n", err)
		} else {
			if len(responseTaskRunList.Items) != len(referencedTaskRuns) {
				t.Error("All expected taskRuns were not returned")
			}
		}
	}
	// Test getTaskRun function
<<<<<<< HEAD
	httpReq = dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/taskruns/TaskRun2", nil)
	req = dummyRestfulRequest(httpReq, "ns1", "TaskRun2")
	httpWriter = httptest.NewRecorder()
	resp = dummyRestfulResponse(httpWriter)

	r.getTaskRun(req, resp)

	result1 := v1alpha1.TaskRun{}
	json.NewDecoder(httpWriter.Body).Decode(&result1)

	if result1.Name != "TaskRun2" {
		t.Errorf("TaskRun2 is not returned: %s", result1.Name)
=======
	for _, taskRun := range taskRuns {
		httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/taskruns/%s", server.URL, namespace, taskRun.Name), nil)
		response, err := http.DefaultClient.Do(httpReq)
		if err != nil {
			t.Fatalf("Error getting taskRun '%s': %v\n", taskRun.Name, err)
			continue
		}
		responseTaskRun := v1alpha1.TaskRun{}
		if err := json.NewDecoder(response.Body).Decode(&responseTaskRun); err != nil {
			t.Fatalf("Error decoding getTaskRun response: %v\n", err)
			continue
		}
		if !reflect.DeepEqual(responseTaskRun, taskRun) {
			t.Fatalf("Response object %v did not equal expected %v\n", responseTaskRun, taskRun)
		}
>>>>>>> 43416c478a912f83d35cc5d5ab5bd39002d2220e
	}
}

// PipelineRun test
func TestPipelineRun(t *testing.T) {
	server, r := dummyServer()
	namespace := "ns1"
	_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	if err != nil {
		t.Fatalf("Error creating namespace '%s': %s\n", namespace, err)
	}

	labels1 := map[string]string{
		"gitServer": "github.com",
		"gitOrg":    "foo",
		"gitRepo":   "bar",
	}

	labels2 := map[string]string{
		"gitServer": "github.ibm.com",
		"gitOrg":    "foobar",
		"gitRepo":   "barfoo",
	}
	repository := fmt.Sprintf("https://%s/%s/%s", labels2["gitServer"], labels2["gitOrg"], labels2["gitRepo"])

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

	unreferencedPipelineRuns := []v1alpha1.PipelineRun{
		v1alpha1.PipelineRun{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "PipelineRun1",
				Namespace: namespace,
				Labels:    labels1,
			},
			Spec: v1alpha1.PipelineRunSpec{
				PipelineRef: v1alpha1.PipelineRef{},
			},
		},
	}
	// These PLR are also the only to use labels2, which is the repository filter match
	referencedPipelineRuns := []v1alpha1.PipelineRun{
		v1alpha1.PipelineRun{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "PipelineRun2",
				Namespace: namespace,
				Labels:    labels2,
			},
			Spec: v1alpha1.PipelineRunSpec{
				PipelineRef: v1alpha1.PipelineRef{
					Name: pipelineRefName,
				},
			},
		},
		v1alpha1.PipelineRun{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "PipelineRun3",
				Namespace: namespace,
				Labels:    labels2,
			},
			Spec: v1alpha1.PipelineRunSpec{
				PipelineRef: v1alpha1.PipelineRef{
					Name: pipelineRefName,
				},
			},
		},
	}
	pipelineRuns := append(unreferencedPipelineRuns, referencedPipelineRuns...)
	for _, pipelineRun := range pipelineRuns {
		_, err := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace).Create(&pipelineRun)
		if err != nil {
			t.Fatalf("Error creating pipelineRun '%s': %v\n", pipelineRun.Name, err)
		}
	}

	// Test getAllPipelineRuns function
	httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns", server.URL, namespace), nil)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllPipelineRuns response error: %v\n", err)
	} else {
		responsePipelineRunList := v1alpha1.PipelineRunList{}
		if err := json.NewDecoder(response.Body).Decode(&responsePipelineRunList); err != nil {
			t.Fatalf("Error decoding getAllPipelineRuns response: %v\n", err)
		} else {
			if len(responsePipelineRunList.Items) != len(pipelineRuns) {
				t.Error("All expected pipelineRuns were not returned")
			}
		}
	}
	// Test getAllPipelineRuns function: repository filter
	httpReq = dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns?repository=%s", server.URL, namespace, repository), nil)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllPipelineRuns response error with filter repo '%s': %v\n", repository, err)
	} else {
		responsePipelineRunList := v1alpha1.PipelineRunList{}
		if err := json.NewDecoder(response.Body).Decode(&responsePipelineRunList); err != nil {
			t.Fatalf("Error decoding getAllPipelineRuns response: %v\n", err)
		} else {
			if len(responsePipelineRunList.Items) != len(referencedPipelineRuns) {
				t.Error("All expected pipelineRuns were not returned")
			}
		}
	}
	// Test getAllPipelineRuns function: name filter
	httpReq = dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns?name=%s", server.URL, namespace, pipelineRefName), nil)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllPipelineRuns response error with filter name '%s': %v\n", pipelineRefName, err)
	} else {
		responsePipelineRunList := v1alpha1.PipelineRunList{}
		if err := json.NewDecoder(response.Body).Decode(&responsePipelineRunList); err != nil {
			t.Fatalf("Error decoding getAllPipelineRuns response: %v\n", err)
		} else {
			if len(responsePipelineRunList.Items) != len(referencedPipelineRuns) {
				t.Error("All expected pipelineRuns were not returned")
			}
		}
	}
	// Test getPipelineRun function
	for _, pipelineRun := range pipelineRuns {
		httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns/%s", server.URL, namespace, pipelineRun.Name), nil)
		response, err := http.DefaultClient.Do(httpReq)
		if err != nil {
			t.Fatalf("Error getting pipelineRun '%s': %v\n", pipelineRun.Name, err)
			continue
		}
		responsePipelineRun := v1alpha1.PipelineRun{}
		if err := json.NewDecoder(response.Body).Decode(&responsePipelineRun); err != nil {
			t.Fatalf("Error decoding getPipelineRun response: %v\n", err)
			continue
		}
		if !reflect.DeepEqual(responsePipelineRun, pipelineRun) {
			t.Fatalf("Response object %v did not equal expected %v\n", responsePipelineRun, pipelineRun)
		}
	}
}

<<<<<<< HEAD
	// Test getAllPipelineRuns function
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelineruns/", nil)
	req := dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	r.getAllPipelineRuns(req, resp)

	result := v1alpha1.PipelineRunList{}
	json.NewDecoder(httpWriter.Body).Decode(&result)

	if len(result.Items) != 2 {
		t.Errorf("Number of tasks: expected: %d, returned: %d", 2, len(result.Items))
=======
// TaskRunLog test
func TestTaskRunLog(t *testing.T) {
	server, r := dummyServer()
	namespace := "ns1"
	_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	if err != nil {
		t.Fatalf("Error creating namespace '%s': %s\n", namespace, err)
>>>>>>> 43416c478a912f83d35cc5d5ab5bd39002d2220e
	}

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
						Name: containerPrefix + "Container1",
					},
					corev1.Container{
						Name: containerPrefix + "Container2",
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

<<<<<<< HEAD
	// Test getAllPipelineRuns function with query
	httpReq = dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelineruns?repository=http://github.com/foo/bar", nil)
	req = dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter = httptest.NewRecorder()
	resp = dummyRestfulResponse(httpWriter)
=======
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
>>>>>>> 43416c478a912f83d35cc5d5ab5bd39002d2220e

	for _, taskRun := range taskRuns {
		_, err := r.PipelineClient.TektonV1alpha1().TaskRuns(namespace).Create(&taskRun)
		if err != nil {
			t.Fatalf("Error creating taskRun '%s': %v\n", taskRun.Name, err)
		}
	}

	// Test getTaskRunLog function
	for _, taskRun := range taskRuns {
		httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/taskrunlogs/%s", server.URL, namespace, taskRun.Name), nil)
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

// PipelineRunLog test
func TestPipelineRunLog(t *testing.T) {
	server, r := dummyServer()
	namespace := "ns1"
	_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	if err != nil {
		t.Fatalf("Error creating namespace '%s': %s\n", namespace, err)
	}

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
						Name: containerPrefix + "Container1",
					},
					corev1.Container{
						Name: containerPrefix + "Container2",
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
						Name: containerPrefix + "Container1",
					},
					corev1.Container{
						Name: containerPrefix + "Container2",
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

<<<<<<< HEAD
	// Test getAllPipelineRuns function with name query
	// Sample request and response
	httpReq = dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelineruns?name=Pipeline2", nil)
	req = dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter = httptest.NewRecorder()
	resp = dummyRestfulResponse(httpWriter)

	r.getAllPipelineRuns(req, resp)

	// Decode the response
	result = v1alpha1.PipelineRunList{}
	json.NewDecoder(httpWriter.Body).Decode(&result)

	// Verify the response
	if len(result.Items) != 1 {
		t.Errorf("Number of PipelineRuns: expected: %d, returned: %d", 1, len(result.Items))
=======
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
>>>>>>> 43416c478a912f83d35cc5d5ab5bd39002d2220e
	}
	for _, taskRun := range taskRuns {
		_, err := r.PipelineClient.TektonV1alpha1().TaskRuns(namespace).Create(&taskRun)
		if err != nil {
			t.Fatalf("Error creating taskRun '%s': %v\n", taskRun.Name, err)
		}
	}

<<<<<<< HEAD
	// Test getPipelineRun function
	httpReq = dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelineruns/PipelineRun2", nil)
	req = dummyRestfulRequest(httpReq, "ns1", "PipelineRun2")
	httpWriter = httptest.NewRecorder()
	resp = dummyRestfulResponse(httpWriter)

	r.getPipelineRun(req, resp)
=======
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
>>>>>>> 43416c478a912f83d35cc5d5ab5bd39002d2220e

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

	// Test getPipelineRunLog function
	for i, pipelineRun := range pipelineRuns {
		httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/pipelinerunlogs/%s", server.URL, namespace, pipelineRun.Name), nil)
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

// PipelineRun update tests
func TestPipelineRunUpdate(t *testing.T) {
	server, r := dummyServer()
	namespace := "ns1"
	_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	if err != nil {
		t.Fatalf("Error creating namespace '%s': %s\n", namespace, err)
	}
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
	// Test updatePipelineRun function: good request
	httpRequestBody := strings.NewReader(`{"status" : "PipelineRunCancelled"}`)
	httpReq := dummyHTTPRequest("PUT", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns/%s", server.URL, namespace, pipelineName), httpRequestBody)
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
			httpReq := dummyHTTPRequest("PUT", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns/%s", server.URL, namespace, pipelineName), httpRequestBody)
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
	// Test updatePipelineRun function: bad request
	httpRequestBody = strings.NewReader(`{"notstatus" : "foo"}`)
	httpReq = dummyHTTPRequest("PUT", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns/%s", server.URL, namespace, pipelineName), httpRequestBody)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("Error getting updatePipelineRun response for pipelineRun '%s': %v\n", pipelineName, err)
	} else {
		expectedStatusCode := 400
		if response.StatusCode != expectedStatusCode {
			t.Fatalf("Response code %d did not equal expected %d\n", response.StatusCode, expectedStatusCode)
		}
	}
	// Test updatePipelineRun function: invalid pipelineRun name
	invalidPipelineRunName := "DNE"
	httpRequestBody = strings.NewReader(`{"status" : "foo"}`)
	httpReq = dummyHTTPRequest("PUT", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns/%s", server.URL, namespace, invalidPipelineRunName), httpRequestBody)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("Error getting updatePipelineRun response for pipelineRun '%s': %v\n", invalidPipelineRunName, err)
	} else {
		expectedStatusCode := 404
		if response.StatusCode != expectedStatusCode {
			t.Fatalf("Response code %d did not equal expected %d\n", response.StatusCode, expectedStatusCode)
		}
	}
	// Test updatePipelineRun function: invalid namespace
	invalidNamespace := "DNE"
	httpRequestBody = strings.NewReader(`{"status" : "foo"}`)
	httpReq = dummyHTTPRequest("PUT", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns/%s", server.URL, invalidNamespace, pipelineName), httpRequestBody)
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

// PipelineRun creation tests
func TestCreatePipelineRun(t *testing.T) {
	server, r := dummyServer()
	namespace := "ns1"
	_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	if err != nil {
		t.Fatalf("Error creating namespace '%s': %s\n", namespace, err)
	}

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
	// Test createPipelineRun function: bad request
	httpRequestBody := strings.NewReader(`{"fielddoesnotexist": "pipeline",}`)
	httpReq := dummyHTTPRequest("POST", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns", server.URL, namespace), httpRequestBody)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("Error getting createPipelineRun response for pipelineRun '%s': %v\n", pipelineRefName, err)
	} else {
		expectedStatusCode := 400
		if response.StatusCode != expectedStatusCode {
			t.Fatalf("Response code %d did not equal expected %d\n", response.StatusCode, expectedStatusCode)
		}
	}
	// Test createPipelinerun function: non-existant pipeline reference
	httpRequestBody = strings.NewReader(`{"pipelinename": "Pipelinedoesnotexist"}`)
	httpReq = dummyHTTPRequest("POST", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns", server.URL, namespace), httpRequestBody)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("Error getting createPipelineRun response for pipelineRun '%s': %v\n", pipelineRefName, err)
	} else {
		expectedStatusCode := 412
		if response.StatusCode != expectedStatusCode {
			t.Fatalf("Response code %d did not equal expected %d\n", response.StatusCode, expectedStatusCode)
		}
	}
<<<<<<< HEAD

	// Test getAllPipelineRuns function
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/taskrunlogs/TaskRun1", nil)
	req := dummyRestfulRequest(httpReq, "ns1", "TaskRun1")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	r.getTaskRunLog(req, resp)
	var taskRunLog TaskRunLog
	if err := json.NewDecoder(httpWriter.Body).Decode(&taskRunLog); err != nil {
		t.Error(err)
	}
	t.Log("getTaskRunLog Response:", taskRunLog)
}

// PipelineRunLog test
func TestPipelineRunLog(t *testing.T) {

	r := dummyResource()

	Container1 := corev1.Container{
		Name: "Container1",
	}
	Container2 := corev1.Container{
		Name: "Container2",
	}
	Container3 := corev1.Container{
		Name: "Container3",
	}
	Container4 := corev1.Container{
		Name: "Container4",
	}
	Container5 := corev1.Container{
		Name: "Container5",
	}
	Container6 := corev1.Container{
		Name: "Container6",
	}
	Container7 := corev1.Container{
		Name: "Container7",
	}

	TaskRun1 := v1alpha1.TaskRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "TaskRun1",
		},
		Spec: v1alpha1.TaskRunSpec{},
		Status: v1alpha1.TaskRunStatus{
			PodName: "Pod1",
		},
	}
	TaskRun2 := v1alpha1.TaskRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "TaskRun2",
		},
		Spec: v1alpha1.TaskRunSpec{},
		Status: v1alpha1.TaskRunStatus{
			PodName: "Pod2",
		},
	}
	TaskRun3 := v1alpha1.TaskRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "TaskRun3",
		},
		Spec: v1alpha1.TaskRunSpec{},
		Status: v1alpha1.TaskRunStatus{
			PodName: "Pod3",
		},
	}

	taskRunStatus1 := v1alpha1.TaskRunStatus{
		PodName: "Pod1",
	}
	taskRunStatus2 := v1alpha1.TaskRunStatus{
		PodName: "Pod2",
	}
	taskRunStatus3 := v1alpha1.TaskRunStatus{
		PodName: "Pod3",
	}

	pipelineRunTaskRunStatus1 := v1alpha1.PipelineRunTaskRunStatus{
		PipelineTaskName: "Task1",
		Status:           &taskRunStatus1,
	}

	pipelineRunTaskRunStatus2 := v1alpha1.PipelineRunTaskRunStatus{
		PipelineTaskName: "Task2",
		Status:           &taskRunStatus2,
	}

	pipelineRunTaskRunStatus3 := v1alpha1.PipelineRunTaskRunStatus{
		PipelineTaskName: "Task3",
		Status:           &taskRunStatus3,
	}

	PipelineRun1 := v1alpha1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "PipelineRun1",
		},
		Spec: v1alpha1.PipelineRunSpec{},
		Status: v1alpha1.PipelineRunStatus{
			TaskRuns: map[string]*v1alpha1.PipelineRunTaskRunStatus{
				"TaskRunStatus1": &pipelineRunTaskRunStatus1,
				"TaskRunStatus2": &pipelineRunTaskRunStatus2,
				"TaskRunStatus3": &pipelineRunTaskRunStatus3},
		},
	}
	PipelineRun2 := v1alpha1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "PipelineRun2",
		},
		Spec: v1alpha1.PipelineRunSpec{},
	}
	PipelineRun3 := v1alpha1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "PipelineRun3",
		},
		Spec: v1alpha1.PipelineRunSpec{},
	}

	Pod1 := corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Pod1",
		},
		Spec: corev1.PodSpec{
			Containers:     []corev1.Container{Container1, Container2},
			InitContainers: []corev1.Container{Container3, Container4},
		},
	}
	Pod2 := corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Pod2",
		},
		Spec: corev1.PodSpec{
			Containers:     []corev1.Container{Container5},
			InitContainers: []corev1.Container{Container6},
		},
	}
	Pod3 := corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Pod3",
		},
		Spec: corev1.PodSpec{
			Containers:     []corev1.Container{Container7},
			InitContainers: []corev1.Container{},
		},
	}
	Pod4 := corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Pod4",
		},
		Spec: corev1.PodSpec{
			Containers:     []corev1.Container{},
			InitContainers: []corev1.Container{},
		},
	}

	// Add sample PipelineRuns
	_, err := r.PipelineClient.TektonV1alpha1().PipelineRuns("ns1").Create(&PipelineRun1)
	if err != nil {
		t.Errorf("testPipelineRun error: %s", err)
	}
	_, err = r.PipelineClient.TektonV1alpha1().PipelineRuns("ns1").Create(&PipelineRun2)
	if err != nil {
		t.Errorf("testPipelineRun error: %s", err)
	}
	_, err = r.PipelineClient.TektonV1alpha1().PipelineRuns("ns2").Create(&PipelineRun3)
	if err != nil {
		t.Errorf("testPipelineRun error: %s", err)
	}

	// Add sample TaskRuns
	_, err = r.PipelineClient.TektonV1alpha1().TaskRuns("ns1").Create(&TaskRun1)
	if err != nil {
		t.Errorf("testTaskRun error: %s", err)
	}
	_, err = r.PipelineClient.TektonV1alpha1().TaskRuns("ns1").Create(&TaskRun2)
	if err != nil {
		t.Errorf("testTaskRun error: %s", err)
	}
	_, err = r.PipelineClient.TektonV1alpha1().TaskRuns("ns2").Create(&TaskRun3)
	if err != nil {
		t.Errorf("testTaskRun error: %s", err)
	}

	_, err = r.K8sClient.CoreV1().Pods("ns1").Create(&Pod1)
	if err != nil {
		t.Errorf("test error: %s", err)
	}
	_, err = r.K8sClient.CoreV1().Pods("ns1").Create(&Pod2)
	if err != nil {
		t.Errorf("test error: %s", err)
	}
	_, err = r.K8sClient.CoreV1().Pods("ns1").Create(&Pod3)
	if err != nil {
		t.Logf("test error: %s", err)
	}
	_, err = r.K8sClient.CoreV1().Pods("ns1").Create(&Pod4)
	if err != nil {
		t.Errorf("test error: %s", err)
	}

	// Test getAllPipelineRuns function
	// Sample request and response
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelinerunlogs/PipelineRun1", nil)
	req := dummyRestfulRequest(httpReq, "ns1", "PipelineRun1")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	r.getPipelineRunLog(req, resp)
	if !strings.Contains(httpWriter.Body.String(), "Pod3") {
		t.Errorf("Log doesn't have \"Pod3\"")
	}
	t.Logf("Response: %s", httpWriter.Body.String())

}

/*
	Test the update PipelineRun functionality: we want to test four different responses.
	TODO can we remove much of the set up duplication while retaining variables? Perhaps a function that returns all of the initialised objects.
	1: 200 (status updated ok)
	2: 400 (bad request)
	3: 404 (no such PipelineRun found in this namespace)
	4: 500 (internal server error: we couldn't do the update)

	The manual testing for this can be done as follows. Build the devops-back-end image, configure the handler/git repo yml to point to a repository so you have a webhook.
	Make sure you've got the templates all applied from the config directory so you've got a Pipeline and Task definitions.
	Push code to the repository after verifying you've got a webhook and this kicks off a PipelineRun.
	Retrieve the name of your PipelineRun e.g. with `kubectl get pipelinerun`.
	With Postman send a PUT to <your kservice domain for the github event pipeline>/v1/namespaces/<namespace>/pipelineruns/<name of pipeline run>
	In the body you want "status": "PipelineRunCancelled"
	Observe the PipelineRun is cancelled.
*/

/* Bad request test: a http 400 and message should be returned */

func TestPipelineRunUpdateBadRequest(t *testing.T) {
	t.Log("Testing a bad request throws a 400")

	r := dummyResource()

	container1 := corev1.Container{
		Name: "Container1",
	}

	container2 := corev1.Container{
		Name: "Container2",
	}

	taskRun1 := v1alpha1.TaskRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "TaskRun1",
		},
		Spec: v1alpha1.TaskRunSpec{},
		Status: v1alpha1.TaskRunStatus{
			PodName: "Pod1",
		},
	}

	taskRunStatus1 := v1alpha1.TaskRunStatus{
		PodName: "Pod1",
	}

	pipelineRunTaskRunStatus1 := v1alpha1.PipelineRunTaskRunStatus{
		PipelineTaskName: "Task1",
		Status:           &taskRunStatus1,
	}

	pipelineRun1 := v1alpha1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "PipelineRun1",
		},
		Spec: v1alpha1.PipelineRunSpec{},
		Status: v1alpha1.PipelineRunStatus{
			TaskRuns: map[string]*v1alpha1.PipelineRunTaskRunStatus{
				"TaskRunStatus1": &pipelineRunTaskRunStatus1},
		},
	}

	pod1 := corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Pod1",
		},
		Spec: corev1.PodSpec{
			Containers:     []corev1.Container{container1},
			InitContainers: []corev1.Container{container2},
		},
	}

	_, err := r.PipelineClient.TektonV1alpha1().PipelineRuns("ns1").Create(&pipelineRun1)
	if err != nil {
		t.Errorf("Error creating the PipelineRun for use with TestPipelineRunUpdateBadRequest, error: %s", err)
	}

	_, err = r.PipelineClient.TektonV1alpha1().TaskRuns("ns1").Create(&taskRun1)
	if err != nil {
		t.Errorf("Error creating the TaskRun for use with TestPipelineRunUpdateBadRequest error: %s", err)
	}

	_, err = r.K8sClient.CoreV1().Pods("ns1").Create(&pod1)
	if err != nil {
		t.Errorf("Error creating the Pod for use with TestPipelineRunUpdateBadRequest error: %s", err)
	}

	httpWriter := httptest.NewRecorder()

	badRequestBody := strings.NewReader(`{"notstatus" : "foo"}`)
	badRequest := dummyHTTPRequest("PUT", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelineruns/PipelineRun1", badRequestBody)
	badRequestRestful := dummyRestfulRequest(badRequest, "ns1", "PipelineRun1")
	resp := dummyRestfulResponse(httpWriter)
	r.updatePipelineRun(badRequestRestful, resp)

	if resp.StatusCode() != 400 {
		t.Errorf("FAIL: should have been recognised as a bad request, got %d", resp.StatusCode())
	}

	if !strings.Contains(httpWriter.Body.String(), "bad request") {
		t.Errorf("FAIL: should have been recognised as a bad request with bad request being in the error, got: %s", httpWriter.Body.String())
	}
}

/* Not found PipelineRun (by name) test: 404 and message returned */

func TestPipelineRunUpdateNotFoundByName(t *testing.T) {
	t.Log("Testing a not found PipelineRun throws a 404 (wrong name provided)")

	r := dummyResource()
	httpWriter := httptest.NewRecorder()

	notFoundBody := strings.NewReader(`{"status" : "foo"}`)
	notFoundRequest := dummyHTTPRequest("PUT", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelineruns/IDoNotExist", notFoundBody)
	notFoundRestfulRequest := dummyRestfulRequest(notFoundRequest, "ns1", "IDoNotExist")
	resp := dummyRestfulResponse(httpWriter)
	r.updatePipelineRun(notFoundRestfulRequest, resp)

	if resp.StatusCode() != 404 {
		t.Errorf("FAIL: should have been recognised as a 404, got %d", resp.StatusCode())
	}

	if !strings.Contains(httpWriter.Body.String(), "not found") {
		t.Errorf("FAIL: should have been recognised as a 404 with not found being in the error, got %s", httpWriter.Body.String())
	}
}

/* Not found PipelineRun (by namespace) test: 404 and message returned */

func TestPipelineRunUpdateNotFoundByNamespace(t *testing.T) {
	t.Log("Testing a not found PipelineRun throws a 404 (wrong namespace)")

	r := dummyResource()

	container1 := corev1.Container{
		Name: "Container1",
	}

	container2 := corev1.Container{
		Name: "Container2",
	}

	taskRun1 := v1alpha1.TaskRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "TaskRun1",
		},
		Spec: v1alpha1.TaskRunSpec{},
		Status: v1alpha1.TaskRunStatus{
			PodName: "Pod1",
		},
	}

	taskRunStatus1 := v1alpha1.TaskRunStatus{
		PodName: "Pod1",
	}

	pipelineRunTaskRunStatus1 := v1alpha1.PipelineRunTaskRunStatus{
		PipelineTaskName: "Task1",
		Status:           &taskRunStatus1,
	}

	pipelineRun1 := v1alpha1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "PipelineRun1",
		},
		Spec: v1alpha1.PipelineRunSpec{},
		Status: v1alpha1.PipelineRunStatus{
			TaskRuns: map[string]*v1alpha1.PipelineRunTaskRunStatus{
				"TaskRunStatus1": &pipelineRunTaskRunStatus1},
		},
	}

	pod1 := corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Pod1",
		},
		Spec: corev1.PodSpec{
			Containers:     []corev1.Container{container1},
			InitContainers: []corev1.Container{container2},
		},
	}

	_, err := r.PipelineClient.TektonV1alpha1().PipelineRuns("ns1").Create(&pipelineRun1)
	if err != nil {
		t.Errorf("Error creating the PipelineRun for use with TestPipelineRunUpdateNotFoundByNamespace, error: %s", err)
	}

	_, err = r.PipelineClient.TektonV1alpha1().TaskRuns("ns1").Create(&taskRun1)
	if err != nil {
		t.Errorf("Error creating the TaskRun for use with TestPipelineRunUpdateNotFoundByNamespace error: %s", err)
	}

	_, err = r.K8sClient.CoreV1().Pods("ns1").Create(&pod1)
	if err != nil {
		t.Errorf("Error creating the Pod for use with TestPipelineRunUpdateNotFoundByNamespace error: %s", err)
	}

	httpWriter := httptest.NewRecorder()

	notFoundBody := strings.NewReader(`{"status" : "foo"}`)
	notFoundRequest := dummyHTTPRequest("PUT", "http://wwww.dummy.com:8383/v1/namespaces/notns1/pipelineruns/PipelineRun1", notFoundBody)
	notFoundRestfulRequest := dummyRestfulRequest(notFoundRequest, "notns1", "PipelineRun1")
	resp := dummyRestfulResponse(httpWriter)
	r.updatePipelineRun(notFoundRestfulRequest, resp)

	if resp.StatusCode() != 404 {
		t.Errorf("FAIL: should have been recognised as a 404, got %d", resp.StatusCode())
	}

	if !strings.Contains(httpWriter.Body.String(), "not found") {
		t.Errorf("FAIL: should have been recognised as a 404 with not found being in the error, got %s", httpWriter.Body.String())
	}
}

/* Good request test: 204 (as no content is provided) and message */

func TestPipelineRunUpdateAllGood(t *testing.T) {
	t.Log("Testing a good request returns a 204 when all is ok")
	r := dummyResource()

	container1 := corev1.Container{
		Name: "Container1",
	}

	container2 := corev1.Container{
		Name: "Container2",
	}

	taskRun1 := v1alpha1.TaskRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "TaskRun1",
		},
		Spec: v1alpha1.TaskRunSpec{},
		Status: v1alpha1.TaskRunStatus{
			PodName: "Pod1",
		},
	}

	taskRunStatus1 := v1alpha1.TaskRunStatus{
		PodName: "Pod1",
	}

	pipelineRunTaskRunStatus1 := v1alpha1.PipelineRunTaskRunStatus{
		PipelineTaskName: "Task1",
		Status:           &taskRunStatus1,
	}

	pipelineRun1 := v1alpha1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "PipelineRun1",
		},
		Spec: v1alpha1.PipelineRunSpec{},
		Status: v1alpha1.PipelineRunStatus{
			TaskRuns: map[string]*v1alpha1.PipelineRunTaskRunStatus{
				"TaskRunStatus1": &pipelineRunTaskRunStatus1},
		},
	}

	pod1 := corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Pod1",
		},
		Spec: corev1.PodSpec{
			Containers:     []corev1.Container{container1},
			InitContainers: []corev1.Container{container2},
		},
	}

	_, err := r.PipelineClient.TektonV1alpha1().PipelineRuns("ns1").Create(&pipelineRun1)
	if err != nil {
		t.Errorf("Error creating the PipelineRun for use with TestPipelineRunUpdateAllGood, error: %s", err)
	}

	_, err = r.PipelineClient.TektonV1alpha1().TaskRuns("ns1").Create(&taskRun1)
	if err != nil {
		t.Errorf("Error creating the TaskRun for use with TestPipelineRunUpdateAllGood error: %s", err)
	}

	_, err = r.K8sClient.CoreV1().Pods("ns1").Create(&pod1)
	if err != nil {
		t.Errorf("Error creating the Pod for use with TestPipelineRunUpdateAllGood error: %s", err)
	}

	httpWriter := httptest.NewRecorder()

	goodRequestBody := strings.NewReader(`{"status" : "PipelineRunCancelled"}`)
	goodRequest := dummyHTTPRequest("PUT", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelineruns/PipelineRun1", goodRequestBody)
	goodRequestRestful := dummyRestfulRequest(goodRequest, "ns1", "PipelineRun1")
	resp := dummyRestfulResponse(httpWriter)
	r.updatePipelineRun(goodRequestRestful, resp)

	if resp.StatusCode() != 204 {
		t.Errorf("FAIL: should have been recognised as a 204, got %d", resp.StatusCode())
	}
}

/* Duplicate status setting test: 412 returned */

func TestPipelineRunUpdateStatusAlreadySet412(t *testing.T) {
	t.Log("Testing a request to update the status to one already set gives a http 412 response code")

	r := dummyResource()

	container1 := corev1.Container{
		Name: "Container1",
	}

	container2 := corev1.Container{
		Name: "Container2",
	}

	taskRun1 := v1alpha1.TaskRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "TaskRun1",
		},
		Spec: v1alpha1.TaskRunSpec{},
		Status: v1alpha1.TaskRunStatus{
			PodName: "Pod1",
		},
	}

	taskRunStatus1 := v1alpha1.TaskRunStatus{
		PodName: "Pod1",
	}

	pipelineRunTaskRunStatus1 := v1alpha1.PipelineRunTaskRunStatus{
		PipelineTaskName: "Task1",
		Status:           &taskRunStatus1,
	}

	pipelineRun1 := v1alpha1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "PipelineRun1",
		},
		Spec: v1alpha1.PipelineRunSpec{},
		Status: v1alpha1.PipelineRunStatus{
			TaskRuns: map[string]*v1alpha1.PipelineRunTaskRunStatus{
				"TaskRunStatus1": &pipelineRunTaskRunStatus1},
		},
	}

	pod1 := corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Pod1",
		},
		Spec: corev1.PodSpec{
			Containers:     []corev1.Container{container1},
			InitContainers: []corev1.Container{container2},
		},
	}

	_, err := r.PipelineClient.TektonV1alpha1().PipelineRuns("ns1").Create(&pipelineRun1)
	if err != nil {
		t.Errorf("Error creating the PipelineRun for use with TestPipelineRunUpdateStatusAlreadySet412, error: %s", err)
	}

	_, err = r.PipelineClient.TektonV1alpha1().TaskRuns("ns1").Create(&taskRun1)
	if err != nil {
		t.Errorf("Error creating the TaskRun for use with TestPipelineRunUpdateStatusAlreadySet412 error: %s", err)
	}

	_, err = r.K8sClient.CoreV1().Pods("ns1").Create(&pod1)
	if err != nil {
		t.Errorf("Error creating the Pod for use with TestPipelineRunUpdateStatusAlreadySet412 error: %s", err)
	}

	httpWriter := httptest.NewRecorder()

	statusCancelBody := strings.NewReader(`{"status": "PipelineRunCancelled"}`)

	statusCancelRequest := dummyHTTPRequest("PUT", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelineruns/PipelineRun1", statusCancelBody)
	statusCancelRestful := dummyRestfulRequest(statusCancelRequest, "ns1", "PipelineRun1")
	resp := dummyRestfulResponse(httpWriter)
	r.updatePipelineRun(statusCancelRestful, resp)

	if resp.StatusCode() != 204 {
		t.Errorf("FAIL: should have been recognised as a 204, got %d", resp.StatusCode())
	}

	// It's already set to be cancelled, so doing it again should give us a 412 response (pre-condition failed)

	anotherCancelBody := strings.NewReader(`{"status": "PipelineRunCancelled"}`)
	duplicatedStatusSet := dummyHTTPRequest("PUT", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelineruns/PipelineRun1", anotherCancelBody)
	duplicatedStatusSetRestful := dummyRestfulRequest(duplicatedStatusSet, "ns1", "PipelineRun1")
	resp = dummyRestfulResponse(httpWriter)
	r.updatePipelineRun(duplicatedStatusSetRestful, resp)

	if resp.StatusCode() != 412 {
		t.Errorf("FAIL: should have received a http 412 code when setting the status to something already set, got %d", resp.StatusCode())
	}
}

/* PipelineRun create bad request 400 */
func TestCreatePipelineRunBadRequest(t *testing.T) {

	r := dummyResource()

	err := CreateTestPipeline(r)
	if err != nil {
		t.Errorf("FAIL: error creating test pipeline: %s", err)
	}

	badRequestPipelineRunBody := strings.NewReader(`{"fielddoesnotexist": "pipeline",}`)
	request, resp := createDummyPipelineRunQuery(badRequestPipelineRunBody)
	r.createPipelineRun(request, resp)

	if resp.StatusCode() != 400 {
		t.Errorf("FAIL: should have been recognised as a 400, got %d", resp.StatusCode())
	}
}

/* PipelineRun create successful 201 */
func TestCreatePipelineRunSuccess(t *testing.T) {

	r := dummyResource()

	err := CreateTestPipeline(r)
	if err != nil {
		t.Errorf("FAIL: error creating test pipeline: %s", err)
	}

	pipelineRunBody := strings.NewReader(`{"pipelinename": "Pipeline1"}`)
	request, resp := createDummyPipelineRunQuery(pipelineRunBody)
	r.createPipelineRun(request, resp)

	if resp.StatusCode() != 201 {
		t.Errorf("FAIL: should have been recognised as a 201, got %d", resp.StatusCode())
	}
}

/* PipelineRun no Pipeline 412 */
func TestCreatePipelineRunNoPipeline(t *testing.T) {

	r := dummyResource()

	pipelineRunBody := strings.NewReader(`{"pipelinename": "Pipelinedoesnotexist"}`)
	request, resp := createDummyPipelineRunQuery(pipelineRunBody)
	r.createPipelineRun(request, resp)

	if resp.StatusCode() != 412 {
		t.Errorf("FAIL: should have been recognised as a 412, got %d", resp.StatusCode())
	}
}

/* PipelineRun create with Git resource */
func TestCreatePipelineRunGitResource(t *testing.T) {

	r := dummyResource()

	err := CreateTestPipeline(r)
	if err != nil {
		t.Errorf("FAIL: error creating test pipeline: %s", err)
	}

	repoURL := "http://github.com/testorg/testrepo"
	revision := "12345"

	pipelineRunBody := strings.NewReader(
		`{"pipelinename":    "Pipeline1",
			"gitresourcename": "git-source",
			"gitcommit":       "12345",
			"repourl":         "http://github.com/testorg/testrepo"}`)

	request, resp := createDummyPipelineRunQuery(pipelineRunBody)
	r.createPipelineRun(request, resp)

	pipelineResourceList, err := r.PipelineClient.TektonV1alpha1().PipelineResources("ns1").List(metav1.ListOptions{})

	numberOfGitResources := 0
	resourceName := ""

	for _, pipelineResource := range pipelineResourceList.Items {
		if pipelineResource.Spec.Type == "git" {
			numberOfGitResources++
			resourceName = pipelineResource.Name
		}
	}

	if numberOfGitResources != 1 {
		t.Errorf("FAIL: expected to find a single created PipelineResource of type Git, but found the number of Git PipelineResources to be %d", numberOfGitResources)
	}

	params := []string{revision, repoURL}
	err = testPipelineResource(r, resourceName, v1alpha1.PipelineResourceTypeGit, params)
	if err != nil {
		t.Error(err)
	}

	t.Logf("Pipeline resource list: %v", pipelineResourceList)

	if resp.StatusCode() != 201 {
		t.Errorf("FAIL: should have been recognised as a 201, got %d", resp.StatusCode())
	}
}

/* PipelineRun create with Image resource */
func TestCreatePipelineRunImageResource(t *testing.T) {

	r := dummyResource()

	err := CreateTestPipeline(r)
	if err != nil {
		t.Errorf("FAIL: error creating test pipeline: %s", err)
	}

	pipelineRunBody := strings.NewReader(
		`{"pipelinename":      "Pipeline1",
			"imageresourcename": "image-source",
			"gitcommit":       	 "12345",
			"reponame":        	 "testreponame"}`)

	expectedImageURL := "/testreponame:12345"

	request, resp := createDummyPipelineRunQuery(pipelineRunBody)
	r.createPipelineRun(request, resp)

	pipelineResourceList, err := r.PipelineClient.TektonV1alpha1().PipelineResources("ns1").List(metav1.ListOptions{})

	numberOfImageResources := 0
	resourceName := ""

	for _, pipelineResource := range pipelineResourceList.Items {
		if pipelineResource.Spec.Type == "image" {
			numberOfImageResources++
			resourceName = pipelineResource.Name
		}
	}

	if numberOfImageResources != 1 {
		t.Errorf("FAIL: expected to find a single created PipelineResource of type image, but found the number of image PipelineResources to be %d", numberOfImageResources)
	}

	params := []string{expectedImageURL}
	err = testPipelineResource(r, resourceName, "image", params)
	if err != nil {
		t.Error("FAIL: the values expected for the resource did not match the actual values of the created resource")
	}

	t.Logf("Pipeline resource list: %v", pipelineResourceList)

	if resp.StatusCode() != 201 {
		t.Errorf("FAIL: should have been recognised as a 201, got %d", resp.StatusCode())
	}
}

/* PipelineRun create with Git resource and image resource */
func TestCreatePipelineRunGitAndImageResource(t *testing.T) {

	r := dummyResource()

	err := CreateTestPipeline(r)
	if err != nil {
		t.Errorf("FAIL: error creating test pipeline: %s", err)
	}

	revision := "12345"
	repoURL := "http://github.com/testorg/testrepo"
	expectedImageURL := "/testreponame:12345"

	pipelineRunBody := strings.NewReader(
		`{"pipelinename":      "Pipeline1",
			"imageresourcename": "image-source",
			"gitresourcename":   "git-source",
			"gitcommit":         "12345",
			"reponame":          "testreponame",
			"repourl":           "http://github.com/testorg/testrepo"}`)

	request, resp := createDummyPipelineRunQuery(pipelineRunBody)
	r.createPipelineRun(request, resp)

	pipelineResourceList, err := r.PipelineClient.TektonV1alpha1().PipelineResources("ns1").List(metav1.ListOptions{})

	numberOfGitResources := 0
	numberOfImageResources := 0

	resourceListingAsItems := pipelineResourceList.Items

	gitResourceName := ""
	imageResourceName := ""

	for _, pipelineResource := range resourceListingAsItems {
		if pipelineResource.Spec.Type == "git" {
			numberOfGitResources++
			gitResourceName = pipelineResource.Name
		} else if pipelineResource.Spec.Type == "image" {
			numberOfImageResources++
			imageResourceName = pipelineResource.Name
		}
	}

	if numberOfGitResources != 1 {
		t.Errorf("FAIL: expected one created PipelineResource of type git but found the number of git PipelineResources to be %d", numberOfGitResources)
	}

	if numberOfImageResources != 1 {
		t.Errorf("FAIL: expected one created PipelineResource of type image but found the number of image PipelineResources to be %d", numberOfImageResources)
	}

	params := []string{revision, repoURL}
	err = testPipelineResource(r, gitResourceName, "git", params)
	if err != nil {
		t.Error("FAIL: the values expected for the resource did not match the actual values of the created resource")
	}

	params = []string{expectedImageURL}
	err = testPipelineResource(r, imageResourceName, "image", params)
	if err != nil {
		t.Error("FAIL: the values expected for the resource did not match the actual values of the created resource")
	}

	t.Logf("Pipeline resource list: %v", pipelineResourceList)

	if resp.StatusCode() != 201 {
		t.Errorf("FAIL: should have been recognised as a 201, got %d", resp.StatusCode())
	}
}

func createDummyPipelineRunQuery(pipelineRunBody io.Reader) (*restful.Request, *restful.Response) {
	httpWriter := httptest.NewRecorder()

	pipelineRunRequest := dummyHTTPRequest("POST", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelineruns", pipelineRunBody)
	pipelineRunRequestRestful := dummyRestfulRequest(pipelineRunRequest, "ns1", "")
	resp := dummyRestfulResponse(httpWriter)
	return pipelineRunRequestRestful, resp
}

func CreateTestPipeline(r *Resource) error {
	pipeline1 := v1alpha1.Pipeline{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Pipeline1",
		},
		Spec: v1alpha1.PipelineSpec{},
	}

	_, err := r.PipelineClient.TektonV1alpha1().Pipelines("ns1").Create(&pipeline1)
	if err != nil {
		return err
	}
	return nil
}

func testPipelineResource(r *Resource, resourceName string, resourceType v1alpha1.PipelineResourceType, params []string) error {
	resource, err := r.PipelineClient.TektonV1alpha1().PipelineResources("ns1").Get(resourceName, metav1.GetOptions{})
	if err != nil {
		return fmt.Errorf("FAIL: there was a problem getting the created resource")
	}

	if resourceType != resource.Spec.Type {
		return fmt.Errorf("FAIL: the type for the resource didn't match, wanted %s but was %s", resourceType, resource.Spec.Type)
	}

	for i := range params {
		if params[i] != resource.Spec.Params[i].Value {
			return fmt.Errorf("FAIL: the param for the resource didn't match, wanted %s but was %s", params[i], resource.Spec.Params[i].Value)
		}
	}

	return nil
=======
	// Test createPipelineRun function: good requests with/without pipelineResources
	for index, manualPipelineRun := range manualPipelineRuns {
		jsonMarshalledBytes, err := json.Marshal(&manualPipelineRun)
		if err != nil {
			t.Fatalf("Error marshalling manualPipelineRun[%d]: %v\n", index, err)
			continue
		}
		t.Logf("createPipelineRun payload: %v\n", string(jsonMarshalledBytes))
		httpRequestBody := bytes.NewReader(jsonMarshalledBytes)
		httpReq := dummyHTTPRequest("POST", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns", server.URL, namespace), httpRequestBody)
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
					Params: []v1alpha1.Param{
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
					Params: []v1alpha1.Param{
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
		httpReq = dummyHTTPRequest("GET", fmt.Sprintf("%s/%s", server.URL, response.Header["Content-Location"][0]), nil)
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
>>>>>>> 43416c478a912f83d35cc5d5ab5bd39002d2220e
}
