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
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http/httptest"
	"net/url"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	restful "github.com/emicklei/go-restful"
	gorillaSocket "github.com/gorilla/websocket"
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/websocket"
	v1alpha1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/sample-controller/pkg/signals"
)

// Make logger global
var T *testing.T

// Counters for runs websocket test
// Incremented atomically
var PipelineCreationsRecorded int32
var PipelineUpdatesRecorded int32
var PipelineDeletionsRecorded int32
var TaskCreationsRecorded int32
var TaskUpdatesRecorded int32
var TaskDeletionsRecorded int32
var PipelineRunCreationsRecorded int32
var PipelineRunUpdatesRecorded int32
var PipelineRunDeletionsRecorded int32
var TaskRunCreationsRecorded int32
var TaskRunUpdatesRecorded int32
var TaskRunDeletionsRecorded int32

// No data is sent through the log websocket
// Assert connection flow
func TestLogWebsocket(t *testing.T) {
	T = t
	T.Log("Enter TestLogWebsocket...")

	_, s2 := setupResourceAndServer()
	defer s2.Close()

	devopsServer := strings.TrimPrefix(s2.URL, "https://")
	websocketURL := url.URL{Scheme: "wss", Host: devopsServer, Path: "/v1/websockets/logs"}
	websocketEndpoint := websocketURL.String()
	const clients int = 10
	connectionDur := time.Second * 1
	var wg sync.WaitGroup
	for i := 1; i <= clients; i++ {
		wg.Add(1)
		go clientWebsocket(websocketEndpoint, connectionDur, &wg, i)
	}
	T.Log("Waiting for clients to terminate...")
	wg.Wait()
	awaitFatal(func() bool { return logBroadcaster.PoolSize() == 0 }, "logbroadcaster pool should be empty")
	T.Log("Exit TestLogWebsocket")
}

