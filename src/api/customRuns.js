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
  getTektonPipelinesAPIVersion,
  removeSystemAnnotations,
  removeSystemLabels,
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

export function getCustomRunPayload({
  kind,
  labels,
  namespace,
  nodeSelector,
  params,
  serviceAccount,
  customName,
  customRunName = `${customName ? `${customName}-run` : 'run'}-${Date.now()}`,
  timeout
}) {
  const payload = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'CustomRun',
    metadata: {
      name: customRunName,
      namespace
    },
    spec: {
      customRef: {
        apiVersion: '',
        kind: 'Custom'
      }
    }
  };
  if (labels) {
    payload.metadata.labels = labels;
  }
  if (params) {
    payload.spec.params = Object.keys(params).map(name => ({
      name,
      value: params[name]
    }));
  }
  if (nodeSelector) {
    payload.spec.podTemplate = { nodeSelector };
  }
  if (serviceAccount) {
    payload.spec.serviceAccountName = serviceAccount;
  }
  if (timeout) {
    payload.spec.timeout = timeout;
  }

  return payload;
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

export function createCustomRun({
  kind,
  labels,
  namespace,
  nodeSelector,
  params,
  serviceAccount,
  customName,
  customRunName = `${customName}-run-${Date.now()}`,
  timeout
}) {
  const payload = getCustomRunPayload({
    kind,
    labels,
    namespace,
    nodeSelector,
    params,
    serviceAccount,
    customName,
    customRunName,
    timeout
  });
  const uri = getTektonAPI('customruns', { namespace });
  return post(uri, payload).then(({ body }) => body);
}

export function createCustomRunRaw({ namespace, payload }) {
  const uri = getTektonAPI('customruns', { namespace, version: 'v1beta1' });
  return post(uri, payload).then(({ body }) => body);
}

export function generateNewCustomRunPayload({ customRun, rerun }) {
  const { annotations, labels, name, namespace, generateName } =
    customRun.metadata;

  const payload = deepClone(customRun);
  payload.apiVersion =
    payload.apiVersion || 'tekton.dev/v1beta1';
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
