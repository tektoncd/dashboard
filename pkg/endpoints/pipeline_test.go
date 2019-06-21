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

	"github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Namespaces are specified on K8s CRD initialization (not client creation) to assert DeepEqual

// GET tasks + tasks/{name}
func TestGETTasks(t *testing.T) {
	server, r := dummyServer()
	defer server.Close()

	namespaces := []string{
		"ns1",
		"ns2",
	}
	for _, namespace := range namespaces {
		_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
		if err != nil {
			t.Fatalf("Error creating namespace '%s': %v\n", namespace, err)
		}
	}
	namespaceTaskMap := map[string][]v1alpha1.Task{
		namespaces[0]: []v1alpha1.Task{
			{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "Task1",
					Namespace: namespaces[0],
				},
				Spec: v1alpha1.TaskSpec{},
			},
			{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "Task2",
					Namespace: namespaces[0],
				},
				Spec: v1alpha1.TaskSpec{},
			},
		},
		namespaces[1]: []v1alpha1.Task{
			{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "Task3",
					Namespace: namespaces[1],
				},
				Spec: v1alpha1.TaskSpec{},
			},
		},
	}
	var allTasks int

	// Test getAllTasks: no tasks
	httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/*/tasks", server.URL), nil)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllTasks response error: %v\n", err)
	}
	responseTaskList := v1alpha1.TaskList{}
	if err := json.NewDecoder(response.Body).Decode(&responseTaskList); err != nil {
		t.Fatalf("Error decoding getAllTasks response: %v\n", err)
	} else {
		if len(responseTaskList.Items) != 0 {
			t.Fatal("No tasks expected")
		}
	}
	// Create tasks
	for _, namespacedTasks := range namespaceTaskMap {
		for _, task := range namespacedTasks {
			_, err := r.PipelineClient.TektonV1alpha1().Tasks(task.ObjectMeta.Namespace).Create(&task)
			if err != nil {
				t.Fatalf("Error creating task '%s': %v\n", task.ObjectMeta.Name, err)
			}
			allTasks++
		}
	}
	// Test getAllTasks: all namespaces
	httpReq = dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/*/tasks", server.URL), nil)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllTasks response error: %v\n", err)
	}
	responseTaskList = v1alpha1.TaskList{}
	if err := json.NewDecoder(response.Body).Decode(&responseTaskList); err != nil {
		t.Fatalf("Error decoding getAllTasks response: %v\n", err)
	} else {
		if len(responseTaskList.Items) != allTasks {
			t.Errorf("All expected tasks were not returned: expected %v, actual %v", allTasks, len(responseTaskList.Items))
		}
	}
	// Test getAllTasks: each namespace
	for namespace, namespacedTasks := range namespaceTaskMap {
		httpReq = dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/tasks", server.URL, namespace), nil)
		response, err = http.DefaultClient.Do(httpReq)
		if err != nil {
			t.Fatalf("getAllTasks response error: %v\n", err)
		} else {
			responseTaskList := v1alpha1.TaskList{}
			if err := json.NewDecoder(response.Body).Decode(&responseTaskList); err != nil {
				t.Fatalf("Error decoding getAllTasks response: %v\n", err)
			} else {
				if len(responseTaskList.Items) != len(namespacedTasks) {
					t.Errorf("All expected tasks were not returned: expected %v, actual %v", len(namespacedTasks), len(responseTaskList.Items))
				}
			}
		}
	}
	// Test getTask
	for _, namespacedTasks := range namespaceTaskMap {
		for _, task := range namespacedTasks {
			httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/tasks/%s", server.URL, task.ObjectMeta.Namespace, task.Name), nil)
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
		}
	}
}

