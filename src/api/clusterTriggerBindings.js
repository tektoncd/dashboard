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

import { get } from './comms';
import {
  getQueryParams,
  getTektonAPI,
  triggersAPIGroup,
  useCollection,
  useResource
} from './utils';

function getClusterTriggerBindingsAPI({ filters, isWebSocket, name }) {
  return getTektonAPI(
    'clustertriggerbindings',
    { group: triggersAPIGroup, isWebSocket, version: 'v1alpha1' },
    getQueryParams({ filters, name })
  );
}

export function getClusterTriggerBindings({ filters = [] } = {}) {
  const uri = getClusterTriggerBindingsAPI({ filters });
  return get(uri);
}

export function getClusterTriggerBinding({ name }) {
  const uri = getTektonAPI('clustertriggerbindings', {
    group: triggersAPIGroup,
    name,
    version: 'v1alpha1'
  });
  return get(uri);
}

export function useClusterTriggerBindings(params) {
  const webSocketURL = getClusterTriggerBindingsAPI({
    ...params,
    isWebSocket: true
  });
  return useCollection({
    api: getClusterTriggerBindings,
    kind: 'ClusterTriggerBinding',
    params,
    webSocketURL
  });
}

export function useClusterTriggerBinding(params) {
  const webSocketURL = getClusterTriggerBindingsAPI({
    ...params,
    isWebSocket: true
  });
  return useResource({
    api: getClusterTriggerBinding,
    kind: 'ClusterTriggerBinding',
    params,
    webSocketURL
  });
}
