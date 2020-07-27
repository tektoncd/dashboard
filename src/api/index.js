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

import { labels as labelConstants } from '@tektoncd/dashboard-utils';

import { get, post } from './comms';
import {
  apiRoot,
  checkData,
  getKubeAPI,
  getResourcesAPI,
  getTektonAPI
} from './utils';

export * from './clusterTasks';
export * from './clusterTriggerBindings';
export * from './conditions';
export * from './eventListeners';
export * from './extensions';
export * from './pipelineResources';
export * from './pipelineRuns';
export * from './pipelines';
export * from './secrets';
export * from './serviceAccounts';
export * from './taskRuns';
export * from './tasks';
export * from './triggerBindings';
export * from './triggerTemplates';

export function getCustomResources(...args) {
  const uri = getResourcesAPI(...args);
  return get(uri).then(checkData);
}

export function getCustomResource(...args) {
  const uri = getResourcesAPI(...args);
  return get(uri);
}

export function getInstallProperties() {
  const uri = `${apiRoot}/v1/properties`;
  return get(uri);
}

export function getNamespaces() {
  const uri = getKubeAPI('namespaces');
  return get(uri).then(checkData);
}

export function getPodLogURL({ container, name, namespace, follow }) {
  const queryParams = {
    ...(container && { container }),
    ...(follow && { follow })
  };
  const uri = `${getKubeAPI(
    'pods',
    { name, namespace, subResource: 'log' },
    queryParams
  )}`;
  return uri;
}

export function getPodLog({ container, name, namespace, stream }) {
  const uri = getPodLogURL({ container, name, namespace, follow: stream });
  return get(uri, { Accept: 'text/plain' }, { stream });
}

/* istanbul ignore next */
export function getWebSocketURL() {
  return `${apiRoot.replace(/^http/, 'ws')}/v1/websockets/resources`;
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
        [labelConstants.DASHBOARD_IMPORT]: 'true'
      }
    },
    spec: pipelineRunSpec
  };

  if (serviceAccount) {
    payload.spec.serviceAccountName = serviceAccount;
  }

  const uri = getTektonAPI('pipelineruns', { namespace: importerNamespace });
  return post(uri, payload).then(({ body }) => body);
}
