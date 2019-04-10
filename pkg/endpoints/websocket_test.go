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

// Counters for pipelineruns websocket test
var CreationsRecorded = 0
var UpdatesRecorded = 0
var DeletionsRecorded = 0

func TestLogWebsocket(t *testing.T) {
	T = t
	T.Log("Enter TestLogWebsocket...")

	_, s2 := setupResourceAndServer()
	defer s2.Close()

	devopsServer := strings.TrimPrefix(s2.URL, "https://")
	websocketURL := url.URL{Scheme: "wss", Host: devopsServer, Path: "/v1/websocket/logs"}
	websocketEndpoint := websocketURL.String()
	clientSize := 10
	connectionDur := time.Second * 5
	var wg sync.WaitGroup
	for i := 1; i <= clientSize; i++ {
		wg.Add(1)
		go clientWebsocket(websocketEndpoint, connectionDur, &wg, i)
	}
	T.Log("Waiting for clients to terminate...")
	wg.Wait()

	// Allow Devops websocket heart beat (every second) to detect failures/unsubscribe clients
	time.Sleep(time.Second * 2)

	// Ensure there aren't any listeners on broadcaster
	poolSize := logBroadcaster.PoolSize()
	checkTestResult("Subscribers", 0, poolSize)

	T.Log("Exit TestLogWebsocket")
}

func TestPipelineRunWebsocket(t *testing.T) {
	T = t
	T.Log("Enter TestPipelineRunWebsocket...")

	r, s2 := setupResourceAndServer()
	defer s2.Close()

	stopCh := signals.SetupSignalHandler()
	r.StartPipelineRunController(stopCh)

	devopsServer := strings.TrimPrefix(s2.URL, "https://")
	websocketURL := url.URL{Scheme: "wss", Host: devopsServer, Path: "/v1/websocket/pipelineruns"}
	websocketEndpoint := websocketURL.String()
	// Create 10 clients with a lifespan of 30 seconds (should be sufficient for test)
	clients := 10
	connectionDur := time.Second * 30
	var wg sync.WaitGroup
	for i := 1; i <= clients; i++ {
		wg.Add(1)
		go clientWebsocket(websocketEndpoint, connectionDur, &wg, i)
	}

	// Give chance for websockets to be created and check we have 10 subscribers
	time.Sleep(time.Second * 2)
	poolSize := pipelineRunsBroadcaster.PoolSize()
	checkTestResult("Subscribers", 10, poolSize)

	r.createTestPipelineRun("WebsocketPipelinerun", "123456")
	time.Sleep(time.Second * 5)
	r.updateTestPipelineRun("WebsocketPipelinerun", "654321")
	time.Sleep(time.Second * 5)
	r.deleteTestPipelineRun("WebsocketPipelinerun")
	time.Sleep(time.Second * 5)

	// Check that each subscriber received the notification of create, update, delete
	// Basic check that we have 10 of each recorded
	checkTestResult("CreationsRecorded", 10, CreationsRecorded)
	checkTestResult("UpdatesRecorded", 10, UpdatesRecorded)
	checkTestResult("DeletionsRecorded", 10, DeletionsRecorded)

	T.Log("Waiting for clients to terminate...")
	wg.Wait()

	// Allow Devops websocket heart beat (every second) to detect failures/unsubscribe clients
	time.Sleep(time.Second * 2)

	// Ensure there aren't any listeners on broadcaster
	poolSize = pipelineRunsBroadcaster.PoolSize()
	checkTestResult("Subscribers", 0, poolSize)

	T.Log("Exit TestPipelineRunWebsocket")
}

func clientWebsocket(websocketEndpoint string, readDeadline time.Duration, wg *sync.WaitGroup, identifier int) {
	defer wg.Done()
	d := gorillaSocket.Dialer{TLSClientConfig: &tls.Config{RootCAs: nil, InsecureSkipVerify: true}}

	connection, _, err := d.Dial(websocketEndpoint, nil)
	if err != nil {
		T.Fatalf("Dial error connecting to %s:, %s\n", websocketEndpoint, err)
	}

	doneChan := make(chan struct{})
	deadlineTime := time.Now().Add(readDeadline)
	connection.SetReadDeadline(deadlineTime)

	go func() {
		defer websocket.ReportClosing(connection)
		defer close(doneChan)
		for {
			messageType, message, err := connection.ReadMessage()
			if err != nil {
				// Case from closing connection
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
				case "PipelineRunCreated":
					CreationsRecorded++
				case "PipelineRunUpdated":
					UpdatesRecorded++
				case "PipelineRunDeleted":
					DeletionsRecorded++
				}
				//Print out websocket data received
				fmt.Printf("%v\n", resp)
			}
		}
	}()
	<-doneChan
	if time.Now().Sub(deadlineTime) < 0 {
		fmt.Printf("Websocket[%d] terminated early", identifier)
		T.Errorf("Websocket[%d] terminated early", identifier)
	}
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

	fmt.Println("Creating pipelinerun")
	_, err := r.PipelineClient.TektonV1alpha1().PipelineRuns("ns1").Create(&PipelineRun1)
	if err != nil {
		fmt.Printf("Error creating pipelinerun: %s: %s\n", name, err.Error())
	}
}

// Util to update pipelinerun
func (r Resource) updateTestPipelineRun(name, newResourceVersion string) {

	httpReq := dummyHttpRequest("GET", "http://wwww.dummy.com:8383/v1/namespaces/ns1/pipelinerun/"+name, nil)
	req := dummyRestfulRequest(httpReq, "ns1", "")
	httpWriter := httptest.NewRecorder()
	resp := dummyRestfulResponse(httpWriter)

	//  Test the function
	r.getPipelineRun(req, resp)

	// Decode the response
	pipelinerun := v1alpha1.PipelineRun{}
	json.NewDecoder(httpWriter.Body).Decode(&pipelinerun)
	pipelinerun.SetResourceVersion(newResourceVersion)

	fmt.Printf("Updating pipelinerun %s\n", name)
	_, err := r.PipelineClient.TektonV1alpha1().PipelineRuns("ns1").Update(&pipelinerun)
	if err != nil {
		fmt.Printf("Error updating pipelinerun: %s: %s\n", name, err.Error())
	}
}

// Util to delete pipelinerun
func (r Resource) deleteTestPipelineRun(name string) {
	fmt.Printf("Deleting pipelinerun: %s\n", name)
	_ = r.PipelineClient.TektonV1alpha1().PipelineRuns("ns1").Delete(name, &metav1.DeleteOptions{})
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
		fmt.Printf("%s not equal to %d, recorded only %d", variable, expectedValue, actualValue)
		T.Errorf("%s not equal to %d, recorded only %d", variable, expectedValue, actualValue)
		T.FailNow()
	}
}
