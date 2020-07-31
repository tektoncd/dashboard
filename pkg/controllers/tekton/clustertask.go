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

package tekton

import (
	"github.com/tektoncd/dashboard/pkg/broadcaster"
	"github.com/tektoncd/dashboard/pkg/controllers/utils"
	logging "github.com/tektoncd/dashboard/pkg/logging"
	tektoninformer "github.com/tektoncd/pipeline/pkg/client/informers/externalversions"
)

// NewClusterTaskController registers a Tekton controller/informer for cluster
// tasks on the sharedTektonInformerFactory
func NewClusterTaskController(sharedTektonInformerFactory tektoninformer.SharedInformerFactory) {
	logging.Log.Debug("In NewClusterTaskController")

	utils.NewController(
		"ClusterTask",
		sharedTektonInformerFactory.Tekton().V1beta1().ClusterTasks().Informer(),
		broadcaster.ClusterTaskCreated,
		broadcaster.ClusterTaskUpdated,
		broadcaster.ClusterTaskDeleted,
		nil,
	)
}
