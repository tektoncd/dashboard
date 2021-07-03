/*
Copyright 2019-2021 The Tekton Authors
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
	"context"
	"crypto/tls"
	"encoding/json"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	gorillaSocket "github.com/gorilla/websocket"
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	. "github.com/tektoncd/dashboard/pkg/endpoints"
	"github.com/tektoncd/dashboard/pkg/testutils"
	"github.com/tektoncd/dashboard/pkg/websocket"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
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

func (i *informerRecord) Handle(event broadcaster.Operation) {
	switch event {
	case broadcaster.Created:
		atomic.AddInt32(&i.create, 1)
	case broadcaster.Updated:
		atomic.AddInt32(&i.update, 1)
	case broadcaster.Deleted:
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

func CUDTasks(r *Resource, t *testing.T, namespace string) {
	resourceVersion := "1"

	name := "task"
	task := testutils.GetObject("v1beta1", "Task", namespace, name, resourceVersion)
	gvr := schema.GroupVersionResource{
		Group:    "tekton.dev",
		Version:  "v1beta1",
		Resource: "tasks",
	}

	t.Log("Creating task")
	_, err := r.DynamicClient.Resource(gvr).Namespace(namespace).Create(context.TODO(), task, metav1.CreateOptions{})
	if err != nil {
		t.Fatalf("Error creating task: %s: %s\n", name, err.Error())
	}

	newVersion := "2"
	task.SetResourceVersion(newVersion)
	t.Log("Updating task")
	_, err = r.DynamicClient.Resource(gvr).Namespace(namespace).Update(context.TODO(), task, metav1.UpdateOptions{})
	if err != nil {
		t.Fatalf("Error updating task: %s: %s\n", name, err.Error())
	}

	t.Log("Deleting task")
	err = r.DynamicClient.Resource(gvr).Namespace(namespace).Delete(context.TODO(), name, metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("Error deleting task: %s: %s\n", name, err.Error())
	}
}

func CUDClusterTasks(r *Resource, t *testing.T) {
	resourceVersion := "1"

	name := "clusterTask"
	clusterTask := testutils.GetClusterObject("v1beta1", "ClusterTask", name, resourceVersion)
	gvr := schema.GroupVersionResource{
		Group:    "tekton.dev",
		Version:  "v1beta1",
		Resource: "clustertasks",
	}

	t.Log("Creating clusterTask")
	_, err := r.DynamicClient.Resource(gvr).Create(context.TODO(), clusterTask, metav1.CreateOptions{})
	if err != nil {
		t.Fatalf("Error creating clusterTask: %s: %s\n", name, err.Error())
	}

	newVersion := "2"
	clusterTask.SetResourceVersion(newVersion)
	t.Log("Updating clusterTask")
	_, err = r.DynamicClient.Resource(gvr).Update(context.TODO(), clusterTask, metav1.UpdateOptions{})
	if err != nil {
		t.Fatalf("Error updating clusterTask: %s: %s\n", name, err.Error())
	}

	t.Log("Deleting clusterTask")
	err = r.DynamicClient.Resource(gvr).Delete(context.TODO(), name, metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("Error deleting clusterTask: %s: %s\n", name, err.Error())
	}
}

// CD functions

func CDNamespaces(r *Resource, t *testing.T) {
	namespace := "ns1"
	_, err := r.K8sClient.CoreV1().Namespaces().Create(context.TODO(), &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: namespace}}, metav1.CreateOptions{})
	if err != nil {
		t.Fatalf("Error creating namespace '%s': %s\n", namespace, err)
	}

	t.Log("Deleting namespace")
	err = r.K8sClient.CoreV1().Namespaces().Delete(context.TODO(), namespace, metav1.DeleteOptions{})
	if err != nil {
		t.Fatalf("Error deleting namespace: %s: %s\n", namespace, err.Error())
	}
}
