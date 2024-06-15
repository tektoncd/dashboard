/*
Copyright 2019-2024 The Tekton Authors
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
  getKubeAPI,
  getQueryParams,
  getTektonPipelinesAPIVersion,
  tektonAPIGroup,
  useCollection,
  useResource
} from './utils';

function getPipelinesAPI({ filters, isWebSocket, name, namespace }) {
  return getKubeAPI({
    group: tektonAPIGroup,
    kind: 'pipelines',
    params: { isWebSocket, name, namespace },
    queryParams: getQueryParams({ filters }),
    version: getTektonPipelinesAPIVersion()
  });
}

export function getPipelines({ filters = [], namespace } = {}) {
  const uri = getPipelinesAPI({ filters, namespace });
  return get(uri);
}

export function getPipeline({ name, namespace }) {
  const uri = getKubeAPI({
    group: tektonAPIGroup,
    kind: 'pipelines',
    params: { name, namespace },
    version: getTektonPipelinesAPIVersion()
  });
  return get(uri);
}

export function deletePipeline({ name, namespace }) {
  const uri = getKubeAPI({
    group: tektonAPIGroup,
    kind: 'pipelines',
    params: { name, namespace },
    version: getTektonPipelinesAPIVersion()
  });
  return deleteRequest(uri);
}

export function usePipelines(params, queryConfig) {
  const webSocketURL = getPipelinesAPI({ ...params, isWebSocket: true });
  return useCollection({
    api: getPipelines,
    kind: 'Pipeline',
    params,
    queryConfig,
    webSocketURL
  });
}

export function usePipeline(params, queryConfig) {
  const webSocketURL = getPipelinesAPI({ ...params, isWebSocket: true });
  return useResource({
    api: getPipeline,
    kind: 'Pipeline',
    params,
    queryConfig,
    webSocketURL
  });
}