// GET pipelines + pipelines/{name}
func TestGETPipelines(t *testing.T) {
	server, r := dummyServer()
	defer server.Close()
	namespaces := []string{
		"ns1",
		"ns2",
	}
	for _, namespace := range namespaces {
		_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
		if err != nil {
			t.Fatalf("Error creating namespace '%s': %v\n", namespace, err)
		}
	}

	namespacePipelineMap := map[string][]v1alpha1.Pipeline{
		namespaces[0]: []v1alpha1.Pipeline{
			{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "Pipeline1",
					Namespace: namespaces[0],
				},
				Spec: v1alpha1.PipelineSpec{},
			},
			{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "Pipeline2",
					Namespace: namespaces[0],
				},
				Spec: v1alpha1.PipelineSpec{},
			},
		},
		namespaces[1]: []v1alpha1.Pipeline{
			{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "Pipeline3",
					Namespace: namespaces[1],
				},
				Spec: v1alpha1.PipelineSpec{},
			},
		},
	}
	var allPipelines int

	// Test getAllPipelines: no pipelines
	httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/*/pipelines", server.URL), nil)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllPipelines response error: %v\n", err)
	}
	responsePipelineList := v1alpha1.PipelineList{}
	if err := json.NewDecoder(response.Body).Decode(&responsePipelineList); err != nil {
		t.Fatalf("Error decoding getAllPipelines response: %v\n", err)
	} else {
		if len(responsePipelineList.Items) != 0 {
			t.Fatal("No pipelines expected")
		}
	}
	// Create pipelines
	for _, namespacedPipelines := range namespacePipelineMap {
		for _, pipeline := range namespacedPipelines {
			_, err := r.PipelineClient.TektonV1alpha1().Pipelines(pipeline.ObjectMeta.Namespace).Create(&pipeline)
			if err != nil {
				t.Fatalf("Error creating pipeline '%s': %v\n", pipeline.Name, err)
			}
			allPipelines++
		}
	}
	// Test getAllPipelines: all namespaces
	httpReq = dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/*/pipelines", server.URL), nil)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllPipelines response error: %v\n", err)
	}
	responsePipelineList = v1alpha1.PipelineList{}
	if err := json.NewDecoder(response.Body).Decode(&responsePipelineList); err != nil {
		t.Fatalf("Error decoding getAllPipelines response: %v\n", err)
	} else {
		if len(responsePipelineList.Items) != allPipelines {
			t.Errorf("All expected pipelines were not returned %v, actual %v", allPipelines, len(responsePipelineList.Items))
		}
	}
	// Test getAllPipelines: each namespaces
	for namespace, namespacedPipelines := range namespacePipelineMap {
		httpReq = dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/pipelines", server.URL, namespace), nil)
		response, err = http.DefaultClient.Do(httpReq)
		if err != nil {
			t.Fatalf("getAllPipelines response error: %v\n", err)
		} else {
			responsePipelineList := v1alpha1.PipelineList{}
			if err := json.NewDecoder(response.Body).Decode(&responsePipelineList); err != nil {
				t.Fatalf("Error decoding getAllPipelines response: %v\n", err)
			} else {
				if len(responsePipelineList.Items) != len(namespacedPipelines) {
					t.Errorf("All expected pipelines were not returned %v, actual %v", len(namespacedPipelines), len(responsePipelineList.Items))
				}
			}
		}
	}
	// Test getPipeline
	for _, namespacedPipelines := range namespacePipelineMap {
		for _, pipeline := range namespacedPipelines {
			httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/pipelines/%s", server.URL, pipeline.ObjectMeta.Namespace, pipeline.Name), nil)
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
		}
	}

}

// GET taskruns + taskruns/{name}
func TestGETTaskRuns(t *testing.T) {
	server, r := dummyServer()
	defer server.Close()

	namespace := "ns1"
	_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	if err != nil {
		t.Fatalf("Error creating namespace '%s': %v\n", namespace, err)
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
		v1alpha1.TaskRun{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "TaskRun3",
				Namespace: namespace,
			},
			Spec: v1alpha1.TaskRunSpec{
				TaskRef: &v1alpha1.TaskRef{
					Name: taskRefName,
				},
			},
		},
	}
	// Test getAllTaskRuns: no taskRuns
	httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/*/taskruns", server.URL), nil)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllTaskRuns response error: %v\n", err)
	} else {
		responseTaskRunList := v1alpha1.TaskRunList{}
		if err := json.NewDecoder(response.Body).Decode(&responseTaskRunList); err != nil {
			t.Fatalf("Error decoding getAllTaskRuns response: %v\n", err)
		} else {
			if len(responseTaskRunList.Items) != 0 {
				t.Fatal("No taskRuns expected")
			}
		}
	}
	// Create taskRuns
	taskRuns := append(unreferencedTaskRuns, referencedTaskRuns...)
	for _, taskRun := range taskRuns {
		_, err := r.PipelineClient.TektonV1alpha1().TaskRuns(namespace).Create(&taskRun)
		if err != nil {
			t.Fatalf("Error creating taskRun '%s': %v\n", taskRun.Name, err)
		}
	}
	// Test getAllTaskRuns: all namespaces
	httpReq = dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/*/taskruns", server.URL), nil)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllTaskRuns response error: %v\n", err)
	} else {
		responseTaskRunList := v1alpha1.TaskRunList{}
		if err := json.NewDecoder(response.Body).Decode(&responseTaskRunList); err != nil {
			t.Fatalf("Error decoding getAllTaskRuns response: %v\n", err)
		} else {
			if len(responseTaskRunList.Items) != len(taskRuns) {
				t.Fatal("All expected taskRuns were not returned")
			}
		}
	}
	// Test getAllTaskRuns: name filter
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
	// Test getTaskRun
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
	}
}

