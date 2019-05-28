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

// Counters for pipelineruns websocket test
// Incremented atomically
var CreationsRecorded int32
var UpdatesRecorded int32
var DeletionsRecorded int32

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

func TestPipelineRunWebsocket(t *testing.T) {
	T = t
	T.Log("Enter TestPipelineRunWebsocket...")

	r, s2 := setupResourceAndServer()
	defer s2.Close()

	stopCh := signals.SetupSignalHandler()
	r.StartPipelineRunController(stopCh)

	devopsServer := strings.TrimPrefix(s2.URL, "https://")
	websocketURL := url.URL{Scheme: "wss", Host: devopsServer, Path: "/v1/websockets/pipelineruns"}
	websocketEndpoint := websocketURL.String()
	const clients int = 10
	connectionDur := time.Second * 1
	var wg sync.WaitGroup
	for i := 1; i <= clients; i++ {
		wg.Add(1)
		go clientWebsocket(websocketEndpoint, connectionDur, &wg, i)
	}

	// Wait until all broadcaster has registered all clients
	awaitFatal(func() bool { return pipelineRunsBroadcaster.PoolSize() == clients },
		fmt.Sprintf("Expected %d clients within pool before creating PipelineRuns", clients))

	// Create pipeline and wait until clients receive
	r.createTestPipelineRun("WebsocketPipelinerun", "123456")
	awaitFatal(func() bool { return atomic.LoadInt32(&CreationsRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d CreationsRecorded", clients))

	// Update pipeline and wait until clients receive
	r.updateTestPipelineRun("WebsocketPipelinerun", "654321")
	awaitFatal(func() bool { return atomic.LoadInt32(&UpdatesRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d UpdatesRecorded", clients))

	// Delete pipeline and wait until clients receive
	r.deleteTestPipelineRun("WebsocketPipelinerun")
	awaitFatal(func() bool { return atomic.LoadInt32(&DeletionsRecorded) == int32(clients) },
		fmt.Sprintf("Expected %d DeletionsRecorded", clients))

	T.Log("Waiting for clients to terminate...")
	wg.Wait()

	awaitFatal(func() bool { return pipelineRunsBroadcaster.PoolSize() == 0 },
		"pipelineRunsBroadcaster pool should be empty")

	T.Log("Exit TestPipelineRunWebsocket")
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
				case broadcaster.PipelineRunCreated:
					atomic.AddInt32(&CreationsRecorded, 1)
				case broadcaster.PipelineRunUpdated:
					atomic.AddInt32(&UpdatesRecorded, 1)
				case broadcaster.PipelineRunDeleted:
					atomic.AddInt32(&DeletionsRecorded, 1)
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
