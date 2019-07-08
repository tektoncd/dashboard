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
import { ALL_NAMESPACES } from '../constants';

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

export function getKubeAPI(
  type,
  { name = '', namespace, subResource } = {},
  queryParams
) {
  return [
    apiRoot,
    '/proxy/api/v1/',
    namespace && namespace !== ALL_NAMESPACES
      ? `namespaces/${encodeURIComponent(namespace)}/`
      : '',
    type,
    '/',
    encodeURIComponent(name),
    subResource ? `/${subResource}` : '',
    queryParams ? `?${new URLSearchParams(queryParams).toString()}` : ''
  ].join('');
}

export function getTektonAPI(type, { name = '', namespace } = {}, queryParams) {
  return [
    apiRoot,
    '/proxy/apis/tekton.dev/v1alpha1/',
    namespace && namespace !== ALL_NAMESPACES
      ? `namespaces/${encodeURIComponent(namespace)}/`
      : '',
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

export function getWebSocketURL() {
  return `${apiRoot.replace(/^http/, 'ws')}/v1/websockets/resources`;
}

export function checkData(data) {
  if (data.items) {
    return data.items;
  }

  const error = new Error('Unable to retrieve data');
  error.data = data;
  throw error;
}

export function getPipelines({ namespace } = {}) {
  const uri = getTektonAPI('pipelines', { namespace });
  return get(uri).then(checkData);
}

export function getPipeline({ name, namespace }) {
  const uri = getTektonAPI('pipelines', { name, namespace });
  return get(uri);
}

export function getPipelineRuns({ namespace, pipelineName } = {}) {
  let queryParams;
  if (pipelineName) {
    queryParams = { labelSelector: `tekton.dev/pipeline=${pipelineName}` };
  }
  const uri = getTektonAPI('pipelineruns', { namespace }, queryParams);
  return get(uri).then(checkData);
}

export function getPipelineRun({ name, namespace }) {
  const uri = getTektonAPI('pipelineruns', { name, namespace });
  return get(uri);
}

export function cancelPipelineRun({ name, namespace }) {
  return getPipelineRun({ name, namespace }).then(pipelineRun => {
    pipelineRun.spec.status = 'PipelineRunCancelled'; // eslint-disable-line
    const uri = getTektonAPI('pipelineruns', { name, namespace });
    return put(uri, pipelineRun);
  });
}

export function createPipelineRun({ namespace, payload }) {
  const uri = getAPI('pipelineruns', { namespace });
  return post(uri, payload);
}

export function createPipelineRunAtProxy({
  namespace,
  pipelineName,
  resources,
  params,
  serviceAccount,
  timeout
}) {
  // Create PipelineRun payload
  // expect params and resources to be objects with keys 'name' and values 'value'
  const payload = {
    apiVersion: 'tekton.dev/v1alpha1',
    kind: 'PipelineRun',
    metadata: {
      name: `${pipelineName}-run-${Date.now()}`
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
      }))
    }
  };
  if (serviceAccount) {
    payload.spec.serviceAccount = serviceAccount;
  }
  if (timeout) {
    payload.spec.timeout = timeout;
  }
  const uri = getTektonAPI('pipelineruns', { namespace });
  return post(uri, payload);
}

export function getClusterTasks() {
  const uri = getTektonAPI('clustertasks');
  return get(uri).then(checkData);
}

export function getClusterTask({ name }) {
  const uri = getTektonAPI('clustertasks', { name });
  return get(uri);
}

export function getTasks({ namespace } = {}) {
  const uri = getTektonAPI('tasks', { namespace });
  return get(uri).then(checkData);
}

export function getTask({ name, namespace }) {
  const uri = getTektonAPI('tasks', { name, namespace });
  return get(uri);
}

export function getTaskRuns({ namespace, taskName } = {}) {
  let queryParams;
  if (taskName) {
    queryParams = { labelSelector: `tekton.dev/task=${taskName}` };
  }
  const uri = getTektonAPI('taskruns', { namespace }, queryParams);
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

export function getPipelineResources({ namespace } = {}) {
  const uri = getTektonAPI('pipelineresources', { namespace });
  return get(uri).then(checkData);
}

export function getPipelineResource({ name, namespace }) {
  const uri = getTektonAPI('pipelineresources', { name, namespace });
  return get(uri);
}

export function getPodLog({ container, name, namespace }) {
  let queryParams;
  if (container) {
    queryParams = { container };
  }
  const uri = `${getKubeAPI(
    'pods',
    { name, namespace, subResource: 'log' },
    queryParams
  )}`;
  return get(uri, { Accept: 'text/plain' });
}

export function rebuildPipelineRun(namespace, payload) {
  const uri = getAPI('rebuild', { namespace });
  return post(uri, payload);
}

export function getCredentials(namespace) {
  const uri = getAPI('credentials', { namespace });
  return get(uri);
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

export async function getExtensions() {
  const uri = `${apiRoot}/v1/extensions`;
  const extensions = await get(uri);
  return (extensions || []).map(
    ({ bundlelocation, displayname, name, url }) => ({
      displayName: displayname,
      name,
      source: getExtensionBundleURL(name, bundlelocation),
      url
    })
  );
}

export function getNamespaces() {
  const uri = getKubeAPI('namespaces');
  return get(uri).then(checkData);
}

export function getServiceAccounts({ namespace } = {}) {
  const uri = getKubeAPI('serviceaccounts', { namespace });
  return get(uri).then(checkData);
}

export function getInstallProperties() {
  const uri = `${apiRoot}/v1/properties`;
  return get(uri);
}
