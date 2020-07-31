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

package dashboard

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	dashboardinformer "github.com/tektoncd/dashboard/pkg/client/informers/externalversions"
	"github.com/tektoncd/dashboard/pkg/controllers/utils"
	"github.com/tektoncd/dashboard/pkg/logging"
)

// NewNamespaceController registers the K8s shared informer that reacts to
// create and delete events for namespaces
func NewExtensionController(sharedDashboardInformerFactory dashboardinformer.SharedInformerFactory) {
	logging.Log.Debug("In NewExtensionController")

	utils.NewController(
		"Extension",
		sharedDashboardInformerFactory.Dashboard().V1alpha1().Extensions().Informer(),
		broadcaster.ResourceExtensionCreated,
		broadcaster.ResourceExtensionUpdated,
		broadcaster.ResourceExtensionDeleted,
		nil,
	)
}
