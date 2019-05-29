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

export function getAPIRoot() {
  const { href, hash } = window.location;
  let baseURL = href.replace(hash, '');
  if (baseURL.endsWith('/')) {
    baseURL = baseURL.slice(0, -1);
  }
  return baseURL;
}

const apiRoot = getAPIRoot();

export function getAPI(type, { name = '', namespace } = {}, queryParams) {
  return [
    apiRoot,
    '/v1/namespaces/',
    encodeURIComponent(namespace),
    '/',
    type,
    '/',
    encodeURIComponent(name),
    queryParams ? `?${new URLSearchParams(queryParams).toString()}` : ''
  ].join('');
}

export function getExtensionBaseURL(name) {
  return `${apiRoot}/v1/extensions/${name}`;
}

export function getExtensionBundleURL(name, bundlelocation) {
  return `${getExtensionBaseURL(name)}/${bundlelocation}`;
}

export function checkData(data) {
  if (data.items) {
    return data.items;
  }

  const error = new Error('Unable to retrieve data');
  error.data = data;
  throw error;
}

export function getPipelines(namespace) {
  const uri = getAPI('pipelines', { namespace });
  return get(uri).then(checkData);
}

export function getPipeline(name, namespace) {
  const uri = getAPI('pipelines', { name, namespace });
  return get(uri);
}

export function getPipelineRuns(namespace, pipelineName) {
  let queryParams;
  if (pipelineName) {
    queryParams = { name: pipelineName };
  }
  const uri = getAPI('pipelineruns', { namespace }, queryParams);
  return get(uri).then(checkData);
}

export function getPipelineRun(name, namespace) {
  const uri = getAPI('pipelineruns', { name, namespace });
  return get(uri);
}

export function cancelPipelineRun(name, namespace) {
  const uri = getAPI('pipelineruns', { name, namespace });
  return put(uri, { status: 'PipelineRunCancelled' });
}

export function getTasks(namespace) {
  const uri = getAPI('tasks', { namespace });
  return get(uri).then(checkData);
}

export function getTask(name, namespace) {
  const uri = getAPI('tasks', { name, namespace });
  return get(uri);
}

export function getTaskRuns(namespace, taskName) {
  let queryParams;
  if (taskName) {
    queryParams = { name: taskName };
  }
  const uri = getAPI('taskruns', { namespace }, queryParams);
  return get(uri).then(checkData);
}

export function getTaskRun(name, namespace) {
  const uri = getAPI('taskruns', { name, namespace });
  return get(uri);
}

export function getPipelineResources(namespace) {
  const uri = getAPI('pipelineresources', { namespace });
  return get(uri).then(checkData);
}

export function getPipelineResource(name, namespace) {
  const uri = getAPI('pipelineresources', { name, namespace });
  return get(uri);
}

export function getPodLog(name, namespace) {
  const uri = getAPI('logs', { name, namespace });
  return get(uri);
}

export function getTaskRunLog(name, namespace) {
  const uri = getAPI('taskrunlogs', { name, namespace });
  return get(uri);
}

export function createPipelineRun(params, namespace) {
  const uri = getAPI('pipelineruns', { namespace });
  return post(uri, params);
}

export function getCredentials(namespace) {
  const uri = getAPI('credentials', { namespace });
  return get(uri).then(checkData);
}

export function getCredential(id, namespace) {
  const uri = getAPI('credentials', { name: id, namespace });
  return get(uri);
}

export function createCredential({ id, ...rest }, namespace) {
  const uri = getAPI('credentials', { namespace });
  return post(uri, { id, ...rest });
}

export function updateCredential({ id, ...rest }, namespace) {
  const uri = getAPI('credentials', { name: id, namespace });
  return put(uri, { id, ...rest });
}

export function deleteCredential(id, namespace) {
  const uri = getAPI('credentials', { name: id, namespace });
  return deleteRequest(uri);
}

export function getExtensions() {
  const uri = `${apiRoot}/v1/extensions`;
  return get(uri);
}

export function getNamespaces() {
  const uri = `${apiRoot}/v1/namespaces`;
  return get(uri).then(checkData);
}

export function getServiceAccounts(namespace) {
  const uri = getAPI('serviceaccounts', { namespace });
  return get(uri).then(checkData);
}
