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

import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import {
  deleteRequest,
  get,
  getAPIRoot,
  patchAddSecret,
  patchUpdateSecrets,
  post,
  put
} from './comms';

const tektonAPIGroup = 'tekton.dev';
const triggersAPIGroup = 'triggers.tekton.dev';

const apiRoot = getAPIRoot();

function getQueryParams(filters) {
  if (filters.length) {
    return { labelSelector: filters };
  }
  return '';
}

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

export function getTektonAPI(
  type,
  { group = tektonAPIGroup, name = '', namespace, version = 'v1beta1' } = {},
  queryParams
) {
  return getResourcesAPI(
    { group, version, type, name, namespace },
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

export function getPipelines({ filters = [], namespace } = {}) {
  const uri = getTektonAPI('pipelines', { namespace }, getQueryParams(filters));
  return get(uri).then(checkData);
}

export function getPipeline({ name, namespace }) {
  const uri = getTektonAPI('pipelines', { name, namespace });
  return get(uri);
}

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

export function deleteTaskRun({ name, namespace }) {
  const uri = getTektonAPI('taskruns', { name, namespace });
  return deleteRequest(uri);
}

export function createPipelineResource({ namespace, resource } = {}) {
  const uri = getTektonAPI('pipelineresources', {
    namespace,
    version: 'v1alpha1'
  });
  return post(uri, resource);
}

export function deletePipelineResource({ name, namespace } = {}) {
  const uri = getTektonAPI('pipelineresources', {
    name,
    namespace,
    version: 'v1alpha1'
  });
  return deleteRequest(uri, name);
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
    apiVersion: 'tekton.dev/v1beta1',
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
    payload.spec.serviceAccountName = serviceAccount;
  }
  if (timeout) {
    payload.spec.timeout = timeout;
  }
  const uri = getTektonAPI('pipelineruns', { namespace });
  return post(uri, payload);
}

export function getClusterTasks({ filters = [] } = {}) {
  const uri = getTektonAPI('clustertasks', undefined, getQueryParams(filters));
  return get(uri).then(checkData);
}

export function getClusterTask({ name }) {
  const uri = getTektonAPI('clustertasks', { name });
  return get(uri);
}

export function getTasks({ filters = [], namespace } = {}) {
  const uri = getTektonAPI('tasks', { namespace }, getQueryParams(filters));
  return get(uri).then(checkData);
}

export function getTask({ name, namespace }) {
  const uri = getTektonAPI('tasks', { name, namespace });
  return get(uri);
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

export function getPipelineResources({ filters = [], namespace } = {}) {
  const uri = getTektonAPI(
    'pipelineresources',
    { namespace, version: 'v1alpha1' },
    getQueryParams(filters)
  );
  return get(uri).then(checkData);
}

export function getPipelineResource({ name, namespace }) {
  const uri = getTektonAPI(
    'pipelineresources',
    {
      name,
      namespace,
      version: 'v1alpha1'
    },
    undefined
  );
  return get(uri);
}

export function getConditions({ filters = [], namespace } = {}) {
  const uri = getTektonAPI(
    'conditions',
    { namespace, version: 'v1alpha1' },
    getQueryParams(filters)
  );
  return get(uri).then(checkData);
}

export function getCondition({ name, namespace }) {
  const uri = getTektonAPI('conditions', {
    name,
    namespace,
    version: 'v1alpha1'
  });
  return get(uri);
}

export function getPodLogURL({ container, name, namespace }) {
  let queryParams;
  if (container) {
    queryParams = { container };
  }
  const uri = `${getKubeAPI(
    'pods',
    { name, namespace, subResource: 'log' },
    queryParams
  )}`;
  return uri;
}

export function getPodLog({ container, name, namespace }) {
  const uri = getPodLogURL({ container, name, namespace });
  return get(uri, { Accept: 'text/plain' });
}

export function rerunPipelineRun(namespace, payload) {
  const uri = getAPI('rerun', { namespace });
  return post(uri, payload);
}

export function getCredentials({ namespace } = {}) {
  const uri = getKubeAPI('secrets', { namespace });
  return get(uri).then(checkData);
}

export function getAllCredentials(namespace) {
  const uri = getKubeAPI('secrets', namespace);
  return get(uri);
}

export function getCredential(name, namespace) {
  const uri = getKubeAPI('secrets', name, namespace);
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

// Use this for unpatching ServiceAccounts
export async function updateServiceAccountSecrets(
  sa,
  namespace,
  secretsToKeep
) {
  const uri = getKubeAPI('serviceaccounts', {
    name: sa.metadata.name,
    namespace
  });
  return patchUpdateSecrets(uri, secretsToKeep);
}

export function getServiceAccounts({ namespace } = {}) {
  const uri = getKubeAPI('serviceaccounts', { namespace });
  return get(uri).then(checkData);
}

export function getCustomResources(...args) {
  const uri = getResourcesAPI(...args);
  return get(uri).then(checkData);
}

export function getCustomResource(...args) {
  const uri = getResourcesAPI(...args);
  return get(uri);
}

export async function getExtensions({ namespace } = {}) {
  const uri = `${apiRoot}/v1/extensions`;
  const resourceExtensionsUri = getResourcesAPI({
    group: 'dashboard.tekton.dev',
    version: 'v1alpha1',
    type: 'extensions',
    namespace
  });
  let extensions = await get(uri);
  const resourceExtensions = await get(resourceExtensionsUri);
  extensions = (extensions || []).map(
    ({ bundlelocation, displayname, name }) => ({
      displayName: displayname,
      name,
      source: getExtensionBundleURL(name, bundlelocation)
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

export function getTriggerTemplates({ filters = [], namespace } = {}) {
  const uri = getTektonAPI(
    'triggertemplates',
    { group: triggersAPIGroup, namespace, version: 'v1alpha1' },
    getQueryParams(filters)
  );
  return get(uri).then(checkData);
}

export function getTriggerTemplate({ name, namespace }) {
  const uri = getTektonAPI('triggertemplates', {
    group: triggersAPIGroup,
    name,
    namespace,
    version: 'v1alpha1'
  });
  return get(uri);
}

export function getTriggerBindings({ filters = [], namespace } = {}) {
  const uri = getTektonAPI(
    'triggerbindings',
    { group: triggersAPIGroup, namespace, version: 'v1alpha1' },
    getQueryParams(filters)
  );
  return get(uri).then(checkData);
}

export function getClusterTriggerBindings({ filters = [] } = {}) {
  const uri = getTektonAPI(
    'clustertriggerbindings',
    { group: triggersAPIGroup, version: 'v1alpha1' },
    getQueryParams(filters)
  );
  return get(uri).then(checkData);
}

export function getTriggerBinding({ name, namespace }) {
  const uri = getTektonAPI('triggerbindings', {
    group: triggersAPIGroup,
    name,
    namespace,
    version: 'v1alpha1'
  });
  return get(uri);
}

export function getClusterTriggerBinding({ name }) {
  const uri = getTektonAPI('clustertriggerbindings', {
    group: triggersAPIGroup,
    name,
    version: 'v1alpha1'
  });
  return get(uri);
}

export function getEventListeners({ filters = [], namespace } = {}) {
  const uri = getTektonAPI(
    'eventlisteners',
    { group: triggersAPIGroup, namespace, version: 'v1alpha1' },
    getQueryParams(filters)
  );
  return get(uri).then(checkData);
}

export function getEventListener({ name, namespace }) {
  const uri = getTektonAPI('eventlisteners', {
    group: triggersAPIGroup,
    name,
    namespace,
    version: 'v1alpha1'
  });
  return get(uri);
}

export function createTaskRun({
  namespace,
  taskName,
  kind,
  labels,
  params,
  resources,
  serviceAccount,
  timeout
}) {
  const payload = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'TaskRun',
    metadata: {
      name: `${taskName}-run-${Date.now()}`,
      namespace,
      labels: {
        'tekton.dev/task': taskName,
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
  return post(uri, payload);
}

export function importResources({
  repositoryURL,
  applyDirectory,
  namespace,
  labels,
  serviceAccount,
  importerNamespace
}) {
  const taskSpec = {
    resources: {
      inputs: [
        {
          name: 'git-source',
          type: 'git'
        }
      ]
    },
    params: [
      {
        name: 'pathToResourceFiles',
        description: 'The path to the resource files to apply',
        default: '/workspace/git-source',
        type: 'string'
      },
      {
        name: 'apply-directory',
        description: 'The directory from which resources are to be applied',
        default: '.',
        type: 'string'
      },
      {
        name: 'target-namespace',
        description:
          'The namespace in which to create the resources being imported',
        default: 'tekton-pipelines',
        type: 'string'
      }
    ],
    steps: [
      {
        name: 'kubectl-apply',
        image: 'lachlanevenson/k8s-kubectl:latest',
        command: ['kubectl'],
        args: [
          'apply',
          '-f',
          '$(params.pathToResourceFiles)/$(params.apply-directory)',
          '-n',
          '$(params.target-namespace)'
        ]
      }
    ]
  };

  const pipelineSpec = {
    resources: [
      {
        name: 'git-source',
        type: 'git'
      }
    ],
    params: [
      {
        name: 'pathToResourceFiles',
        description: 'The path to the resource files to apply',
        default: '/workspace/git-source',
        type: 'string'
      },
      {
        name: 'apply-directory',
        description: 'The directory from which resources are to be applied',
        default: '.',
        type: 'string'
      },
      {
        name: 'target-namespace',
        description:
          'The namespace in which to create the resources being imported',
        default: 'tekton-pipelines',
        type: 'string'
      }
    ],
    tasks: [
      {
        name: 'import-resources',
        taskSpec,
        params: [
          {
            name: 'pathToResourceFiles',
            value: '$(params.pathToResourceFiles)'
          },
          {
            name: 'apply-directory',
            value: '$(params.apply-directory)'
          },
          {
            name: 'target-namespace',
            value: '$(params.target-namespace)'
          }
        ],
        resources: {
          inputs: [
            {
              name: 'git-source',
              resource: 'git-source'
            }
          ]
        }
      }
    ]
  };

  const resourceSpec = {
    type: 'git',
    params: [
      {
        name: 'url',
        value: repositoryURL
      },
      {
        name: 'revision',
        value: 'master'
      }
    ]
  };

  const pipelineRunSpec = {
    pipelineSpec,
    resources: [
      {
        name: 'git-source',
        resourceSpec
      }
    ],
    params: [
      {
        name: 'apply-directory',
        value: applyDirectory
      },
      {
        name: 'target-namespace',
        value: namespace
      }
    ]
  };

  const payload = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    metadata: {
      name: `import-resources-${Date.now()}`,
      labels: {
        ...labels,
        app: 'tekton-app',
        'dashboard.tekton.dev/import': 'true'
      }
    },
    spec: pipelineRunSpec
  };

  if (serviceAccount) {
    payload.spec.serviceAccountName = serviceAccount;
  }

  const uri = getTektonAPI('pipelineruns', { namespace: importerNamespace });
  return post(uri, payload);
}
