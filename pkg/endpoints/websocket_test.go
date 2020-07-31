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
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/url"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"strconv"

	gorillaSocket "github.com/gorilla/websocket"
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	. "github.com/tektoncd/dashboard/pkg/endpoints"
	"github.com/tektoncd/dashboard/pkg/router"
	"github.com/tektoncd/dashboard/pkg/testutils"
	"github.com/tektoncd/dashboard/pkg/websocket"
	v1alpha1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1alpha1"
	v1beta1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1beta1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
)

type informerRecord struct {
	CRD string
	// do not access directly
	create int32
	// do not access directly
	update int32
	// do not access directly
	delete int32
}

func NewInformerRecord(kind string, updatable bool) informerRecord {
	newRecord := informerRecord{
		CRD: kind,
	}
	// Identify non-upgradable records
	if !updatable {
		newRecord.update = -1
	}
	return newRecord
}

func (i *informerRecord) Handle(event string) {
	switch event {
	case "Created":
		atomic.AddInt32(&i.create, 1)
	case "Updated":
		atomic.AddInt32(&i.update, 1)
	case "Deleted":
		atomic.AddInt32(&i.delete, 1)
	}
}

func (i *informerRecord) Create() int32 {
	return atomic.LoadInt32(&i.create)
}

func (i *informerRecord) Update() int32 {
	return atomic.LoadInt32(&i.update)
}

func (i *informerRecord) Delete() int32 {
	return atomic.LoadInt32(&i.delete)
}

// Ensures all resource types sent over websocket are received as intended
func TestWebsocketResources(t *testing.T) {
	t.Log("Enter TestLogWebsocket...")
	server, r, installNamespace := testutils.DummyServer()
	defer server.Close()

	devopsServer := strings.TrimPrefix(server.URL, "http://")
	websocketURL := url.URL{Scheme: "ws", Host: devopsServer, Path: "/v1/websockets/resources"}
	websocketEndpoint := websocketURL.String()
	const clients int = 5
	connectionDur := time.Second * 5
	var wg sync.WaitGroup

	// Remove event suffixes
	getKind := func(event string) string {
		event = strings.TrimSuffix(event, "Created")
		event = strings.TrimSuffix(event, "Updated")
		event = strings.TrimSuffix(event, "Deleted")
		return event
	}
	// CUD records
	pipelineResourceRecord := NewInformerRecord(getKind(string(broadcaster.PipelineResourceCreated)), true)
	pipelineRecord := NewInformerRecord(getKind(string(broadcaster.PipelineCreated)), true)
	pipelineRunRecord := NewInformerRecord(getKind(string(broadcaster.PipelineRunCreated)), true)
	taskRecord := NewInformerRecord(getKind(string(broadcaster.TaskCreated)), true)
	clusterTaskRecord := NewInformerRecord(getKind(string(broadcaster.ClusterTaskCreated)), true)
	taskRunRecord := NewInformerRecord(getKind(string(broadcaster.TaskRunCreated)), true)
	extensionRecord := NewInformerRecord(getKind(string(broadcaster.ServiceExtensionCreated)), true)
	secretRecord := NewInformerRecord(getKind(string(broadcaster.SecretCreated)), true)
	// CD records
	namespaceRecord := NewInformerRecord(getKind(string(broadcaster.NamespaceCreated)), false)

	// Route incoming socket data to correct informer
	recordMap := map[string]*informerRecord{
		pipelineResourceRecord.CRD: &pipelineResourceRecord,
		pipelineRecord.CRD:         &pipelineRecord,
		pipelineRunRecord.CRD:      &pipelineRunRecord,
		taskRecord.CRD:             &taskRecord,
		clusterTaskRecord.CRD:      &clusterTaskRecord,
		taskRunRecord.CRD:          &taskRunRecord,
		namespaceRecord.CRD:        &namespaceRecord,
		extensionRecord.CRD:        &extensionRecord,
		secretRecord.CRD:           &secretRecord,
	}

	for i := 1; i <= clients; i++ {
		websocketChan := clientWebsocket(websocketEndpoint, connectionDur, t)
		// Wait until connection timeout
		go func() {
			defer wg.Done()
			for {
				socketData, open := <-websocketChan
				if !open {
					return
				}
				// Get CRD kind key to grab the correct informerRecord
				messageType := getKind(string(socketData.MessageType))
				informerRecord := recordMap[messageType]
				// Get event type to update proper informerRecord field
				eventType := strings.TrimPrefix(string(socketData.MessageType), messageType)
				informerRecord.Handle(eventType)
			}
		}()
		wg.Add(1)
	}
	awaitAllClients := func() bool {
		return ResourcesBroadcaster.PoolSize() == clients
	}
	// Wait until all broadcaster has registered all clients
	awaitFatal(awaitAllClients, t, fmt.Sprintf("Expected %d clients within pool", clients))

	// CUD/CD methods should create a single informer event for each type (Create|Update|Delete)
	// Create, Update, and Delete records
	CUDPipelineResources(r, t, installNamespace)
	CUDPipelines(r, t, installNamespace)
	CUDPipelineRuns(r, t, installNamespace)
	CUDTasks(r, t, installNamespace)
	CUDClusterTasks(r, t)
	CUDTaskRuns(r, t, installNamespace)
	CUDSecrets(r, t, installNamespace)
	CUDExtensions(r, t, installNamespace)
	// Create and Delete records
	CDNamespaces(r, t)
	// Wait until connections terminate and all subscribers have been removed from pool
	// This is our synchronization point to compare against each informerRecord
	t.Log("Waiting for clients to terminate...")
	wg.Wait()
	awaitNoClients := func() bool {
		return ResourcesBroadcaster.PoolSize() == 0
	}
	awaitFatal(awaitNoClients, t, "Pool should be empty")

	// Check that all fields have been populated
	for _, informerRecord := range recordMap {
		t.Log(informerRecord)
		creates := int(informerRecord.Create())
		updates := int(informerRecord.Update())
		deletes := int(informerRecord.Delete())
		// records without an update hook/informer
		if updates == -1 {
			if creates != clients || creates != deletes {
				t.Fatalf("CD informer %s creates[%d] and deletes[%d] not equal expected to value: %d\n", informerRecord.CRD, creates, deletes, clients)
			}
		} else {
			if creates != clients || creates != deletes || creates != updates {
				t.Fatalf("CUD informer %s creates[%d], updates[%d] and deletes[%d] not equal to expected value: %d\n", informerRecord.CRD, creates, updates, deletes, clients)
			}
		}
	}
}

