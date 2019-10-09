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

import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import {
  deleteRequest,
  get,
  patchAddSecret,
  patchRemoveSecret,
  post,
  put
} from './comms';

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

export function getResourcesAPI(
  { group, version, type, name = '', namespace },
  queryParams
) {
  return [
    apiRoot,
    `/proxy/apis/${group}/${version}/`,
    namespace && namespace !== ALL_NAMESPACES
      ? `namespaces/${encodeURIComponent(namespace)}/`
      : '',
    type,
    '/',
    encodeURIComponent(name),
    queryParams ? `?${new URLSearchParams(queryParams).toString()}` : ''
  ].join('');
}

export function getTektonAPI(type, { name = '', namespace } = {}, queryParams) {
  return getResourcesAPI(
    { group: 'tekton.dev', version: 'v1alpha1', type, name, namespace },
    queryParams
  );
}

export function getExtensionBaseURL(name) {
  return `${apiRoot}/v1/extensions/${name}`;
}

export function getExtensionBundleURL(name, bundlelocation) {
  return `${getExtensionBaseURL(name)}/${bundlelocation}`;
}

/* istanbul ignore next */
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

export function getPipelineRuns({ filters = [], namespace } = {}) {
  let queryParams;
  if (filters.length) {
    queryParams = { labelSelector: filters };
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

export function deletePipelineRun({ name, namespace }) {
  const uri = getTektonAPI('pipelineruns', { name, namespace });
  return deleteRequest(uri);
}

export function createPipelineResource({ namespace, resource } = {}) {
  const uri = getTektonAPI('pipelineresources', { namespace });
  return post(uri, resource);
}

export function createPipelineRun({
  namespace,
  pipelineName,
  resources,
  params,
  serviceAccount,
  timeout,
  labels
}) {
  // Create PipelineRun payload
  // expect params and resources to be objects with keys 'name' and values 'value'
  const payload = {
    apiVersion: 'tekton.dev/v1alpha1',
    kind: 'PipelineRun',
    metadata: {
      name: `${pipelineName}-run-${Date.now()}`,
      labels: {
        ...labels,
        'tekton.dev/pipeline': pipelineName,
        app: 'tekton-app'
      }
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

export function getTaskRuns({ filters = [], namespace } = {}) {
  let queryParams;
  if (filters.length) {
    queryParams = { labelSelector: filters };
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
  const queryParams = {
    fieldSelector: 'type=kubernetes.io/basic-auth'
  };
  const uri = getKubeAPI('secrets', { namespace }, queryParams);
  return get(uri);
}

export function getCredential(id, namespace) {
  const uri = getKubeAPI('secrets', { name: id, namespace });
  return get(uri);
}

export function createCredential({ id, ...rest }, namespace) {
  const uri = getKubeAPI('secrets', { namespace });
  return post(uri, { id, ...rest });
}

export function updateCredential({ id, ...rest }, namespace) {
  const uri = getKubeAPI('secrets', { name: id, namespace });
  return put(uri, { id, ...rest });
}

export function deleteCredential(id, namespace) {
  const uri = getKubeAPI('secrets', { name: id, namespace });
  return deleteRequest(uri);
}

export function getServiceAccount({ name, namespace }) {
  const uri = getKubeAPI('serviceaccounts', { name, namespace });
  return get(uri);
}

export async function patchServiceAccount({
  serviceAccountName,
  namespace,
  secretName
}) {
  const uri = getKubeAPI('serviceaccounts', {
    name: serviceAccountName,
    namespace
  });
  const patch1 = await patchAddSecret(uri, secretName);
  return patch1;
}

// Get list of service accounts where are secrets patched to, returns list of service accounts
export async function getSecretServiceAccountList(saList, secretName) {
  const secretServiceAccountList = [];

  if (saList.length > 0) {
    saList.forEach(element => {
      const saSecretList = element.secrets;
      saSecretList.forEach(element1 => {
        if (element1.name === secretName) {
          secretServiceAccountList.push(element);
        }
      });
    });
  }

  return secretServiceAccountList;
}

export function getIndexOfSecret(secrets, secretName) {
  return secrets.findIndex(({ name }) => name === secretName);
}

export async function getIndexAndRemove(sa, secretName, namespace) {
  const indexOfSecret = getIndexOfSecret(sa.secrets, secretName);
  // Should never be -1 as means the secret is not found
  if (indexOfSecret === -1) {
    const error = new Error('Impossible error with indexOfSecret');
    error.indexOfSecret = indexOfSecret;
    error.namespace = namespace;
    error.secretName = secretName;
    throw error;
  }

  const uri = getKubeAPI('serviceaccounts', {
    name: sa.metadata.name,
    namespace
  });

  const unpatchServiceAccount1 = await patchRemoveSecret(uri, indexOfSecret);
  return unpatchServiceAccount1;
}

export function getServiceAccounts({ namespace } = {}) {
  const uri = getKubeAPI('serviceaccounts', { namespace });
  return get(uri).then(checkData);
}

export async function unpatchServiceAccount(secretName, namespace) {
  const saList = await getServiceAccounts({ namespace });
  const secretSaList = await getSecretServiceAccountList(saList, secretName);

  secretSaList.forEach(async element => {
    await getIndexAndRemove(element, secretName, namespace);
  });
  return 'Completed unpatching';
}

export function getCustomResources(...args) {
  const uri = getResourcesAPI(...args);
  return get(uri).then(checkData);
}

export function getCustomResource(...args) {
  const uri = getResourcesAPI(...args);
  return get(uri);
}

export async function getExtensions() {
  const uri = `${apiRoot}/v1/extensions`;
  const resourceExtensionsUri = getResourcesAPI({
    group: 'dashboard.tekton.dev',
    version: 'v1alpha1',
    type: 'extensions'
  });
  let extensions = await get(uri);
  const resourceExtensions = await get(resourceExtensionsUri);
  extensions = (extensions || []).map(
    ({ bundlelocation, displayname, name, url }) => ({
      displayName: displayname,
      name,
      source: getExtensionBundleURL(name, bundlelocation),
      url
    })
  );
  return extensions.concat(
    ((resourceExtensions && resourceExtensions.items) || []).map(({ spec }) => {
      const { displayname: displayName, name } = spec;
      const [apiGroup, apiVersion] = spec.apiVersion.split('/');
      return {
        displayName,
        name,
        apiGroup,
        apiVersion,
        extensionType: 'kubernetes-resource'
      };
    })
  );
}

export function getNamespaces() {
  const uri = getKubeAPI('namespaces');
  return get(uri).then(checkData);
}

export function getInstallProperties() {
  const uri = `${apiRoot}/v1/properties`;
  return get(uri);
}

export function shouldDisplayLogout() {
  const routesUri = getResourcesAPI({
    group: 'route.openshift.io',
    version: 'v1'
  });
  return get(routesUri, { Accept: 'text/plain' });
}

export async function determineInstallNamespace() {
  const response = getInstallProperties()
    .then(installProps => {
      return installProps.InstallNamespace;
    })
    .catch(error => {
      throw error;
    });
  return response;
}
