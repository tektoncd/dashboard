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

import { deleteRequest, get } from './comms';
import {
  getQueryParams,
  getTektonAPI,
  useCollection,
  useResource
} from './utils';

function getTasksAPI({ filters, isWebSocket, name, namespace }) {
  return getTektonAPI(
    'tasks',
    { isWebSocket, namespace },
    getQueryParams({ filters, name })
  );
}

export function getTasks({ filters = [], namespace } = {}) {
  const uri = getTasksAPI({ filters, namespace });
  return get(uri);
}

export function getTask({ name, namespace }) {
  const uri = getTektonAPI('tasks', { name, namespace });
  return get(uri);
}

export function deleteTask({ name, namespace }) {
  const uri = getTektonAPI('tasks', { name, namespace });
  return deleteRequest(uri);
}

export function useTasks(params) {
  const webSocketURL = getTasksAPI({ ...params, isWebSocket: true });
  return useCollection({ api: getTasks, kind: 'Task', params, webSocketURL });
}

export function useTask(params, queryConfig) {
  const webSocketURL = getTasksAPI({ ...params, isWebSocket: true });
  return useResource({
    api: getTask,
    kind: 'Task',
    params,
    queryConfig,
    webSocketURL
  });
}
