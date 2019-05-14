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

import extensions, * as extensionSelectors from './extensions';
import namespaces, * as namespaceSelectors from './namespaces';
import pipelines, * as pipelineSelectors from './pipelines';
import pipelineRuns, * as pipelineRunsSelectors from './pipelineRuns';
import tasks, * as taskSelectors from './tasks';
import taskRuns, * as taskRunsSelectors from './taskRuns';

export default combineReducers({
  extensions,
  namespaces,
  pipelines,
  pipelineRuns,
  tasks,
  taskRuns
});

export function getSelectedNamespace(state) {
  return namespaceSelectors.getSelectedNamespace(state.namespaces);
}

export function getNamespaces(state) {
  return namespaceSelectors.getNamespaces(state.namespaces);
}

export function isFetchingNamespaces(state) {
  return namespaceSelectors.isFetchingNamespaces(state.namespaces);
}

export function getExtensions(state) {
  return extensionSelectors.getExtensions(state.extensions);
}

export function getExtensionsErrorMessage(state) {
  return extensionSelectors.getExtensionsErrorMessage(state.extensions);
}

export function isFetchingExtensions(state) {
  return extensionSelectors.isFetchingExtensions(state.extensions);
}

export function getPipelines(state) {
  const namespace = getSelectedNamespace(state);
  return pipelineSelectors.getPipelines(state.pipelines, namespace);
}

export function getPipelinesErrorMessage(state) {
  return pipelineSelectors.getPipelinesErrorMessage(state.pipelines);
}

export function isFetchingPipelines(state) {
  return pipelineSelectors.isFetchingPipelines(state.pipelines);
}

export function getPipelineRuns(state) {
  const namespace = getSelectedNamespace(state);
  return pipelineRunsSelectors.getPipelineRuns(state.pipelineRuns, namespace);
}

export function getPipelineRunsByPipelineName(state, name) {
  const runs = getPipelineRuns(state);
  return runs.filter(pipelineRun => pipelineRun.spec.pipelineRef.name === name);
}

export function getPipelineRun(state, name) {
  const namespace = getSelectedNamespace(state);
  return pipelineRunsSelectors.getPipelineRun(
    state.pipelineRuns,
    name,
    namespace
  );
}

export function getPipelineRunsErrorMessage(state) {
  return pipelineRunsSelectors.getPipelineRunsErrorMessage(state.pipelineRuns);
}

export function isFetchingPipelineRuns(state) {
  return pipelineRunsSelectors.isFetchingPipelineRuns(state.pipelineRuns);
}

export function getTaskRuns(state) {
  const namespace = getSelectedNamespace(state);
  return taskRunsSelectors.getTaskRuns(state.taskRuns, namespace);
}

export function getTaskRunsErrorMessage(state) {
  return taskRunsSelectors.getTaskRunsErrorMessage(state.taskRuns);
}

export function isFetchingTaskRuns(state) {
  return taskRunsSelectors.isFetchingTaskRuns(state.taskRuns);
}

export function getTaskRunsByTaskName(state, name) {
  const runs = getTaskRuns(state);
  return runs.filter(taskRun => taskRun.spec.taskRef.name === name);
}

export function getTasks(state) {
  const namespace = getSelectedNamespace(state);
  return taskSelectors.getTasks(state.tasks, namespace);
}

export function getTask(state, name) {
  const namespace = getSelectedNamespace(state);
  return taskSelectors.getTask(state.tasks, name, namespace);
}

export function getTasksErrorMessage(state) {
  return taskSelectors.getTasksErrorMessage(state.tasks);
}

export function isFetchingTasks(state) {
  return taskSelectors.isFetchingTasks(state.tasks);
}
