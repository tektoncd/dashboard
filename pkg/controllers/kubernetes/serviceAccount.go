/*
Copyright 2020 The Tekton Authors
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

package kubernetes

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/controllers/utils"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	v1 "k8s.io/api/core/v1"
	k8sinformer "k8s.io/client-go/informers"
	"k8s.io/client-go/tools/cache"
)

// NewServiceAccountController registers the K8s shared informer that reacts to
// create, update and delete events for ServiceAccounts
func NewServiceAccountController(sharedK8sInformerFactory k8sinformer.SharedInformerFactory) {
	logging.Log.Debug("In NewServiceAccountController")
	k8sInformer := sharedK8sInformerFactory.Core().V1().ServiceAccounts()
	k8sInformer.Informer().AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    serviceAccountCreated,
		UpdateFunc: serviceAccountUpdated,
		DeleteFunc: serviceAccountDeleted,
	})
}

func serviceAccountCreated(obj interface{}) {
	logging.Log.Debugf("ServiceAccount Controller detected ServiceAccount '%s' created", obj.(*v1.ServiceAccount).Name)
	data := broadcaster.SocketData{
		MessageType: broadcaster.ServiceAccountCreated,
		Payload:     obj,
	}

	endpoints.ResourcesChannel <- data
}

func serviceAccountUpdated(oldObj, newObj interface{}) {
	oldServiceAccount, newServiceAccount := oldObj.(*v1.ServiceAccount), newObj.(*v1.ServiceAccount)
	// If resourceVersion differs between old and new, an actual update event was observed
	if oldServiceAccount.ResourceVersion != newServiceAccount.ResourceVersion {
		logging.Log.Debugf("ServiceAccount Controller detected ServiceAccount '%s' updated", oldServiceAccount.Name)
		data := broadcaster.SocketData{
			MessageType: broadcaster.ServiceAccountUpdated,
			Payload:     newObj,
		}
		endpoints.ResourcesChannel <- data
	}
}

func serviceAccountDeleted(obj interface{}) {
	logging.Log.Debugf("ServiceAccount Controller detected ServiceAccount '%s' deleted", utils.GetDeletedObjectMeta(obj).GetName())
	data := broadcaster.SocketData{
		MessageType: broadcaster.ServiceAccountDeleted,
		Payload:     obj,
	}

	endpoints.ResourcesChannel <- data
}