// Abstract connection into a channel of broadcaster.SocketData
// Closed channel = closed connection
func clientWebsocket(websocketEndpoint string, readDeadline time.Duration, t *testing.T) <-chan broadcaster.SocketData {
	d := gorillaSocket.Dialer{TLSClientConfig: &tls.Config{RootCAs: nil, InsecureSkipVerify: true}}
	connection, _, err := d.Dial(websocketEndpoint, nil)
	if err != nil {
		t.Fatalf("Dial error connecting to %s:, %s\n", websocketEndpoint, err)
	}
	deadlineTime := time.Now().Add(readDeadline)
	connection.SetReadDeadline(deadlineTime)
	clientChan := make(chan broadcaster.SocketData)
	go func() {
		defer close(clientChan)
		defer websocket.ReportClosing(connection)
		for {
			messageType, message, err := connection.ReadMessage()
			if err != nil {
				if !strings.Contains(err.Error(), "i/o timeout") {
					t.Error("Read error:", err)
				}
				return
			}
			if messageType == gorillaSocket.TextMessage {
				var resp broadcaster.SocketData
				if err := json.Unmarshal(message, &resp); err != nil {
					t.Error("Client Unmarshal error:", err)
					return
				}
				clientChan <- resp
				// Print out websocket data received
				t.Logf("%v\n", resp)
			}
		}
	}()
	return clientChan
}

// Checks condition until true
// Use when there is no resource to wait on
// Must be on goroutine running test function: https://golang.org/pkg/testing/#T
func awaitFatal(checkFunction func() bool, t *testing.T, message string) {
	fatalTimeout := time.Now().Add(time.Second * 5)
	for {
		if checkFunction() {
			return
		}
		if time.Now().After(fatalTimeout) {
			if message == "" {
				message = "Fatal timeout reached"
			}
			t.Fatal(message)
		}
	}
}

// CUD functions

func CUDPipelineResources(r *Resource, t *testing.T, namespace string) {
	resourceVersion := "1"

	pipelineResource := v1alpha1.PipelineResource{
		ObjectMeta: metav1.ObjectMeta{
			Name:            "pipelineResource",
			ResourceVersion: resourceVersion,
		},
	}

	t.Log("Creating pipelineresource")
	_, err := r.PipelineResourceClient.TektonV1alpha1().PipelineResources(namespace).Create(&pipelineResource)
	if err != nil {
		t.Fatalf("Error creating pipelineresource: %s: %s\n", pipelineResource.Name, err.Error())
	}

	newVersion := "2"
	pipelineResource.ResourceVersion = newVersion
	t.Log("Updating pipelineresource")
	_, err = r.PipelineResourceClient.TektonV1alpha1().PipelineResources(namespace).Update(&pipelineResource)
	if err != nil {
		t.Fatalf("Error updating pipelineresource: %s: %s\n", pipelineResource.Name, err.Error())
	}

	t.Log("Deleting pipelineresource")
	err = r.PipelineResourceClient.TektonV1alpha1().PipelineResources(namespace).Delete(pipelineResource.Name, &metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("Error deleting pipelineresource: %s: %s\n", pipelineResource.Name, err.Error())
	}
}

