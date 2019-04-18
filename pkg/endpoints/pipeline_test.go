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
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"

	v1alpha1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Task test
func TestTask(t *testing.T) {

	r := dummyResource()

	// sample tasks
	task1 := v1alpha1.Task{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Task1",
		},
		Spec: v1alpha1.TaskSpec{},
	}
	task2 := v1alpha1.Task{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Task2",
		},
		Spec: v1alpha1.TaskSpec{},
	}
	task3 := v1alpha1.Task{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Task3",
		},
		Spec: v1alpha1.TaskSpec{},
	}

	// Add sample tasks
	_, err := r.PipelineClient.TektonV1alpha1().Tasks("ns1").Create(&task1)
	if err != nil {
		t.Logf("testtask error: %s", err)
	}
	_, err = r.PipelineClient.TektonV1alpha1().Tasks("ns1").Create(&task2)
	if err != nil {
		t.Logf("testtask error: %s", err)
	}
	_, err = r.PipelineClient.TektonV1alpha1().Tasks("ns2").Create(&task3)
	if err != nil {
		t.Logf("testtask error: %s", err)
	}

	// Test getAllTasks function
	// Sample request and response
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/task/", nil)
	req := dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	//  Test the function
	r.getAllTasks(req, resp)

	// Decode the response
	result := v1alpha1.TaskList{}
	json.NewDecoder(httpWriter.Body).Decode(&result)

	// Verify the response
	if len(result.Items) != 2 {
		t.Errorf("Number of tasks: expected: %d, returned: %d", 2, len(result.Items))
	}
	if result.Items[0].Name != "Task1" && result.Items[1].Name != "Task1" {
		t.Errorf("Task1 is not returned: %s, %s", result.Items[0].Name, result.Items[1].Name)
	}
	if result.Items[0].Name != "Task2" && result.Items[1].Name != "Task2" {
		t.Errorf("Task2 is not returned: %s, %s", result.Items[0].Name, result.Items[1].Name)
	}

	// Test getTask function
	// Sample request and response
	httpReq = dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/task/Task2", nil)
	req = dummyRestfulRequest(httpReq, "ns1", "Task2")
	httpWriter = httptest.NewRecorder()
	resp = dummyRestfulResponse(httpWriter)

	//  Test the function
	r.getTask(req, resp)

	// Decode the response
	result1 := v1alpha1.Task{}
	json.NewDecoder(httpWriter.Body).Decode(&result1)

	// Verify the response
	if result1.Name != "Task2" {
		t.Errorf("Task2 is not returned: %s", result1.Name)
	}
}

