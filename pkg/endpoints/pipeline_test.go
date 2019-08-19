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
	"encoding/json"
	"fmt"
	"github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"net/http"
	"reflect"
	"strconv"
	"testing"

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
