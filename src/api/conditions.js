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
  useCollection,
  useResource
} from './utils';

function getConditionsAPI({ filters, isWebSocket, name, namespace }) {
  return getTektonAPI(
    'conditions',
    { isWebSocket, namespace, version: 'v1alpha1' },
    getQueryParams({ filters, name })
  );
}

export function getConditions({ filters = [], namespace } = {}) {
  const uri = getConditionsAPI({ filters, namespace });
  return get(uri);
}

export function getCondition({ name, namespace }) {
  const uri = getTektonAPI('conditions', {
    name,
    namespace,
    version: 'v1alpha1'
  });
  return get(uri);
}

export function useConditions(params) {
  const webSocketURL = getConditionsAPI({ ...params, isWebSocket: true });
  return useCollection({
    api: getConditions,
    kind: 'Condition',
    params,
    webSocketURL
  });
}

export function useCondition(params) {
  const webSocketURL = getConditionsAPI({ ...params, isWebSocket: true });
  return useResource({
    api: getCondition,
    kind: 'Condition',
    params,
    webSocketURL
  });
}
