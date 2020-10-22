/*
Copyright 2019-2020 The Tekton Authors
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

import {
  getGenerateNamePrefixForRerun,
  labels as labelConstants
} from '@tektoncd/dashboard-utils';
import deepClone from 'lodash.clonedeep';

import { deleteRequest, get, post, put } from './comms';
import { checkData, getQueryParams, getTektonAPI } from './utils';

export function deleteTaskRun({ name, namespace }) {
  const uri = getTektonAPI('taskruns', { name, namespace });
  return deleteRequest(uri);
}

export function getTaskRuns({ filters = [], namespace } = {}) {
  const uri = getTektonAPI('taskruns', { namespace }, getQueryParams(filters));
  return get(uri).then(checkData);
}

export function getTaskRun({ name, namespace }) {
  const uri = getTektonAPI('taskruns', { name, namespace });
  return get(uri);
}

export function cancelTaskRun({ name, namespace }) {
  return getTaskRun({ name, namespace }).then(taskRun => {
    taskRun.spec.status = 'TaskRunCancelled'; // eslint-disable-line
    const uri = getTektonAPI('taskruns', { name, namespace });
    return put(uri, taskRun);
  });
}

export function createTaskRun({
  namespace,
  taskName,
  kind,
  labels,
  params,
  resources,
  serviceAccount,
  timeout,
  nodeSelector
}) {
  const payload = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'TaskRun',
    metadata: {
      name: `${taskName}-run-${Date.now()}`,
      namespace,
      labels: {
        [labelConstants.TASK]: taskName,
        ...labels
      }
    },
    spec: {
      params: [],
      resources: {
        inputs: [],
        outputs: []
      },
      taskRef: {
        name: taskName,
        kind: kind || 'Task'
      }
    }
  };
  if (nodeSelector) {
    payload.spec.podTemplate = { nodeSelector };
  }
  if (params) {
    payload.spec.params = Object.keys(params).map(name => ({
      name,
      value: params[name]
    }));
  }
  if (resources && resources.inputs) {
    payload.spec.resources.inputs = Object.keys(resources.inputs).map(
      inputName => ({
        name: inputName,
        resourceRef: { name: resources.inputs[inputName] }
      })
    );
  }
  if (resources && resources.outputs) {
    payload.spec.resources.outputs = Object.keys(resources.outputs).map(
      outputName => ({
        name: outputName,
        resourceRef: { name: resources.outputs[outputName] }
      })
    );
  }
  if (serviceAccount) {
    payload.spec.serviceAccountName = serviceAccount;
  }
  if (timeout) {
    payload.spec.timeout = timeout;
  }
  const uri = getTektonAPI('taskruns', { namespace });
  return post(uri, payload).then(({ body }) => body);
}

export function rerunTaskRun(taskRun) {
  const { annotations, labels, name, namespace } = taskRun.metadata;

  const payload = deepClone(taskRun);
  payload.apiVersion = payload.apiVersion || 'tekton.dev/v1beta1';
  payload.kind = payload.kind || 'TaskRun';
  payload.metadata = {
    annotations,
    generateName: getGenerateNamePrefixForRerun(name),
    labels: {
      ...labels,
      reruns: name
    },
    namespace
  };

  delete payload.metadata.labels['tekton.dev/task'];

  delete payload.status;
  delete payload.spec?.status;

  const uri = getTektonAPI('taskruns', { namespace });
  return post(uri, payload).then(({ body }) => body);
}
