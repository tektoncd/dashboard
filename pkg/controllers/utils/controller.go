/*
Copyright 2020-2021 The Tekton Authors
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

package utils

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/endpoints"
	"github.com/tektoncd/dashboard/pkg/logging"
	"github.com/tektoncd/dashboard/pkg/utils"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/tools/cache"
)

func NewController(kind string, informer cache.SharedIndexInformer, filter func(interface{}, bool) interface{}) {
	logging.Log.Debug("In NewController")

	if filter == nil {
		filter = func(obj interface{}, skipDeletedCheck bool) interface{} {
			return obj
		}
	}

	informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			logging.Log.Debugf("Controller detected %s '%s' created", kind, obj.(metav1.Object).GetName())
			data := broadcaster.SocketData{
				Kind:      kind,
				Operation: broadcaster.Created,
				Payload:   filter(obj, true),
			}
			endpoints.ResourcesChannel <- data
		},
		UpdateFunc: func(oldObj, newObj interface{}) {
			oldResource, newResource := oldObj.(metav1.Object), newObj.(metav1.Object)
			// If resourceVersion differs between old and new, an actual update event was observed
			if oldResource.GetResourceVersion() != newResource.GetResourceVersion() {
				logging.Log.Debugf("Controller detected %s '%s' updated", kind, oldResource.GetName())
				data := broadcaster.SocketData{
					Kind:      kind,
					Operation: broadcaster.Updated,
					Payload:   filter(newObj, true),
				}
				endpoints.ResourcesChannel <- data
			}
		},
		DeleteFunc: func(obj interface{}) {
			logging.Log.Debugf("Controller detected %s '%s' deleted", kind, utils.GetDeletedObjectMeta(obj).GetName())
			data := broadcaster.SocketData{
				Kind:      kind,
				Operation: broadcaster.Deleted,
				Payload:   filter(obj, false),
			}
			endpoints.ResourcesChannel <- data
		},
	})
}
