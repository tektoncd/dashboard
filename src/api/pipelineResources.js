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

import { deleteRequest, get, post } from './comms';
import {
  checkData,
  getQueryParams,
  getTektonAPI,
  useCollection,
  useResource
} from './utils';

export function createPipelineResource({ namespace, resource } = {}) {
  const uri = getTektonAPI('pipelineresources', {
    namespace,
    version: 'v1alpha1'
  });
  return post(uri, resource);
}

export function deletePipelineResource({ name, namespace } = {}) {
  const uri = getTektonAPI('pipelineresources', {
    name,
    namespace,
    version: 'v1alpha1'
  });
  return deleteRequest(uri, name);
}

function getPipelineResourcesAPI({ filters, isWebSocket, name, namespace }) {
  return getTektonAPI(
    'pipelineresources',
    { isWebSocket, namespace, version: 'v1alpha1' },
    getQueryParams({ filters, name })
  );
}

export function getPipelineResources({ filters = [], namespace } = {}) {
  const uri = getPipelineResourcesAPI({
    filters,
    namespace
  });
  return get(uri).then(checkData);
}

export function getPipelineResource({ name, namespace }) {
  const uri = getTektonAPI(
    'pipelineresources',
    {
      name,
      namespace,
      version: 'v1alpha1'
    },
    undefined
  );
  return get(uri);
}

export function usePipelineResources(params) {
  const webSocketURL = getPipelineResourcesAPI({
    ...params,
    isWebSocket: true
  });
  return useCollection({
    api: getPipelineResources,
    kind: 'PipelineResource',
    params,
    webSocketURL
  });
}

export function usePipelineResource(params) {
  const webSocketURL = getPipelineResourcesAPI({
    ...params,
    isWebSocket: true
  });
  return useResource({
    api: getPipelineResource,
    kind: 'PipelineResource',
    params,
    webSocketURL
  });
}
