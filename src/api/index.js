/*
Copyright 2019 The Tekton Authors
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

import { deleteRequest, get, post, put } from './comms';

const apiRoot = '/api';

export function getAPI(type, id = '', namespace = 'default') {
  return [
    apiRoot,
    '/v1/namespaces/',
    encodeURIComponent(namespace),
    '/',
    type,
    '/',
    encodeURIComponent(id)
  ].join('');
}

export function checkData(data) {
  if (data.items) {
    return data.items;
  }

  const error = new Error('Unable to retrieve data');
  error.data = data;
  throw error;
}

export function getPipelines() {
  const uri = getAPI('pipeline');
  return get(uri).then(checkData);
}

export function getPipeline(name) {
  const uri = getAPI('pipeline', name);
  return get(uri);
}

export function getPipelineRuns() {
  const uri = getAPI('pipelinerun');
  return get(uri).then(checkData);
}

export function getPipelineRun(name) {
  const uri = getAPI('pipelinerun', name);
  return get(uri);
}

export function cancelPipelineRun(name) {
  const uri = getAPI('pipelinerun', name);
  return put(uri, { status: 'PipelineRunCancelled' });
}

export function getTasks() {
  const uri = getAPI('task');
  return get(uri).then(checkData);
}

export function getTask(name) {
  const uri = getAPI('task', name);
  return get(uri);
}

export function getTaskRuns() {
  const uri = getAPI('taskrun');
  return get(uri).then(checkData);
}

export function getTaskRun(name) {
  const uri = getAPI('taskrun', name);
  return get(uri);
}

export function getPipelineResources() {
  const uri = getAPI('pipelineresource');
  return get(uri).then(checkData);
}

export function getPipelineResource(name) {
  const uri = getAPI('pipelineresource', name);
  return get(uri);
}

export function getPodLog(name) {
  const uri = getAPI('log', name);
  return get(uri);
}

export function getTaskRunLog(name) {
  const uri = getAPI('taskrunlog', name);
  return get(uri);
}

export function createPipelineRun(payload) {
  const uri = `${apiRoot}/`;
  return post(uri, payload);
}

export function getCredentials() {
  const uri = getAPI('credentials');
  return get(uri).then(checkData);
}

export function getCredential(id) {
  const uri = getAPI('credentials', id);
  return get(uri);
}

export function createCredential({ id, ...rest }) {
  const uri = getAPI('credentials');
  return post(uri, { id, ...rest });
}

export function updateCredential({ id, ...rest }) {
  const uri = getAPI('credentials', id);
  return put(uri, { id, ...rest });
}

export function deleteCredential(id) {
  const uri = getAPI('credentials', id);
  return deleteRequest(uri);
}