// Pipeline test
func TestPipeline(t *testing.T) {

	r := dummyResource()

	// sample pipelines
	pipeline1 := v1alpha1.Pipeline{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Pipeline1",
		},
		Spec: v1alpha1.PipelineSpec{},
	}
	pipeline2 := v1alpha1.Pipeline{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Pipeline2",
		},
		Spec: v1alpha1.PipelineSpec{},
	}
	pipeline3 := v1alpha1.Pipeline{
		ObjectMeta: metav1.ObjectMeta{
			Name: "Pipeline3",
		},
		Spec: v1alpha1.PipelineSpec{},
	}

	// Add sample pipelines
	_, err := r.PipelineClient.TektonV1alpha1().Pipelines("ns1").Create(&pipeline1)
	if err != nil {
		t.Logf("testpipeline error: %s", err)
	}
	_, err = r.PipelineClient.TektonV1alpha1().Pipelines("ns1").Create(&pipeline2)
	if err != nil {
		t.Logf("testpipeline error: %s", err)
	}
	_, err = r.PipelineClient.TektonV1alpha1().Pipelines("ns2").Create(&pipeline3)
	if err != nil {
		t.Logf("testpipeline error: %s", err)
	}

	// Test getAllPipelines function
	// Sample request and response
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipeline/", nil)
	req := dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	//  Test the function
	r.getAllPipelines(req, resp)

	// Decode the response
	result := v1alpha1.PipelineList{}
	json.NewDecoder(httpWriter.Body).Decode(&result)

	// Verify the response
	if len(result.Items) != 2 {
		t.Errorf("Number of tasks: expected: %d, returned: %d", 2, len(result.Items))
	}
	if result.Items[0].Name != "Pipeline1" && result.Items[1].Name != "Pipeline1" {
		t.Errorf("Task1 is not returned: %s, %s", result.Items[0].Name, result.Items[1].Name)
	}
	if result.Items[0].Name != "Pipeline2" && result.Items[1].Name != "Pipeline2" {
		t.Errorf("Task2 is not returned: %s, %s", result.Items[0].Name, result.Items[1].Name)
	}

	// Test getPipeline function
	// Sample request and response
	httpReq = dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipeline/Pipeline2", nil)
	req = dummyRestfulRequest(httpReq, "ns1", "Pipeline2")
	httpWriter = httptest.NewRecorder()
	resp = dummyRestfulResponse(httpWriter)

	//  Test the getPipeline function
	r.getPipeline(req, resp)

	// Decode the response
	result1 := v1alpha1.Pipeline{}
	json.NewDecoder(httpWriter.Body).Decode(&result1)

	// Verify the response
	if result1.Name != "Pipeline2" {
		t.Errorf("Pipeline2 is not returned: %s", result1.Name)
	}
}

// TaskRun test
func TestTaskRun(t *testing.T) {

	r := dummyResource()

	// sample TaskRuns
	TaskRun1 := v1alpha1.TaskRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "TaskRun1",
		},
		Spec: v1alpha1.TaskRunSpec{},
	}
	TaskRun2 := v1alpha1.TaskRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "TaskRun2",
		},
		Spec: v1alpha1.TaskRunSpec{},
	}
	TaskRun3 := v1alpha1.TaskRun{
		ObjectMeta: metav1.ObjectMeta{
			Name: "TaskRun3",
		},
		Spec: v1alpha1.TaskRunSpec{},
	}

	// Add sample TaskRuns
	_, err := r.PipelineClient.TektonV1alpha1().TaskRuns("ns1").Create(&TaskRun1)
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

	// Test getAllTaskRuns function
	// Sample request and response
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/taskrun", nil)
	req := dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	//  Test the function
	r.getAllTaskRuns(req, resp)

	// Decode the response
	result := v1alpha1.TaskRunList{}
	json.NewDecoder(httpWriter.Body).Decode(&result)

	// Verify the response
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
	// FakeClient does not support filtering by fields(metadata.name/namespace)/labels at the moment, block test
	// httpReq = dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/taskrun?name=TaskRun1", nil)
	// req = dummyRestfulRequest(httpReq, "ns1", "")
	// httpWriter = httptest.NewRecorder()
	// resp = dummyRestfulResponse(httpWriter)

	// //  Test the function
	// r.getAllTaskRuns(req, resp)

	// // Decode the response
	// result = v1alpha1.TaskRunList{}
	// json.NewDecoder(httpWriter.Body).Decode(&result)
	// // Verify the response
	// if len(result.Items) != 1 {
	// 	t.Errorf("Number of tasks: expected: %d, returned: %d", 1, len(result.Items))
	// }
	// if result.Items[0].Name != "TaskRun1" {
	// 	t.Errorf("Task1 is not returned: %s", result.Items[0].Name)
	// }

	// Test getTaskRun function
	// Sample request and response
	httpReq = dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/taskrun/TaskRun2", nil)
	req = dummyRestfulRequest(httpReq, "ns1", "TaskRun2")
	httpWriter = httptest.NewRecorder()
	resp = dummyRestfulResponse(httpWriter)

	//  Test the getTaskRun function
	r.getTaskRun(req, resp)

	// Decode the response
	result1 := v1alpha1.TaskRun{}
	json.NewDecoder(httpWriter.Body).Decode(&result1)

	// Verify the response
	if result1.Name != "TaskRun2" {
		t.Errorf("TaskRun2 is not returned: %s", result1.Name)
	}
}

