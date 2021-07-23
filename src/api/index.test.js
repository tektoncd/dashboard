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

import fetchMock from 'fetch-mock';
import { renderHook } from '@testing-library/react-hooks';
import { labels } from '@tektoncd/dashboard-utils';

import { getAPIWrapper, getQueryClient } from '../utils/test';

import * as API from '.';
import * as ClusterTasksAPI from './clusterTasks';
import * as TasksAPI from './tasks';
import * as utils from './utils';

it('getCustomResource', () => {
  const group = 'testgroup';
  const version = 'testversion';
  const type = 'testtype';
  const name = 'testresource';
  const namespace = 'testnamespace';
  const data = { fake: 'resourcedata' };
  fetchMock.get(`end:${name}`, data);
  return API.getCustomResource({ group, version, type, namespace, name }).then(
    resource => {
      expect(resource).toEqual(data);
      fetchMock.restore();
    }
  );
});

it('getCustomResources', () => {
  const group = 'testgroup';
  const version = 'testversion';
  const type = 'testtype';
  const namespace = 'testnamespace';
  const data = { items: 'resourcedata' };
  fetchMock.get(`end:${type}/`, data);
  return API.getCustomResources({ group, version, type, namespace }).then(
    resources => {
      expect(resources).toEqual(data.items);
      fetchMock.restore();
    }
  );
});

