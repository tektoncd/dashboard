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

function getClusterTasksAPI({ filters, isWebSocket, name }) {
  return getTektonAPI(
    'clustertasks',
    { isWebSocket },
    getQueryParams({ filters, name })
  );
}

export function getClusterTasks({ filters = [] } = {}) {
  const uri = getClusterTasksAPI({ filters });
  return get(uri);
}

export function getClusterTask({ name }) {
  const uri = getTektonAPI('clustertasks', { name });
  return get(uri);
}

export function deleteClusterTask({ name }) {
  const uri = getTektonAPI('clustertasks', { name });
  return deleteRequest(uri);
}

export function useClusterTasks(params) {
  const webSocketURL = getClusterTasksAPI({ ...params, isWebSocket: true });
  return useCollection({
    api: getClusterTasks,
    kind: 'ClusterTask',
    params,
    webSocketURL
  });
}

export function useClusterTask(params, queryConfig) {
  const webSocketURL = getClusterTasksAPI({ ...params, isWebSocket: true });
  return useResource({
    api: getClusterTask,
    kind: 'ClusterTask',
    params,
    queryConfig,
    webSocketURL
  });
}
