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

function getEventListenersAPI({ filters, isWebSocket, name, namespace }) {
  return getTektonAPI(
    'eventlisteners',
    { group: triggersAPIGroup, isWebSocket, namespace, version: 'v1alpha1' },
    getQueryParams({ filters, name })
  );
}

export function getEventListeners({ filters = [], namespace } = {}) {
  const uri = getEventListenersAPI({ filters, namespace });
  return get(uri);
}

export function getEventListener({ name, namespace }) {
  const uri = getTektonAPI('eventlisteners', {
    group: triggersAPIGroup,
    name,
    namespace,
    version: 'v1alpha1'
  });
  return get(uri);
}

export function useEventListeners(params) {
  const webSocketURL = getEventListenersAPI({ ...params, isWebSocket: true });
  return useCollection({
    api: getEventListeners,
    kind: 'EventListener',
    params,
    webSocketURL
  });
}

export function useEventListener(params) {
  const webSocketURL = getEventListenersAPI({ ...params, isWebSocket: true });
  return useResource({
    api: getEventListener,
    kind: 'EventListener',
    params,
    webSocketURL
  });
}