it('useCustomResource', () => {
  const params = { fake: 'params' };
  const query = { fake: 'query' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  const returnValue = API.useCustomResource(params);

  expect(utils.useResource).toHaveBeenCalledWith(
    'customResource',
    API.getCustomResource,
    params
  );
  expect(returnValue).toEqual(query);
});

it('useTaskByKind', () => {
  const params = { fake: 'params' };
  const clusterTaskQuery = { fake: 'clusterTaskQuery' };
  const taskQuery = { fake: 'taskQuery' };
  jest
    .spyOn(ClusterTasksAPI, 'useClusterTask')
    .mockImplementation(() => clusterTaskQuery);
  jest.spyOn(TasksAPI, 'useTask').mockImplementation(() => taskQuery);

  let returnValue = API.useTaskByKind({ ...params, kind: 'ClusterTask' });
  expect(ClusterTasksAPI.useClusterTask).toHaveBeenCalledWith(
    expect.objectContaining(params),
    undefined
  );
  expect(ClusterTasksAPI.useClusterTask).not.toHaveBeenCalledWith(
    expect.objectContaining({ kind: expect.any(String) }),
    undefined
  );
  expect(TasksAPI.useTask).not.toHaveBeenCalled();
  expect(returnValue).toEqual(clusterTaskQuery);
  API.useClusterTask.mockClear();

  returnValue = API.useTaskByKind({ ...params, kind: 'Task' });
  expect(ClusterTasksAPI.useClusterTask).not.toHaveBeenCalled();
  expect(TasksAPI.useTask).toHaveBeenCalledWith(
    expect.objectContaining(params),
    undefined
  );
  expect(TasksAPI.useTask).not.toHaveBeenCalledWith(
    expect.objectContaining({ kind: expect.any(String) }),
    undefined
  );
  expect(returnValue).toEqual(taskQuery);
});

it('getNamespaces returns the correct data', () => {
  const data = {
    items: 'namespaces'
  };
  fetchMock.get(/namespaces/, data);
  return API.getNamespaces().then(response => {
    expect(response).toEqual(data.items);
    fetchMock.restore();
  });
});

it('useNamespaces', async () => {
  const namespaces = {
    items: [
      { metadata: { name: 'namespace1' } },
      { metadata: { name: 'namespace2' } }
    ]
  };
  fetchMock.get(/namespaces/, namespaces);
  const { result, waitFor } = renderHook(() => API.useNamespaces(), {
    wrapper: getAPIWrapper()
  });
  await waitFor(() => result.current.isFetching);
  await waitFor(() => !result.current.isFetching);
  expect(result.current.data).toEqual(['namespace1', 'namespace2']);
  fetchMock.restore();
});

it('getPodLog', () => {
  const namespace = 'default';
  const name = 'foo';
  const data = 'logs';
  const responseConfig = {
    body: data,
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  };
  fetchMock.get(`end:${name}/log`, responseConfig, {
    sendAsJson: false
  });
  return API.getPodLog({ name, namespace }).then(log => {
    expect(log).toEqual(data);
    fetchMock.restore();
  });
});

it('getPodLog with container name', () => {
  const namespace = 'default';
  const name = 'foo';
  const container = 'containerName';
  const data = 'logs';
  const responseConfig = {
    body: data,
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  };
  fetchMock.get(`end:${name}/log?container=${container}`, responseConfig, {
    sendAsJson: false
  });
  return API.getPodLog({ container, name, namespace }).then(log => {
    expect(log).toEqual(data);
    fetchMock.restore();
  });
});

it('importResources', () => {
  const mockDateNow = jest
    .spyOn(Date, 'now')
    .mockImplementation(() => 'fake-timestamp');
  const importerNamespace = 'fake-importer-namespace';
  const method = 'apply';
  const namespace = 'fake-namespace';
  const path = 'fake-directory';
  const repositoryURL = 'https://github.com/test/testing';
  const serviceAccount = 'fake-serviceAccount';

  const payload = {
    importerNamespace,
    method,
    namespace,
    path,
    repositoryURL,
    serviceAccount
  };
  const data = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    metadata: {
      name: `import-resources-${Date.now()}`,
      labels: {
        app: 'tekton-app',
        [labels.DASHBOARD_IMPORT]: 'true'
      }
    },
    spec: {
      params: [
        {
          name: 'path',
          value: 'fake-directory'
        },
        {
          name: 'target-namespace',
          value: 'fake-namespace'
        }
      ],
      pipelineSpec: {
        params: [
          {
            default: '.',
            description: 'The path from which resources are to be imported',
            name: 'path',
            type: 'string'
          },
          {
            default: 'tekton-pipelines',
            description:
              'The namespace in which to create the resources being imported',
            name: 'target-namespace',
            type: 'string'
          }
        ],
        resources: [
          {
            name: 'git-source',
            type: 'git'
          }
        ],
        tasks: [
          {
            name: 'import-resources',
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
            },
            taskSpec: {
              params: [
                {
                  default: '.',
                  description:
                    'The path from which resources are to be imported',
                  name: 'path',
                  type: 'string'
                },
                {
                  default: 'tekton-pipelines',
                  description:
                    'The namespace in which to create the resources being imported',
                  name: 'target-namespace',
                  type: 'string'
                }
              ],
              resources: {
                inputs: [
                  {
                    name: 'git-source',
                    type: 'git'
                  }
                ]
              },
              steps: [
                {
                  args: [
                    method,
                    '-f',
                    '$(resources.inputs.git-source.path)/$(params.path)',
                    '-n',
                    '$(params.target-namespace)'
                  ],
                  command: ['kubectl'],
                  image: 'lachlanevenson/k8s-kubectl:latest',
                  name: 'import'
                }
              ]
            }
          }
        ]
      },
      resources: [
        {
          name: 'git-source',
          resourceSpec: {
            params: [
              {
                name: 'url',
                value: 'https://github.com/test/testing'
              }
            ],
            type: 'git'
          }
        }
      ],
      serviceAccountName: serviceAccount
    }
  };

  fetchMock.post('*', { body: data, status: 201 });
  return API.importResources(payload).then(response => {
    expect(response).toEqual(data);
    expect(JSON.parse(fetchMock.lastOptions().body)).toMatchObject(data);
    fetchMock.restore();
    mockDateNow.mockRestore();
  });
});

