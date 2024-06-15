/*
Copyright 2021-2024 The Tekton Authors
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

function getTriggersAPI({ filters, isWebSocket, name, namespace }) {
  return getKubeAPI({
    group: triggersAPIGroup,
    kind: 'triggers',
    params: { isWebSocket, name, namespace },
    queryParams: getQueryParams({ filters }),
    version: 'v1beta1'
  });
}

export function getTriggers({ filters = [], namespace } = {}) {
  const uri = getTriggersAPI({ filters, namespace });
  return get(uri);
}

export function getTrigger({ name, namespace }) {
  const uri = getKubeAPI({
    group: triggersAPIGroup,
    kind: 'triggers',
    params: { name, namespace },
    version: 'v1beta1'
  });
  return get(uri);
}

export function useTriggers(params) {
  const webSocketURL = getTriggersAPI({ ...params, isWebSocket: true });
  return useCollection({
    api: getTriggers,
    kind: 'Trigger',
    params,
    webSocketURL
  });
}

export function useTrigger(params) {
  const webSocketURL = getTriggersAPI({ ...params, isWebSocket: true });
  return useResource({
    api: getTrigger,
    kind: 'Trigger',
    params,
    webSocketURL
  });
}
