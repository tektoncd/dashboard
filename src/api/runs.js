/*
Copyright 2022 The Tekton Authors
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

import { getGenerateNamePrefixForRerun } from '@tektoncd/dashboard-utils';
import deepClone from 'lodash.clonedeep';

import { deleteRequest, get, patch, post } from './comms';
import {
  getQueryParams,
  getTektonAPI,
  useCollection,
  useResource
} from './utils';

export function deleteRun({ name, namespace }) {
  const uri = getTektonAPI('runs', { name, namespace, version: 'v1alpha1' });
  return deleteRequest(uri);
}

function getRunsAPI({ filters, isWebSocket, name, namespace }) {
  return getTektonAPI(
    'runs',
    { isWebSocket, namespace, version: 'v1alpha1' },
    getQueryParams({ filters, name })
  );
}

export function getRuns({ filters = [], namespace } = {}) {
  const uri = getRunsAPI({ filters, namespace });
  return get(uri);
}

export function getRun({ name, namespace }) {
  const uri = getTektonAPI('runs', { name, namespace, version: 'v1alpha1' });
  return get(uri);
}

export function useRuns(params) {
  const webSocketURL = getRunsAPI({ ...params, isWebSocket: true });
  return useCollection({
    api: getRuns,
    kind: 'Run',
    params,
    webSocketURL
  });
}

export function useRun(params, queryConfig) {
  const webSocketURL = getRunsAPI({ ...params, isWebSocket: true });
  return useResource({
    api: getRun,
    kind: 'Run',
    params,
    queryConfig,
    webSocketURL
  });
}

export function cancelRun({ name, namespace }) {
  const payload = [
    { op: 'replace', path: '/spec/status', value: 'RunCancelled' }
  ];

  const uri = getTektonAPI('runs', { name, namespace, version: 'v1alpha1' });
  return patch(uri, payload);
}

export function rerunRun(run) {
  const { annotations, labels, name, namespace } = run.metadata;

  const payload = deepClone(run);
  payload.metadata = {
    annotations,
    generateName: getGenerateNamePrefixForRerun(name),
    labels: {
      ...labels,
      'dashboard.tekton.dev/rerunOf': name
    },
    namespace
  };

  delete payload.status;
  delete payload.spec?.status;

  const uri = getTektonAPI('runs', { namespace, version: 'v1alpha1' });
  return post(uri, payload).then(({ body }) => body);
}
