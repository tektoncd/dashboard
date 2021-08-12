/*
Copyright 2021 The Tekton Authors
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

import { get } from './comms';
import {
  getQueryParams,
  getTektonAPI,
  triggersAPIGroup,
  useCollection,
  useResource
} from './utils';

function getClusterInterceptorsAPI({ filters, isWebSocket, name }) {
  return getTektonAPI(
    'clusterinterceptors',
    { group: triggersAPIGroup, isWebSocket, version: 'v1alpha1' },
    getQueryParams({ filters, name })
  );
}

export function getClusterInterceptors({ filters = [] } = {}) {
  const uri = getClusterInterceptorsAPI({ filters });
  return get(uri);
}

export function getClusterInterceptor({ name }) {
  const uri = getTektonAPI('clusterinterceptors', {
    group: triggersAPIGroup,
    name,
    version: 'v1alpha1'
  });
  return get(uri);
}

export function useClusterInterceptors(params) {
  const webSocketURL = getClusterInterceptorsAPI({
    ...params,
    isWebSocket: true
  });
  return useCollection({
    api: getClusterInterceptors,
    kind: 'ClusterInterceptor',
    params,
    webSocketURL
  });
}

export function useClusterInterceptor(params) {
  const webSocketURL = getClusterInterceptorsAPI({
    ...params,
    isWebSocket: true
  });
  return useResource({
    api: getClusterInterceptor,
    kind: 'ClusterInterceptor',
    params,
    webSocketURL
  });
}
