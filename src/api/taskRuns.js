/*
Copyright 2019-2023 The Tekton Authors
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

export function deleteTaskRun({ name, namespace }) {
  const uri = getTektonAPI('taskruns', { name, namespace });
  return deleteRequest(uri);
}

function getTaskRunsAPI({ filters, isWebSocket, name, namespace }) {
  return getTektonAPI(
    'taskruns',
    { isWebSocket, namespace },
    getQueryParams({ filters, name })
  );
}

export function getTaskRuns({ filters = [], namespace } = {}) {
  const uri = getTaskRunsAPI({ filters, namespace });
  return get(uri);
}

export function getTaskRun({ name, namespace }) {
  const uri = getTektonAPI('taskruns', { name, namespace });
  return get(uri);
}

export function useTaskRuns(params) {
  const webSocketURL = getTaskRunsAPI({ ...params, isWebSocket: true });
  return useCollection({
    api: getTaskRuns,
    kind: 'TaskRun',
    params,
    webSocketURL
  });
}

export function useTaskRun(params, queryConfig) {
  const webSocketURL = getTaskRunsAPI({ ...params, isWebSocket: true });
  return useResource({
    api: getTaskRun,
    kind: 'TaskRun',
    params,
    queryConfig,
    webSocketURL
  });
}

export function cancelTaskRun({ name, namespace }) {
  const payload = [
    { op: 'replace', path: '/spec/status', value: 'TaskRunCancelled' }
  ];

  const uri = getTektonAPI('taskruns', { name, namespace });
  return patch(uri, payload);
}

export function getTaskRunPayload({
  kind,
  labels,
  namespace,
  nodeSelector,
  params,
  serviceAccount,
  taskName,
  taskRunName = `${taskName ? `${taskName}-run` : 'run'}-${Date.now()}`,
  timeout
}) {
  const payload = {
    apiVersion: `tekton.dev/${getTektonPipelinesAPIVersion()}`,
    kind: 'TaskRun',
    metadata: {
      name: taskRunName,
      namespace
    },
    spec: {
      taskRef: {
        name: taskName,
        kind: kind || 'Task'
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

export function createTaskRun({
  kind,
  labels,
  namespace,
  nodeSelector,
  params,
  serviceAccount,
  taskName,
  taskRunName = `${taskName}-run-${Date.now()}`,
  timeout
}) {
  const payload = getTaskRunPayload({
    kind,
    labels,
    namespace,
    nodeSelector,
    params,
    serviceAccount,
    taskName,
    taskRunName,
    timeout
  });
  const uri = getTektonAPI('taskruns', { namespace });
  return post(uri, payload).then(({ body }) => body);
}

export function createTaskRunRaw({ namespace, payload }) {
  const uri = getTektonAPI('taskruns', { namespace });
  return post(uri, payload).then(({ body }) => body);
}

export function generateNewTaskRunPayload({ taskRun, rerun }) {
  const { annotations, labels, name, namespace, generateName } =
    taskRun.metadata;

  const payload = deepClone(taskRun);
  payload.apiVersion =
    payload.apiVersion || `tekton.dev/${getTektonPipelinesAPIVersion()}`;
  payload.kind = payload.kind || 'TaskRun';

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

export function rerunTaskRun(taskRun) {
  const { namespace, payload } = generateNewTaskRunPayload({
    taskRun,
    rerun: true
  });

  const uri = getTektonAPI('taskruns', { namespace });
  return post(uri, payload).then(({ body }) => body);
}
