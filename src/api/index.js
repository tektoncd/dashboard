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

import { useQuery } from 'react-query';
import { labels as labelConstants } from '@tektoncd/dashboard-utils';

import { useClusterTask } from './clusterTasks';
import { useTask } from './tasks';
import { get, post } from './comms';
import {
  apiRoot,
  checkData,
  getKubeAPI,
  getQueryParams,
  getResourcesAPI,
  getTektonAPI,
  isLogTimestampsEnabled,
  useCollection,
  useResource
} from './utils';

export {
  NamespaceContext,
  useSelectedNamespace,
  WebSocketContext
} from './utils';
export * from './clusterInterceptors';
export * from './clusterTasks';
export * from './clusterTriggerBindings';
export * from './conditions';
export * from './eventListeners';
export * from './extensions';
export * from './pipelineResources';
export * from './pipelineRuns';
export * from './pipelines';
export * from './serviceAccounts';
export * from './taskRuns';
export * from './tasks';
export * from './triggerBindings';
export * from './triggers';
export * from './triggerTemplates';

export function getCustomResources({ filters = [], ...rest }) {
  const uri = getResourcesAPI(rest, getQueryParams(filters));
  return get(uri).then(checkData);
}

export function getCustomResource(params) {
  const uri = getResourcesAPI(params);
  return get(uri);
}

export function useCustomResource(params) {
  return useResource('customResource', getCustomResource, params);
}

export function useTaskByKind({ kind, ...rest }, queryConfig) {
  if (kind === 'ClusterTask') {
    return useClusterTask({ ...rest }, queryConfig);
  }
  return useTask({ ...rest }, queryConfig);
}

export async function getInstallProperties() {
  const uri = `${apiRoot}/v1/properties`;
  let data;
  try {
    data = await get(uri);
  } catch (error) {
    if (error?.response?.status === 404) {
      data = {
        dashboardNamespace: 'N/A',
        dashboardVersion: 'kubectl-proxy-client',
        isReadOnly: false,
        pipelinesNamespace: 'Unknown',
        pipelinesVersion: 'Unknown',
        triggersNamespace: 'Unknown',
        triggersVersion: 'Unknown'
      };
    }
  }
  return data;
}

export function getNamespaces() {
  const uri = getKubeAPI('namespaces');
  return get(uri).then(checkData);
}

export function useNamespaces(queryConfig) {
  return useCollection('Namespace', getNamespaces, null, {
    select: namespaces => namespaces.map(namespace => namespace.metadata.name),
    ...queryConfig
  });
}

export function getPodLogURL({ container, name, namespace, follow }) {
  const timestamps = isLogTimestampsEnabled();
  const queryParams = {
    ...(container && { container }),
    ...(follow && { follow }),
    ...(timestamps && { timestamps })
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
  return get(uri, { Accept: 'text/plain,*/*' }, { stream });
}

/* istanbul ignore next */
export function getWebSocketURL() {
  return `${apiRoot.replace(/^http/, 'ws')}/v1/websockets/resources`;
}

export function importResources({
  importerNamespace,
  labels,
  method,
  namespace,
  path,
  repositoryURL,
  revision,
  serviceAccount
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
        name: 'path',
        description: 'The path from which resources are to be imported',
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
        name: 'import',
        image: 'lachlanevenson/k8s-kubectl:latest',
        command: ['kubectl'],
        args: [
          method,
          '-f',
          '$(resources.inputs.git-source.path)/$(params.path)',
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
        name: 'path',
        description: 'The path from which resources are to be imported',
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
            name: 'path',
            value: '$(params.path)'
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
      revision
        ? {
            name: 'revision',
            value: revision
          }
        : null
    ].filter(Boolean)
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
        name: 'path',
        value: path
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

export function getAPIResource({ group, version, type }) {
  const uri = [
    apiRoot,
    group === 'core'
      ? `/proxy/api/${version}`
      : `/proxy/apis/${group}/${version}`
  ].join('');

  return get(uri).then(({ resources }) =>
    resources.find(({ name }) => name === type)
  );
}

export function useProperties() {
  return useQuery('properties', getInstallProperties, {
    placeholderData: { isReadOnly: true }
  });
}

export function useDashboardNamespace() {
  const { data } = useProperties();
  return data.dashboardNamespace;
}

export function useExternalLogsURL() {
  const { data } = useProperties();
  return data.externalLogsURL;
}

export function useIsLogStreamingEnabled() {
  const { data } = useProperties();
  return data.streamLogs;
}

export function useIsReadOnly() {
  const { data } = useProperties();
  return data.isReadOnly;
}

export function useIsTriggersInstalled() {
  const { data } = useProperties();
  return !!(data.triggersNamespace && data.triggersVersion);
}

export function useLogoutURL() {
  const { data } = useProperties();
  return data.logoutURL;
}

export function useTenantNamespace() {
  const { data } = useProperties();
  return data.tenantNamespace;
}