func CUDPipelines(r *Resource, t *testing.T, namespace string) {
	resourceVersion := "1"

	pipeline := v1beta1.Pipeline{
		ObjectMeta: metav1.ObjectMeta{
			Name:            "pipeline",
			ResourceVersion: resourceVersion,
		},
	}

	t.Log("Creating pipeline")
	_, err := r.PipelineClient.TektonV1beta1().Pipelines(namespace).Create(&pipeline)
	if err != nil {
		t.Fatalf("Error creating pipeline: %s: %s\n", pipeline.Name, err.Error())
	}

	newVersion := "2"
	pipeline.ResourceVersion = newVersion
	t.Log("Updating pipeline")
	_, err = r.PipelineClient.TektonV1beta1().Pipelines(namespace).Update(&pipeline)
	if err != nil {
		t.Fatalf("Error updating pipeline: %s: %s\n", pipeline.Name, err.Error())
	}

	t.Log("Deleting pipeline")
	err = r.PipelineClient.TektonV1beta1().Pipelines(namespace).Delete(pipeline.Name, &metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("Error deleting pipeline: %s: %s\n", pipeline.Name, err.Error())
	}
}

func CUDPipelineRuns(r *Resource, t *testing.T, namespace string) {
	resourceVersion := "1"

	pipelineRun := v1beta1.PipelineRun{
		ObjectMeta: metav1.ObjectMeta{
			Name:            "pipelineRun",
			ResourceVersion: resourceVersion,
		},
	}

	t.Log("Creating pipelineRun")
	_, err := r.PipelineClient.TektonV1beta1().PipelineRuns(namespace).Create(&pipelineRun)
	if err != nil {
		t.Fatalf("Error creating pipelineRun: %s: %s\n", pipelineRun.Name, err.Error())
	}

	newVersion := "2"
	pipelineRun.ResourceVersion = newVersion
	t.Log("Updating pipelineRun")
	_, err = r.PipelineClient.TektonV1beta1().PipelineRuns(namespace).Update(&pipelineRun)
	if err != nil {
		t.Fatalf("Error updating pipelineRun: %s: %s\n", pipelineRun.Name, err.Error())
	}

	t.Log("Deleting pipelineRun")
	err = r.PipelineClient.TektonV1beta1().PipelineRuns(namespace).Delete(pipelineRun.Name, &metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("Error deleting pipelineRun: %s: %s\n", pipelineRun.Name, err.Error())
	}
}

func CUDTasks(r *Resource, t *testing.T, namespace string) {
	resourceVersion := "1"

	task := v1beta1.Task{
		ObjectMeta: metav1.ObjectMeta{
			Name:            "task",
			ResourceVersion: resourceVersion,
		},
	}

	t.Log("Creating task")
	_, err := r.PipelineClient.TektonV1beta1().Tasks(namespace).Create(&task)
	if err != nil {
		t.Fatalf("Error creating task: %s: %s\n", task.Name, err.Error())
	}

	newVersion := "2"
	task.ResourceVersion = newVersion
	t.Log("Updating task")
	_, err = r.PipelineClient.TektonV1beta1().Tasks(namespace).Update(&task)
	if err != nil {
		t.Fatalf("Error updating task: %s: %s\n", task.Name, err.Error())
	}

	t.Log("Deleting task")
	err = r.PipelineClient.TektonV1beta1().Tasks(namespace).Delete(task.Name, &metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("Error deleting task: %s: %s\n", task.Name, err.Error())
	}
}

func CUDClusterTasks(r *Resource, t *testing.T) {
	resourceVersion := "1"

	clusterTask := v1beta1.ClusterTask{
		ObjectMeta: metav1.ObjectMeta{
			Name:            "clusterTask",
			ResourceVersion: resourceVersion,
		},
	}

	t.Log("Creating clusterTask")
	_, err := r.PipelineClient.TektonV1beta1().ClusterTasks().Create(&clusterTask)
	if err != nil {
		t.Fatalf("Error creating clusterTask: %s: %s\n", clusterTask.Name, err.Error())
	}

	newVersion := "2"
	clusterTask.ResourceVersion = newVersion
	t.Log("Updating clusterTask")
	_, err = r.PipelineClient.TektonV1beta1().ClusterTasks().Update(&clusterTask)
	if err != nil {
		t.Fatalf("Error updating clusterTask: %s: %s\n", clusterTask.Name, err.Error())
	}

	t.Log("Deleting clusterTask")
	err = r.PipelineClient.TektonV1beta1().ClusterTasks().Delete(clusterTask.Name, &metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("Error deleting clusterTask: %s: %s\n", clusterTask.Name, err.Error())
	}
}