// PipelineRun test
func TestPipelineRun(t *testing.T) {

	r := dummyResource()

	labels1 := make(map[string]string)
	labels1["gitServer"] = "github.com"
	labels1["gitOrg"] = "foo"
	labels1["gitRepo"] = "bar"

	labels2 := make(map[string]string)
	labels2["gitServer"] = "github.ibm.com"
	labels2["gitOrg"] = "foobar"
	labels2["gitRepo"] = "barfoo"

	// sample PipelineRuns
	PipelineRun1 := v1alpha1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name:   "PipelineRun1",
			Labels: labels1,
		},
		Spec: v1alpha1.PipelineRunSpec{},
	}
	PipelineRun2 := v1alpha1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name:   "PipelineRun2",
			Labels: labels2,
		},
		Spec: v1alpha1.PipelineRunSpec{},
	}
	PipelineRun3 := v1alpha1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name:   "PipelineRun3",
			Labels: labels1,
		},
		Spec: v1alpha1.PipelineRunSpec{},
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

	// Test getAllPipelineRuns function
	// Sample request and response
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelinerun", nil)
	req := dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	//  Test the function
	r.getAllPipelineRuns(req, resp)

	// Decode the response
	result := v1alpha1.PipelineRunList{}
	json.NewDecoder(httpWriter.Body).Decode(&result)

	// Verify the response
	if len(result.Items) != 2 {
		t.Errorf("Number of tasks: expected: %d, returned: %d", 2, len(result.Items))
	}
	if result.Items[0].Name != "PipelineRun1" && result.Items[1].Name != "PipelineRun1" {
		t.Errorf("Task1 is not returned: %s, %s", result.Items[0].Name, result.Items[1].Name)
	}
	if result.Items[0].Name != "PipelineRun2" && result.Items[1].Name != "PipelineRun2" {
		t.Errorf("Task2 is not returned: %s, %s", result.Items[0].Name, result.Items[1].Name)
	}

	// Test getAllPipelineRuns function with repository query
	// Sample request and response
	httpReq = dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelinerun?repository=http://github.com/foo/bar", nil)
	req = dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter = httptest.NewRecorder()
	resp = dummyRestfulResponse(httpWriter)

	//  Test the function
	r.getAllPipelineRuns(req, resp)

	// Decode the response
	result = v1alpha1.PipelineRunList{}
	json.NewDecoder(httpWriter.Body).Decode(&result)

	// Verify the response
	if len(result.Items) != 1 {
		t.Errorf("Number of PipelineRuns: expected: %d, returned: %d", 1, len(result.Items))
	}
	if result.Items[0].Name != "PipelineRun1" {
		t.Errorf("PipelineRun1 is not returned: %s", result.Items[0].Name)
	}

	// Test getAllPipelineRuns function with name query
	// Sample request and response
	// FakeClient does not support filtering by fields(metadata.name/namespace)/labels at the moment, block test
	// httpReq = dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelinerun?name=PipelineRun1", nil)
	// req = dummyRestfulRequest(httpReq, "ns1", "")
	// httpWriter = httptest.NewRecorder()
	// resp = dummyRestfulResponse(httpWriter)

	// //  Test the function
	// r.getAllPipelineRuns(req, resp)

	// // Decode the response
	// result = v1alpha1.PipelineRunList{}
	// json.NewDecoder(httpWriter.Body).Decode(&result)

	// // Verify the response
	// if len(result.Items) != 1 {
	// 	t.Errorf("Number of PipelineRuns: expected: %d, returned: %d", 1, len(result.Items))
	// }
	// if result.Items[0].Name != "PipelineRun1" {
	// 	t.Errorf("PipelineRun1 is not returned: %s", result.Items[0].Name)
	// }

	// Test getPipelineRun function
	// Sample request and response
	httpReq = dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelinerun/PipelineRun2", nil)
	req = dummyRestfulRequest(httpReq, "ns1", "PipelineRun2")
	httpWriter = httptest.NewRecorder()
	resp = dummyRestfulResponse(httpWriter)

	//  Test the getPipelineRun function
	r.getPipelineRun(req, resp)

	// Decode the response
	result1 := v1alpha1.PipelineRun{}
	json.NewDecoder(httpWriter.Body).Decode(&result1)

	// Verify the response
	if result1.Name != "PipelineRun2" {
		t.Errorf("PipelineRun2 is not returned: %s", result1.Name)
	}
}