func TestRunWebsocket(t *testing.T) {
	T = t
	T.Log("Enter TestRunWebsocket...")

	r, s2 := setupResourceAndServer()
	defer s2.Close()

	stopCh := signals.SetupSignalHandler()
	r.StartResourcesController(stopCh)

	devopsServer := strings.TrimPrefix(s2.URL, "https://")
	websocketURL := url.URL{Scheme: "wss", Host: devopsServer, Path: "/v1/websockets/resources"}
	websocketEndpoint := websocketURL.String()
	const clients int = 5
	connectionDur := time.Second * 5
	var wg sync.WaitGroup
	for i := 1; i <= clients; i++ {
		wg.Add(1)
		go clientWebsocket(websocketEndpoint, connectionDur, &wg, i)
	}

	// Wait until all broadcaster has registered all clients
	awaitFatal(func() bool { return resourcesBroadcaster.PoolSize() == clients },
		fmt.Sprintf("Expected %d clients within pool before creating Runs", clients))

	// Pipeline
	// Create pipeline and wait until clients receive
	r.createTestPipeline("WebsocketPipeline", "12")
	awaitFatal(func() bool { return atomic.LoadInt32(&PipelineCreationsRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d CreationsRecorded for Pipelines", clients))

	// Update pipeline and wait until clients receive
	r.updateTestPipeline("WebsocketPipeline", "65")
	awaitFatal(func() bool { return atomic.LoadInt32(&PipelineUpdatesRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d UpdatesRecorded for Pipelines", clients))

	// Delete pipeline and wait until clients receive
	r.deleteTestPipeline("WebsocketPipeline")
	awaitFatal(func() bool { return atomic.LoadInt32(&PipelineDeletionsRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d DeletionsRecorded for Pipelines", clients))

	// Tasks
	// Create task and wait until clients receive
	r.createTestTask("WebsocketTask", "123")
	awaitFatal(func() bool { return atomic.LoadInt32(&TaskCreationsRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d CreationsRecorded for Tasks", clients))

	// Update taskrun and wait until clients receive
	r.updateTestTask("WebsocketTask", "654")
	awaitFatal(func() bool { return atomic.LoadInt32(&TaskUpdatesRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d UpdatesRecorded for Tasks", clients))

	// Delete taskrun and wait until clients receive
	r.deleteTestTask("WebsocketTask")
	awaitFatal(func() bool { return atomic.LoadInt32(&TaskDeletionsRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d DeletionsRecorded for Tasks", clients))

	// PipelineRuns
	// Create pipeline and wait until clients receive
	r.createTestPipelineRun("WebsocketPipelinerun", "1234")
	awaitFatal(func() bool { return atomic.LoadInt32(&PipelineRunCreationsRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d CreationsRecorded for PipelineRuns", clients))

	// Update pipeline and wait until clients receive
	r.updateTestPipelineRun("WebsocketPipelinerun", "6543")
	awaitFatal(func() bool { return atomic.LoadInt32(&PipelineRunUpdatesRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d UpdatesRecorded for PipelineRuns", clients))

	// Delete pipeline and wait until clients receive
	r.deleteTestPipelineRun("WebsocketPipelinerun")
	awaitFatal(func() bool { return atomic.LoadInt32(&PipelineRunDeletionsRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d DeletionsRecorded for PipelineRuns", clients))

	// TaskRuns
	// Create task and wait until clients receive
	r.createTestTaskRun("WebsocketTaskrun", "12345")
	awaitFatal(func() bool { return atomic.LoadInt32(&TaskRunCreationsRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d CreationsRecorded for TaskRuns", clients))

	// Update taskrun and wait until clients receive
	r.updateTestTaskRun("WebsocketTaskrun", "65432")
	awaitFatal(func() bool { return atomic.LoadInt32(&TaskRunUpdatesRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d UpdatesRecorded for TaskRuns", clients))

	// Delete taskrun and wait until clients receive
	r.deleteTestTaskRun("WebsocketTaskrun")
	awaitFatal(func() bool { return atomic.LoadInt32(&TaskRunDeletionsRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d DeletionsRecorded for TaskRuns", clients))

	T.Log("Waiting for clients to terminate...")
	wg.Wait()

	awaitFatal(func() bool { return resourcesBroadcaster.PoolSize() == 0 },
		"runsBroadcaster pool should be empty")

	T.Log("Exit ResourcesRunWebsocket")
}

func clientWebsocket(websocketEndpoint string, readDeadline time.Duration, wg *sync.WaitGroup, identifier int) {
	d := gorillaSocket.Dialer{TLSClientConfig: &tls.Config{RootCAs: nil, InsecureSkipVerify: true}}
	connection, _, err := d.Dial(websocketEndpoint, nil)
	if err != nil {
		T.Fatalf("Dial error connecting to %s:, %s\n", websocketEndpoint, err)
	}
	doneChan := make(chan struct{})
	deadlineTime := time.Now().Add(readDeadline)
	connection.SetReadDeadline(deadlineTime)
	go func() {
		defer close(doneChan)
		defer websocket.ReportClosing(connection)
		for {
			messageType, message, err := connection.ReadMessage()
			if err != nil {
				if !strings.Contains(err.Error(), "i/o timeout") {
					T.Error("Read error:", err)
				}
				return
			}
			if messageType == gorillaSocket.TextMessage {
				var resp broadcaster.SocketData
				if err := json.Unmarshal(message, &resp); err != nil {
					T.Error("Client Unmarshal error:", err)
					return
				}
				switch resp.MessageType {
				case broadcaster.PipelineCreated:
					atomic.AddInt32(&PipelineCreationsRecorded, 1)
				case broadcaster.PipelineUpdated:
					atomic.AddInt32(&PipelineUpdatesRecorded, 1)
				case broadcaster.PipelineDeleted:
					atomic.AddInt32(&PipelineDeletionsRecorded, 1)
				case broadcaster.TaskCreated:
					atomic.AddInt32(&TaskCreationsRecorded, 1)
				case broadcaster.TaskUpdated:
					atomic.AddInt32(&TaskUpdatesRecorded, 1)
				case broadcaster.TaskDeleted:
					atomic.AddInt32(&TaskDeletionsRecorded, 1)
				case broadcaster.PipelineRunCreated:
					atomic.AddInt32(&PipelineRunCreationsRecorded, 1)
				case broadcaster.PipelineRunUpdated:
					atomic.AddInt32(&PipelineRunUpdatesRecorded, 1)
				case broadcaster.PipelineRunDeleted:
					atomic.AddInt32(&PipelineRunDeletionsRecorded, 1)
				case broadcaster.TaskRunCreated:
					atomic.AddInt32(&TaskRunCreationsRecorded, 1)
				case broadcaster.TaskRunUpdated:
					atomic.AddInt32(&TaskRunUpdatesRecorded, 1)
				case broadcaster.TaskRunDeleted:
					atomic.AddInt32(&TaskRunDeletionsRecorded, 1)

				}
				//Print out websocket data received
				T.Logf("%v\n", resp)
			}
		}
	}()
	<-doneChan
	if time.Now().Sub(deadlineTime) < 0 {
		T.Errorf("Websocket[%d] terminated early\n", identifier)
	}
	wg.Done()
}

// Util to create pipelinerun
func (r Resource) createTestPipeline(name, resourceVersion string) {

	Pipeline1 := v1alpha1.Pipeline{
		ObjectMeta: metav1.ObjectMeta{
			Name:            name,
			ResourceVersion: resourceVersion,
		},
	}

	T.Log("Creating pipeline")
	_, err := r.PipelineClient.TektonV1alpha1().Pipelines("ns1").Create(&Pipeline1)
	if err != nil {
		T.Logf("Error creating pipeline: %s: %s\n", name, err.Error())
	}
}

// Util to update pipelinerun
func (r Resource) updateTestPipeline(name, newResourceVersion string) {

	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelines/"+name, nil)
	req := dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	//  Test the function
	r.getPipeline(req, resp)

	// Decode the response
	pipeline := v1alpha1.Pipeline{}
	json.NewDecoder(httpWriter.Body).Decode(&pipeline)
	pipeline.SetResourceVersion(newResourceVersion)

	T.Logf("Updating pipeline %s\n", name)
	_, err := r.PipelineClient.TektonV1alpha1().Pipelines("ns1").Update(&pipeline)
	if err != nil {
		T.Logf("Error updating pipeline: %s: %s\n", name, err.Error())
	}
}

// Util to delete pipelinerun
func (r Resource) deleteTestPipeline(name string) {
	T.Logf("Deleting pipeline: %s\n", name)
	_ = r.PipelineClient.TektonV1alpha1().Pipelines("ns1").Delete(name, &metav1.DeleteOptions{})
}


// Util to create taskrun
func (r Resource) createTestTask(name, resourceVersion string) {

	Task1 := v1alpha1.Task{
		ObjectMeta: metav1.ObjectMeta{
			Name:            name,
			ResourceVersion: resourceVersion,
		},
	}

	T.Log("Creating task")
	_, err := r.PipelineClient.TektonV1alpha1().Tasks("ns1").Create(&Task1)
	if err != nil {
		T.Logf("Error creating task: %s: %s\n", name, err.Error())
	}
}

// Util to update taskrun
func (r Resource) updateTestTask(name, newResourceVersion string) {

	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/task/"+name, nil)
	req := dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	//  Test the function
	r.getTask(req, resp)

	// Decode the response
	task := v1alpha1.Task{}
	json.NewDecoder(httpWriter.Body).Decode(&task)
	task.SetResourceVersion(newResourceVersion)

	T.Logf("Updating task %s\n", name)
	_, err := r.PipelineClient.TektonV1alpha1().Tasks("ns1").Update(&task)
	if err != nil {
		T.Logf("Error updating task: %s: %s\n", name, err.Error())
	}
}

// Util to delete taskrun
func (r Resource) deleteTestTask(name string) {
	T.Logf("Deleting task: %s\n", name)
	_ = r.PipelineClient.TektonV1alpha1().Tasks("ns1").Delete(name, &metav1.DeleteOptions{})
}

// Util to create pipelinerun
func (r Resource) createTestPipelineRun(name, resourceVersion string) {

	PipelineRun1 := v1alpha1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name:            name,
			ResourceVersion: resourceVersion,
		},
		Spec: v1alpha1.PipelineRunSpec{},
	}

	T.Log("Creating pipelinerun")
	_, err := r.PipelineClient.TektonV1alpha1().PipelineRuns("ns1").Create(&PipelineRun1)
	if err != nil {
		T.Logf("Error creating pipelinerun: %s: %s\n", name, err.Error())
	}
}

// Util to update pipelinerun
func (r Resource) updateTestPipelineRun(name, newResourceVersion string) {

	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelineruns/"+name, nil)
	req := dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	//  Test the function
	r.getPipelineRun(req, resp)

	// Decode the response
	pipelinerun := v1alpha1.PipelineRun{}
	json.NewDecoder(httpWriter.Body).Decode(&pipelinerun)
	pipelinerun.SetResourceVersion(newResourceVersion)

	T.Logf("Updating pipelinerun %s\n", name)
	_, err := r.PipelineClient.TektonV1alpha1().PipelineRuns("ns1").Update(&pipelinerun)
	if err != nil {
		T.Logf("Error updating pipelinerun: %s: %s\n", name, err.Error())
	}
}

// Util to delete pipelinerun
func (r Resource) deleteTestPipelineRun(name string) {
	T.Logf("Deleting pipelinerun: %s\n", name)
	_ = r.PipelineClient.TektonV1alpha1().PipelineRuns("ns1").Delete(name, &metav1.DeleteOptions{})
}

// Util to create taskrun
func (r Resource) createTestTaskRun(name, resourceVersion string) {

	TaskRun1 := v1alpha1.TaskRun{
		ObjectMeta: metav1.ObjectMeta{
			Name:            name,
			ResourceVersion: resourceVersion,
		},
		Spec: v1alpha1.TaskRunSpec{},
	}

	T.Log("Creating taskrun")
	_, err := r.PipelineClient.TektonV1alpha1().TaskRuns("ns1").Create(&TaskRun1)
	if err != nil {
		T.Logf("Error creating taskrun: %s: %s\n", name, err.Error())
	}
}

// Util to update taskrun
func (r Resource) updateTestTaskRun(name, newResourceVersion string) {

	httpReq := dummyHTTPRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/taskruns/"+name, nil)
	req := dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	//  Test the function
	r.getTaskRun(req, resp)

	// Decode the response
	taskrun := v1alpha1.TaskRun{}
	json.NewDecoder(httpWriter.Body).Decode(&taskrun)
	taskrun.SetResourceVersion(newResourceVersion)

	T.Logf("Updating taskrun %s\n", name)
	_, err := r.PipelineClient.TektonV1alpha1().TaskRuns("ns1").Update(&taskrun)
	if err != nil {
		T.Logf("Error updating taskrun: %s: %s\n", name, err.Error())
	}
}

// Util to delete taskrun
func (r Resource) deleteTestTaskRun(name string) {
	T.Logf("Deleting taskrun: %s\n", name)
	_ = r.PipelineClient.TektonV1alpha1().TaskRuns("ns1").Delete(name, &metav1.DeleteOptions{})
}

// Util to setup dummy resource and TLSServer
func setupResourceAndServer() (*Resource, *httptest.Server) {

	r := dummyResource()
	devopsContainer := restful.NewContainer()
	r.RegisterWebsocket(devopsContainer)
	s2 := httptest.NewTLSServer(devopsContainer)

	return r, s2
}

// Util to check result
func checkTestResult(variable string, expectedValue, actualValue int) {
	if actualValue != expectedValue {
		T.Errorf("%s not equal to %d, recorded only %d", variable, expectedValue, actualValue)
		T.FailNow()
	}
}

// Checks condition until true
// Use when there is no resource to wait on
func awaitFatal(checkFunction func() bool, message string) {
	fatalTimeout := time.Now().Add(time.Second * 5)
	for {
		if checkFunction() {
			return
		}
		if time.Now().After(fatalTimeout) {
			if message == "" {
				message = "Fatal timeout reached"
			}
			T.Fatal(message)
		}
	}
}
