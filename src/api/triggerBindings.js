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

import { get } from './comms';
import {
  getKubeAPI,
  getQueryParams,
  triggersAPIGroup,
  useCollection,
  useResource
} from './utils';

function getTriggerBindingsAPI({ filters, isWebSocket, name, namespace }) {
  return getKubeAPI({
    group: triggersAPIGroup,
    kind: 'triggerbindings',
    params: { group: isWebSocket, name, namespace },
    queryParams: getQueryParams({ filters }),
    version: 'v1beta1'
  });
}

export function getTriggerBindings({ filters = [], namespace } = {}) {
  const uri = getTriggerBindingsAPI({ filters, namespace });
  return get(uri);
}

export function getTriggerBinding({ name, namespace }) {
  const uri = getKubeAPI({
    group: triggersAPIGroup,
    kind: 'triggerbindings',
    params: { name, namespace },
    version: 'v1beta1'
  });
  return get(uri);
}

export function useTriggerBindings(params) {
  const webSocketURL = getTriggerBindingsAPI({ ...params, isWebSocket: true });
  return useCollection({
    api: getTriggerBindings,
    kind: 'TriggerBinding',
    params,
    webSocketURL
  });
}

export function useTriggerBinding(params) {
  const webSocketURL = getTriggerBindingsAPI({ ...params, isWebSocket: true });
  return useResource({
    api: getTriggerBinding,
    kind: 'TriggerBinding',
    params,
    webSocketURL
  });
}