// GET pipelineruns + pipelineruns/{name}
func TestGETPipelineRuns(t *testing.T) {
	server, r := dummyServer()
	defer server.Close()
	namespace := "ns1"
	_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	if err != nil {
		t.Fatalf("Error creating namespace '%s': %s\n", namespace, err)
	}

	repository := "https://github.com/foo/bar"
	revision := "branchy"
	labels1, _ := NewPipelineRunLabels(repository, "")
	labels2, _ := NewPipelineRunLabels(repository, revision)

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
	// Test getAllPipelineRuns: no pipelineRuns
	httpReq := dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/*/pipelineruns", server.URL), nil)
	response, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllPipelineRuns response error: %v\n", err)
	} else {
		responsePipelineRunList := v1alpha1.PipelineRunList{}
		if err := json.NewDecoder(response.Body).Decode(&responsePipelineRunList); err != nil {
			t.Fatalf("Error decoding getAllPipelineRuns response: %v\n", err)
		} else {
			if len(responsePipelineRunList.Items) != 0 {
				t.Fatal("No pipelineRuns expected")
			}
		}
	}
	// Create pipelineRuns
	pipelineRuns := append(unreferencedPipelineRuns, referencedPipelineRuns...)
	for _, pipelineRun := range pipelineRuns {
		_, err := r.PipelineClient.TektonV1alpha1().PipelineRuns(namespace).Create(&pipelineRun)
		if err != nil {
			t.Fatalf("Error creating pipelineRun '%s': %v\n", pipelineRun.Name, err)
		}
	}

	// Test getAllPipelineRuns: all namespaces
	httpReq = dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/*/pipelineruns", server.URL), nil)
	response, err = http.DefaultClient.Do(httpReq)
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
	// Test getAllPipelineRuns: repository filter
	httpReq = dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns?repository=%s", server.URL, namespace, repository), nil)
	response, err = http.DefaultClient.Do(httpReq)
	if err != nil {
		t.Fatalf("getAllPipelineRuns response error with filter repo '%s': %v\n", repository, err)
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
	// Test getAllPipelineRuns: repository filter + revision filter
	httpReq = dummyHTTPRequest("GET", fmt.Sprintf("%s/v1/namespaces/%s/pipelineruns?repository=%s&revision=%s", server.URL, namespace, repository, revision), nil)
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
	// Test getAllPipelineRuns: name filter
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
	// Test getPipelineRun
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

// GET taskrunlogs
func TestGETTaskRunLogs(t *testing.T) {
	server, r := dummyServer()
	defer server.Close()
	namespace := "ns1"
	_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	if err != nil {
		t.Fatalf("Error creating namespace '%s': %s\n", namespace, err)
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

// GET pipelinerunlogs
func TestGETPipelineRunLogs(t *testing.T) {
	server, r := dummyServer()
	defer server.Close()
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

// PUT pipelineruns
func TestPUTPipelineRun(t *testing.T) {
	server, r := dummyServer()
	defer server.Close()
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
	// Test updatePipelineRun: good request
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
	// Test updatePipelineRun: bad request
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
	// Test updatePipelineRun: invalid pipelineRun name
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
	// Test updatePipelineRun: invalid namespace
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

// POST pipelineruns
func TestPOSTPipelineRuns(t *testing.T) {
	server, r := dummyServer()
	defer server.Close()
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
		ManualPipelineRun{
			PIPELINENAME:      pipelineRefName,
			IMAGERESOURCENAME: "image-source2",
			GITRESOURCENAME:   "git-source2",
			GITCOMMIT:         "12345",
			REPONAME:          "testreponame",
			REPOURL:           "http://github.com/testorg/testrepo",
			REVISION:          "revision",
		},
	}
	// Test createPipelineRun: bad request
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
	// Test createPipelinerun: non-existant pipeline reference
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
	// Test createPipelineRun: good requests with/without pipelineResources
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
		var responsePipelineRun v1alpha1.PipelineRun
		// Get the pipelineRun for the v1alpha1.PipelineRunSpec Resources field
		httpReq = dummyHTTPRequest("GET", fmt.Sprintf("%s/%s", server.URL, response.Header["Content-Location"][0]), nil)
		response, err = http.DefaultClient.Do(httpReq)
		if err := json.NewDecoder(response.Body).Decode(&responsePipelineRun); err != nil {
			t.Fatalf("Error unmarshalling response into pipelineRun: %v\n", err)
			continue
		}
		// Check labels set
		if manualPipelineRun.REPOURL != "" {
			labels, err := NewPipelineRunLabels(manualPipelineRun.REPOURL, manualPipelineRun.REVISION)
			if err != nil {
				t.Fatal("Unable to get labels for pipelinerun")
			}
			if !reflect.DeepEqual(responsePipelineRun.Labels,labels) {
				t.Fatalf("Actual labels returned %v did not equal expected %v\n",responsePipelineRun.Labels,labels)
			}
		}
		// The manualPipelineRun resources names do not match the actual pipelineResourceRef (postfixes are appended)
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
