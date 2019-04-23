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

import { combineReducers } from 'redux';

import pipelines, * as pipelineSelectors from './pipelines';
import tasks, * as taskSelectors from './tasks';

export default combineReducers({
  pipelines,
  tasks
});

export function getPipelines(state) {
  return pipelineSelectors.getPipelines(state.pipelines);
}

export function getPipelinesErrorMessage(state) {
  return pipelineSelectors.getPipelinesErrorMessage(state.pipelines);
}

export function isFetchingPipelines(state) {
  return pipelineSelectors.isFetchingPipelines(state.pipelines);
}

export function getTasks(state) {
  return taskSelectors.getTasks(state.tasks);
}

export function getTasksErrorMessage(state) {
  return taskSelectors.getTasksErrorMessage(state.tasks);
}

export function isFetchingTasks(state) {
  return taskSelectors.isFetchingTasks(state.tasks);
}
