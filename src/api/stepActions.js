/*
Copyright 2024 The Tekton Authors
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

function getStepActionsAPI({ filters, isWebSocket, name, namespace }) {
  return getTektonAPI(
    'stepactions',
    { isWebSocket, namespace, version: 'v1alpha1' },
    getQueryParams({ filters, name })
  );
}

export function getStepActions({ filters = [], namespace } = {}) {
  const uri = getStepActionsAPI({ filters, namespace });
  return get(uri);
}

export function getStepAction({ name, namespace }) {
  const uri = getTektonAPI('stepactions', {
    name,
    namespace,
    version: 'v1alpha1'
  });
  return get(uri);
}

export function deleteStepAction({ name, namespace }) {
  const uri = getTektonAPI('stepactions', {
    name,
    namespace,
    version: 'v1alpha1'
  });
  return deleteRequest(uri);
}

export function useStepActions(params) {
  const webSocketURL = getStepActionsAPI({ ...params, isWebSocket: true });
  return useCollection({
    api: getStepActions,
    kind: 'StepAction',
    params,
    webSocketURL
  });
}

export function useStepAction(params, queryConfig) {
  const webSocketURL = getStepActionsAPI({ ...params, isWebSocket: true });
  return useResource({
    api: getStepAction,
    kind: 'StepAction',
    params,
    queryConfig,
    webSocketURL
  });
}
