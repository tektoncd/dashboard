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
	"github.com/tektoncd/dashboard/pkg/logging"
	k8sinformer "k8s.io/client-go/informers"
)

// NewServiceAccountController registers the K8s shared informer that reacts to
// create, update and delete events for ServiceAccounts
func NewServiceAccountController(sharedK8sInformerFactory k8sinformer.SharedInformerFactory) {
	logging.Log.Debug("In NewServiceAccountController")

	utils.NewController(
		"service account",
		sharedK8sInformerFactory.Core().V1().ServiceAccounts().Informer(),
		broadcaster.ServiceAccountCreated,
		broadcaster.ServiceAccountUpdated,
		broadcaster.ServiceAccountDeleted,
		nil,
	)
}