// TaskRunLog test
func TestTaskRunLog(t *testing.T) {

	r := dummyResource()

	// create containers
	// Name
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

	// sample TaskRuns
	// PodName
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

	// create pods
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

	// Add sample TaskRuns
	_, err := r.PipelineClient.TektonV1alpha1().TaskRuns("ns1").Create(&TaskRun1)
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

	// Add sample Pods
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
		t.Errorf("test error: %s", err)
	}
	_, err = r.K8sClient.CoreV1().Pods("ns1").Create(&Pod4)
	if err != nil {
		t.Errorf("test error: %s", err)
	}
	// Add sample Containers

	// Test getAllPipelineRuns function
	// Sample request and response
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/taskrunlog/TaskRun1", nil)
	req := dummyRestfulRequest(httpReq, "ns1", "TaskRun1")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	//  Test the function
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

	// create containers
	// Name
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

	// sample TaskRuns
	// PodName
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
	// sample TaskRunsStatus
	// PodName
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

	// sample PipelineRuns
	// Status.TaskRuns
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

	// create pods
	// Spec.Containers, Spec.InitContainers
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

	// Add sample Pods
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
	// Add sample Containers

	// Test getAllPipelineRuns function
	// Sample request and response
	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelinerlog/PipelineRun1", nil)
	req := dummyRestfulRequest(httpReq, "ns1", "PipelineRun1")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	//  Test the function
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
	With Postman send a PUT to <your kservice domain for the github event pipeline>/v1/namespaces/<namespace>/pipelinerun/<name of pipeline run>
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
	badRequest := dummyHTTPRequest("PUT", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelinerun/PipelineRun1", badRequestBody)
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
	notFoundRequest := dummyHTTPRequest("PUT", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelinerun/IDoNotExist", notFoundBody)
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
	notFoundRequest := dummyHTTPRequest("PUT", "http://wwww.dummy.com:8383/v1/namespaces/notns1/pipelinerun/PipelineRun1", notFoundBody)
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
	goodRequest := dummyHTTPRequest("PUT", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelinerun/PipelineRun1", goodRequestBody)
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

	statusCancelRequest := dummyHTTPRequest("PUT", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelinerun/PipelineRun1", statusCancelBody)
	statusCancelRestful := dummyRestfulRequest(statusCancelRequest, "ns1", "PipelineRun1")
	resp := dummyRestfulResponse(httpWriter)
	r.updatePipelineRun(statusCancelRestful, resp)

	if resp.StatusCode() != 204 {
		t.Errorf("FAIL: should have been recognised as a 204, got %d", resp.StatusCode())
	}

	// It's already set to be cancelled, so doing it again should give us a 412 response (pre-condition failed)

	anotherCancelBody := strings.NewReader(`{"status": "PipelineRunCancelled"}`)
	duplicatedStatusSet := dummyHTTPRequest("PUT", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelinerun/PipelineRun1", anotherCancelBody)
	duplicatedStatusSetRestful := dummyRestfulRequest(duplicatedStatusSet, "ns1", "PipelineRun1")
	resp = dummyRestfulResponse(httpWriter)
	r.updatePipelineRun(duplicatedStatusSetRestful, resp)

	if resp.StatusCode() != 412 {
		t.Errorf("FAIL: should have received a http 412 code when setting the status to something already set, got %d", resp.StatusCode())
	}
}
