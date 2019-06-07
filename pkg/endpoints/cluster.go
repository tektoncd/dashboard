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
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/logging"
	"k8s.io/api/core/v1"
	"k8s.io/client-go/tools/cache"
	"net/http"
	"time"

	"github.com/emicklei/go-restful"
	"github.com/tektoncd/dashboard/pkg/utils"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/informers"
)

func (r Resource) getAllNamespaces(request *restful.Request, response *restful.Response) {
	namespaces, err := r.K8sClient.CoreV1().Namespaces().List(metav1.ListOptions{})

	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(namespaces)
}

func (r Resource) getAllServiceAccounts(request *restful.Request, response *restful.Response) {
	requestNamespace := utils.GetNamespace(request)

	serviceAccounts, err := r.K8sClient.CoreV1().ServiceAccounts(requestNamespace).List(metav1.ListOptions{})

	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}
	response.WriteEntity(serviceAccounts)
}

func (r Resource) StartNamespacesController(stopCh <-chan struct{}) {
	logging.Log.Debug("Into StartResourcesController")

	k8sInformerFactory := informers.NewSharedInformerFactory(r.K8sClient, time.Second*30)
	k8sInformer := k8sInformerFactory.Core().V1().Namespaces()
	k8sInformer.Informer().AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    r.namespaceCreated,
		DeleteFunc: r.namespaceDeleted,
	})

	go k8sInformerFactory.Start(stopCh)
	logging.Log.Info("Resource Events Controller Started")
}

func (r Resource) namespaceCreated(obj interface{}) {
	logging.Log.Debug("In namespaceCreated")

	data := broadcaster.SocketData{
		MessageType: broadcaster.NamespaceCreated,
		Payload:     obj.(*v1.Namespace),
	}

	resourcesChannel <- data
}

func (r Resource) namespaceDeleted(obj interface{}) {
	logging.Log.Debug("In namespaceDeleted")

	data := broadcaster.SocketData{
		MessageType: broadcaster.NamespaceDeleted,
		Payload:     obj.(*v1.Namespace),
	}

	resourcesChannel <- data
}

