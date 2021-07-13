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

import { getGenerateNamePrefixForRerun } from '@tektoncd/dashboard-utils';
import deepClone from 'lodash.clonedeep';

import { deleteRequest, get, patch, post } from './comms';
import {
  checkData,
  getQueryParams,
  getTektonAPI,
  useCollection,
  useResource
} from './utils';

export function getPipelineRuns({ filters = [], namespace } = {}) {
  const uri = getTektonAPI(
    'pipelineruns',
    { namespace },
    getQueryParams(filters)
  );
  return get(uri).then(checkData);
}

export function getPipelineRun({ name, namespace }) {
  const uri = getTektonAPI('pipelineruns', { name, namespace });
  return get(uri);
}

export function usePipelineRuns(params) {
  return useCollection('PipelineRun', getPipelineRuns, params);
}

export function usePipelineRun(params, queryConfig) {
  return useResource('PipelineRun', getPipelineRun, params, queryConfig);
}

export function cancelPipelineRun({ name, namespace }) {
  const payload = [
    { op: 'replace', path: '/spec/status', value: 'PipelineRunCancelled' }
  ];

  const uri = getTektonAPI('pipelineruns', { name, namespace });
  return patch(uri, payload);
}

export function deletePipelineRun({ name, namespace }) {
  const uri = getTektonAPI('pipelineruns', { name, namespace });
  return deleteRequest(uri);
}

export function createPipelineRun({
  namespace,
  pipelineName,
  resources,
  params,
  pipelinePendingStatus,
  serviceAccount,
  timeout,
  labels,
  nodeSelector
}) {
  // Create PipelineRun payload
  // expect params and resources to be objects with keys 'name' and values 'value'
  const payload = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    metadata: {
      name: `${pipelineName}-run-${Date.now()}`,
      labels
    },
    spec: {
      pipelineRef: {
        name: pipelineName
      },
      resources: Object.keys(resources).map(name => ({
        name,
        resourceRef: { name: resources[name] }
      })),
      params: Object.keys(params).map(name => ({
        name,
        value: params[name]
      })),
      status: pipelinePendingStatus
    }
  };
  if (nodeSelector) {
    payload.spec.podTemplate = { nodeSelector };
  }
  if (serviceAccount) {
    payload.spec.serviceAccountName = serviceAccount;
  }
  if (timeout) {
    payload.spec.timeout = timeout;
  }
  const uri = getTektonAPI('pipelineruns', { namespace });
  return post(uri, payload).then(({ body }) => body);
}

export function rerunPipelineRun(pipelineRun) {
  const { annotations, labels, name, namespace } = pipelineRun.metadata;

  const payload = deepClone(pipelineRun);
  payload.apiVersion = payload.apiVersion || 'tekton.dev/v1beta1';
  payload.kind = payload.kind || 'PipelineRun';
  payload.metadata = {
    annotations,
    generateName: getGenerateNamePrefixForRerun(name),
    labels: {
      ...labels,
      reruns: name
    },
    namespace
  };

  delete payload.metadata.labels['tekton.dev/pipeline'];

  delete payload.status;
  delete payload.spec?.status;

  const uri = getTektonAPI('pipelineruns', { namespace });
  return post(uri, payload).then(({ body }) => body);
}

export function startPipelineRun(pipelineRun) {
  const { name, namespace } = pipelineRun.metadata;

  const payload = [{ op: 'remove', path: '/spec/status' }];

  const uri = getTektonAPI('pipelineruns', { name, namespace });
  return patch(uri, payload);
}