func CUDTaskRuns(r *Resource, t *testing.T, namespace string) {
	resourceVersion := "1"

	taskRun := v1beta1.TaskRun{
		ObjectMeta: metav1.ObjectMeta{
			Name:            "taskRun",
			ResourceVersion: resourceVersion,
		},
	}

	t.Log("Creating taskRun")
	_, err := r.PipelineClient.TektonV1beta1().TaskRuns(namespace).Create(&taskRun)
	if err != nil {
		t.Fatalf("Error creating taskRun: %s: %s\n", taskRun.Name, err.Error())
	}

	newVersion := "2"
	taskRun.ResourceVersion = newVersion
	t.Log("Updating taskRun")
	_, err = r.PipelineClient.TektonV1beta1().TaskRuns(namespace).Update(&taskRun)
	if err != nil {
		t.Fatalf("Error updating taskRun: %s: %s\n", taskRun.Name, err.Error())
	}

	t.Log("Deleting taskRun")
	err = r.PipelineClient.TektonV1beta1().TaskRuns(namespace).Delete(taskRun.Name, &metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("Error deleting taskRun: %s: %s\n", taskRun.Name, err.Error())
	}
}

func CUDExtensions(r *Resource, t *testing.T, namespace string) {
	resourceVersion := "1"

	extensionService := corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:            "extension",
			ResourceVersion: resourceVersion,
			UID:             types.UID(strconv.FormatInt(time.Now().UnixNano(), 10)),
			Labels: map[string]string{
				router.ExtensionLabelKey: router.ExtensionLabelValue,
			},
		},
		Spec: corev1.ServiceSpec{
			ClusterIP: "127.0.0.1",
			Ports: []corev1.ServicePort{
				{
					Port: int32(1234),
				},
			},
		},
	}

	t.Log("Creating extensionService")
	_, err := r.K8sClient.CoreV1().Services(namespace).Create(&extensionService)
	if err != nil {
		t.Fatalf("Error creating extensionService: %s: %s\n", extensionService.Name, err.Error())
	}

	newVersion := "2"
	extensionService.ResourceVersion = newVersion
	t.Log("Updating extensionService")
	_, err = r.K8sClient.CoreV1().Services(namespace).Update(&extensionService)
	if err != nil {
		t.Fatalf("Error updating extensionService: %s: %s\n", extensionService.Name, err.Error())
	}

	t.Log("Deleting extensionService")
	err = r.K8sClient.CoreV1().Services(namespace).Delete(extensionService.Name, &metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("Error deleting extensionService: %s: %s\n", extensionService.Name, err.Error())
	}
}

func CUDSecrets(r *Resource, t *testing.T, namespace string) {
	resourceVersion := "1"

	secret := corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{
			Name:            "secret",
			ResourceVersion: resourceVersion,
		},
	}

	_, err := r.K8sClient.CoreV1().Secrets(namespace).Create(&secret)
	if err != nil {
		t.Fatalf("Error creating secret: %s: %s\n", secret.Name, err.Error())
	}

	newVersion := "2"
	secret.ResourceVersion = newVersion
	t.Log("Updating secret")
	_, err = r.K8sClient.CoreV1().Secrets(namespace).Update(&secret)
	if err != nil {
		t.Fatalf("Error updating secret: %s: %s\n", secret.Name, err.Error())
	}

	t.Log("Deleting secret")
	err = r.K8sClient.CoreV1().Secrets(namespace).Delete(secret.Name, &metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("Error deleting secret: %s: %s\n", secret.Name, err.Error())
	}
}

// CD functions

func CDNamespaces(r *Resource, t *testing.T) {
	namespace := "ns1"
	_, err := r.K8sClient.CoreV1().Namespaces().Create(&corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}})
	if err != nil {
		t.Fatalf("Error creating namespace '%s': %s\n", namespace, err)
	}

	t.Log("Deleting namespace")
	err = r.K8sClient.CoreV1().Namespaces().Delete(namespace, &metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("Error deleting namespace: %s: %s\n", namespace, err.Error())
	}
}
