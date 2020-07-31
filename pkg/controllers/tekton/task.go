/*
Copyright 2019-2020 The Tekton Authors
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

// NewTaskController registers a Tekton controller/informer for tasks on
// the sharedTektonInformerFactory
func NewTaskController(sharedTektonInformerFactory tektoninformer.SharedInformerFactory) {
	logging.Log.Debug("In NewTaskController")

	utils.NewController(
		"Task",
		sharedTektonInformerFactory.Tekton().V1beta1().Tasks().Informer(),
		broadcaster.TaskCreated,
		broadcaster.TaskUpdated,
		broadcaster.TaskDeleted,
		nil,
	)
}
