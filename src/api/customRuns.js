/*
Copyright 2022-2024 The Tekton Authors
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
  getKubeAPI,
  getQueryParams,
  removeSystemAnnotations,
  removeSystemLabels,
  tektonAPIGroup,
  useCollection,
  useResource
} from './utils';

export function deleteCustomRun({ name, namespace }) {
  const uri = getKubeAPI({
    group: tektonAPIGroup,
    kind: 'customruns',
    params: { name, namespace },
    version: 'v1beta1'
  });
  return deleteRequest(uri);
}

function getCustomRunsAPI({ filters, isWebSocket, name, namespace }) {
  return getKubeAPI({
    group: tektonAPIGroup,
    kind: 'customruns',
    params: { isWebSocket, name, namespace },
    queryParams: getQueryParams({ filters }),
    version: 'v1beta1'
  });
}

export function getCustomRunPayload({ namespace }) {
  const payload = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'CustomRun',
    metadata: {
      name: `run-${Date.now()}`,
      namespace
    },
    spec: {
      customRef: {
        apiVersion: '',
        kind: ''
      }
    }
  };

  return payload;
}

export function getCustomRuns({ filters = [], namespace } = {}) {
  const uri = getCustomRunsAPI({ filters, namespace });
  return get(uri);
}

export function getCustomRun({ name, namespace }) {
  const uri = getKubeAPI({
    group: tektonAPIGroup,
    kind: 'customruns',
    params: { name, namespace },
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

  const uri = getKubeAPI({
    group: tektonAPIGroup,
    kind: 'customruns',
    params: { name, namespace },
    version: 'v1beta1'
  });
  return patch(uri, payload);
}

export function createCustomRunRaw({ namespace, payload }) {
  const uri = getKubeAPI({
    group: tektonAPIGroup,
    kind: 'customruns',
    params: { namespace },
    version: 'v1beta1'
  });
  return post(uri, payload).then(({ body }) => body);
}

export function generateNewCustomRunPayload({ customRun, rerun }) {
  const { annotations, labels, name, namespace, generateName } =
    customRun.metadata;

  const payload = deepClone(customRun);
  payload.apiVersion = payload.apiVersion || 'tekton.dev/v1beta1';
  payload.kind = payload.kind || 'CustomRun';

  function getGenerateName() {
    if (rerun) {
      return getGenerateNamePrefixForRerun(name);
    }

    return generateName || `${name}-`;
  }

  payload.metadata = {
    annotations: annotations || {},
    generateName: getGenerateName(),
    labels: labels || {},
    namespace
  };
  if (rerun) {
    payload.metadata.labels['dashboard.tekton.dev/rerunOf'] = name;
  }

  removeSystemAnnotations(payload);
  removeSystemLabels(payload);

  Object.keys(payload.metadata).forEach(
    i => payload.metadata[i] === undefined && delete payload.metadata[i]
  );

  delete payload.status;

  delete payload.spec?.status;
  return { namespace, payload };
}

export function rerunCustomRun(customRun) {
  const { namespace, payload } = generateNewCustomRunPayload({
    customRun,
    rerun: true
  });

  const uri = getKubeAPI({
    group: tektonAPIGroup,
    kind: 'customruns',
    params: { namespace },
    version: 'v1beta1'
  });
  return post(uri, payload).then(({ body }) => body);
}
