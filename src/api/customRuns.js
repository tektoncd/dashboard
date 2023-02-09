/*
Copyright 2022-2023 The Tekton Authors
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

export function deleteCustomRun({ name, namespace }) {
  const uri = getTektonAPI('customruns', {
    name,
    namespace,
    version: 'v1beta1'
  });
  return deleteRequest(uri);
}

function getCustomRunsAPI({ filters, isWebSocket, name, namespace }) {
  return getTektonAPI(
    'customruns',
    { isWebSocket, namespace, version: 'v1beta1' },
    getQueryParams({ filters, name })
  );
}

export function getCustomRuns({ filters = [], namespace } = {}) {
  const uri = getCustomRunsAPI({ filters, namespace });
  return get(uri);
}

export function getCustomRun({ name, namespace }) {
  const uri = getTektonAPI('customruns', {
    name,
    namespace,
    version: 'v1beta1'
  });
  return get(uri);
}

export function useCustomRuns(params) {
  const webSocketURL = getCustomRunsAPI({ ...params, isWebSocket: true });
  return useCollection({
    api: getCustomRuns,
    kind: 'CustomRun',
    params,
    webSocketURL
  });
}

export function useCustomRun(params, queryConfig) {
  const webSocketURL = getCustomRunsAPI({ ...params, isWebSocket: true });
  return useResource({
    api: getCustomRun,
    kind: 'CustomRun',
    params,
    queryConfig,
    webSocketURL
  });
}

export function cancelCustomRun({ name, namespace }) {
  const payload = [
    { op: 'replace', path: '/spec/status', value: 'RunCancelled' }
  ];

  const uri = getTektonAPI('customruns', {
    name,
    namespace,
    version: 'v1beta1'
  });
  return patch(uri, payload);
}

export function rerunCustomRun(run) {
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

  const uri = getTektonAPI('customruns', { namespace, version: 'v1beta1' });
  return post(uri, payload).then(({ body }) => body);
}