it('importResources with revision and no serviceAccount', () => {
  const mockDateNow = jest
    .spyOn(Date, 'now')
    .mockImplementation(() => 'fake-timestamp');
  const importerNamespace = 'fake-importer-namespace';
  const method = 'apply';
  const namespace = 'fake-namespace';
  const path = 'fake-directory';
  const repositoryURL = 'https://github.com/test/testing';
  const revision = 'some_git_revision';

  const payload = {
    importerNamespace,
    method,
    namespace,
    path,
    repositoryURL,
    revision
  };
  const data = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    metadata: {
      name: `import-resources-${Date.now()}`,
      labels: {
        app: 'tekton-app',
        [labels.DASHBOARD_IMPORT]: 'true'
      }
    },
    spec: {
      params: [
        {
          name: 'path',
          value: 'fake-directory'
        },
        {
          name: 'target-namespace',
          value: 'fake-namespace'
        }
      ],
      pipelineSpec: {
        params: [
          {
            default: '.',
            description: 'The path from which resources are to be imported',
            name: 'path',
            type: 'string'
          },
          {
            default: 'tekton-pipelines',
            description:
              'The namespace in which to create the resources being imported',
            name: 'target-namespace',
            type: 'string'
          }
        ],
        resources: [
          {
            name: 'git-source',
            type: 'git'
          }
        ],
        tasks: [
          {
            name: 'import-resources',
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
            },
            taskSpec: {
              params: [
                {
                  default: '.',
                  description:
                    'The path from which resources are to be imported',
                  name: 'path',
                  type: 'string'
                },
                {
                  default: 'tekton-pipelines',
                  description:
                    'The namespace in which to create the resources being imported',
                  name: 'target-namespace',
                  type: 'string'
                }
              ],
              resources: {
                inputs: [
                  {
                    name: 'git-source',
                    type: 'git'
                  }
                ]
              },
              steps: [
                {
                  args: [
                    method,
                    '-f',
                    '$(resources.inputs.git-source.path)/$(params.path)',
                    '-n',
                    '$(params.target-namespace)'
                  ],
                  command: ['kubectl'],
                  image: 'lachlanevenson/k8s-kubectl:latest',
                  name: 'import'
                }
              ]
            }
          }
        ]
      },
      resources: [
        {
          name: 'git-source',
          resourceSpec: {
            params: [
              {
                name: 'url',
                value: 'https://github.com/test/testing'
              },
              {
                name: 'revision',
                value: revision
              }
            ],
            type: 'git'
          }
        }
      ]
    }
  };

  fetchMock.post('*', { body: data, status: 201 });
  return API.importResources(payload).then(response => {
    expect(response).toEqual(data);
    expect(JSON.parse(fetchMock.lastOptions().body)).toMatchObject(data);
    fetchMock.restore();
    mockDateNow.mockRestore();
  });
});

describe('getAPIResource', () => {
  it('handles non-core group', () => {
    const group = 'testgroup';
    const version = 'testversion';
    const type = 'testtype';
    const apiResource = { name: type };
    const data = { resources: [apiResource] };
    fetchMock.get(`end:/proxy/apis/${group}/${version}`, data);
    return API.getAPIResource({ group, version, type }).then(resource => {
      expect(resource).toEqual(apiResource);
      fetchMock.restore();
    });
  });

  it('handles core group', () => {
    const group = 'core';
    const version = 'testversion';
    const type = 'testtype';
    const apiResource = { name: type };
    const data = { resources: [apiResource] };
    fetchMock.get(`end:/proxy/api/${version}`, data);
    return API.getAPIResource({ group, version, type }).then(resource => {
      expect(resource).toEqual(apiResource);
      fetchMock.restore();
    });
  });
});

describe('getInstallProperties', () => {
  it('returns expected data', async () => {
    const data = { fake: 'properties' };
    fetchMock.get(/properties/, data);
    const properties = await API.getInstallProperties();
    expect(properties).toEqual(data);
    fetchMock.restore();
  });

  it('handles error in case of Dashboard client mode', async () => {
    const error = new Error();
    error.response = {
      status: 404
    };
    fetchMock.get(/properties/, { throws: error });
    const properties = await API.getInstallProperties();
    expect(properties.dashboardVersion).toEqual('kubectl-proxy-client');
    fetchMock.restore();
  });

  it('handles unexpected errors', async () => {
    const error = new Error();
    fetchMock.get(/properties/, { throws: error });
    const properties = await API.getInstallProperties();
    expect(properties).toBeUndefined();
    fetchMock.restore();
  });
});

it('useProperties', async () => {
  const properties = { fake: 'properties' };
  fetchMock.get(/properties/, properties);
  const { result, waitFor } = renderHook(() => API.useProperties(), {
    wrapper: getAPIWrapper()
  });
  await waitFor(() => result.current.isFetching);
  await waitFor(() => !result.current.isFetching);
  expect(result.current.data).toEqual(properties);
  fetchMock.restore();
});

it('other hooks that depend on useProperties', async () => {
  const queryClient = getQueryClient();

  const dashboardNamespace = 'fake_dashboardNamespace';
  const externalLogsURL = 'fake_externalLogsURL';
  const isReadOnly = 'fake_isReadOnly';
  const logoutURL = 'fake_logoutURL';
  const streamLogs = 'fake_streamLogs';
  const tenantNamespace = 'fake_tenantNamespace';
  const triggersNamespace = 'fake_triggersNamespace';
  const triggersVersion = 'fake_triggersVersion';

  const properties = {
    dashboardNamespace,
    externalLogsURL,
    isReadOnly,
    logoutURL,
    streamLogs,
    tenantNamespace,
    triggersNamespace,
    triggersVersion
  };
  fetchMock.get(/properties/, properties);
  const { result, waitFor } = renderHook(() => API.useProperties(), {
    wrapper: getAPIWrapper({ queryClient })
  });
  await waitFor(() => result.current.isFetching);
  await waitFor(() => !result.current.isFetching);
  expect(result.current.data).toEqual(properties);

  const { result: dashboardNamespaceResult } = renderHook(
    () => API.useDashboardNamespace(),
    {
      wrapper: getAPIWrapper({ queryClient })
    }
  );
  expect(dashboardNamespaceResult.current).toEqual(dashboardNamespace);

  const { result: externalLogsURLResult } = renderHook(
    () => API.useExternalLogsURL(),
    {
      wrapper: getAPIWrapper({ queryClient })
    }
  );
  expect(externalLogsURLResult.current).toEqual(externalLogsURL);

  const { result: isReadOnlyResult } = renderHook(() => API.useIsReadOnly(), {
    wrapper: getAPIWrapper({ queryClient })
  });
  expect(isReadOnlyResult.current).toEqual(isReadOnly);

  const { result: logoutURLResult } = renderHook(() => API.useLogoutURL(), {
    wrapper: getAPIWrapper({ queryClient })
  });
  expect(logoutURLResult.current).toEqual(logoutURL);

  const { result: isLogStreamingEnabledResult } = renderHook(
    () => API.useIsLogStreamingEnabled(),
    {
      wrapper: getAPIWrapper({ queryClient })
    }
  );
  expect(isLogStreamingEnabledResult.current).toEqual(streamLogs);

  const { result: tenantNamespaceResult } = renderHook(
    () => API.useTenantNamespace(),
    {
      wrapper: getAPIWrapper({ queryClient })
    }
  );
  expect(tenantNamespaceResult.current).toEqual(tenantNamespace);

  const { result: isTriggersInstalledResult } = renderHook(
    () => API.useIsTriggersInstalled(),
    {
      wrapper: getAPIWrapper({ queryClient })
    }
  );
  expect(isTriggersInstalledResult.current).toEqual(true);

  fetchMock.restore();
});
