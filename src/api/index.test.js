/*
Copyright 2019-2024 The Tekton Authors
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

import { renderHook } from '@testing-library/react-hooks';
import { labels } from '@tektoncd/dashboard-utils';
import { http, HttpResponse } from 'msw';

import { getAPIWrapper, getQueryClient } from '../utils/test';
import { server } from '../../config_frontend/msw';

import * as API from '.';
import * as ClusterTasksAPI from './clusterTasks';
import * as TasksAPI from './tasks';
import * as comms from './comms';
import * as utils from './utils';

it('getCustomResource', () => {
  const group = 'testgroup';
  const version = 'testversion';
  const type = 'testtype';
  const name = 'testresource';
  const namespace = 'testnamespace';
  const data = { fake: 'resourcedata' };
  server.use(http.get(new RegExp(`/${name}$`), () => HttpResponse.json(data)));
  return API.getCustomResource({ group, version, type, namespace, name }).then(
    resource => {
      expect(resource).toEqual(data);
    }
  );
});

it('getCustomResources', () => {
  const group = 'testgroup';
  const version = 'testversion';
  const type = 'testtype';
  const namespace = 'testnamespace';
  const data = { items: 'resourcedata' };
  server.use(http.get(new RegExp(`/${type}/$`), () => HttpResponse.json(data)));
  return API.getCustomResources({ group, version, type, namespace }).then(
    resources => {
      expect(resources).toEqual(data);
    }
  );
});

it('useCustomResource', () => {
  const type = 'fake_type';
  const params = { fake: 'params', type };
  const query = { fake: 'query' };
  vi.spyOn(utils, 'useResource').mockImplementation(() => query);
  const returnValue = API.useCustomResource(params);

  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getCustomResource,
      kind: type,
      params
    })
  );
  expect(returnValue).toEqual(query);
});

it('useCustomResources', async () => {
  const group = 'fake_group';
  const type = 'fake_type';
  const version = 'fake_version';
  const resources = {
    metadata: {},
    items: [
      { metadata: { name: 'resource1' } },
      { metadata: { name: 'resource2' } }
    ]
  };
  server.use(http.get(/\/fake_type\//, () => HttpResponse.json(resources)));
  const { result, waitFor } = renderHook(
    () => API.useCustomResources({ group, type, version }),
    {
      wrapper: getAPIWrapper()
    }
  );
  await waitFor(() => result.current.isFetching);
  await waitFor(() => !result.current.isFetching);
  expect(result.current.data).toEqual(resources.items);
});

it('useAPIResource', () => {
  const type = 'fake_type';
  const params = { fake: 'params', type };
  const query = { fake: 'query' };
  vi.spyOn(utils, 'useResource').mockImplementation(() => query);
  const returnValue = API.useAPIResource(params);

  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getAPIResource,
      kind: type,
      params
    })
  );
  expect(returnValue).toEqual(query);
});

it('useTaskByKind', () => {
  const params = { fake: 'params' };
  const clusterTaskQuery = { fake: 'clusterTaskQuery' };
  const taskQuery = { fake: 'taskQuery' };
  vi.spyOn(ClusterTasksAPI, 'useClusterTask').mockImplementation(
    () => clusterTaskQuery
  );
  vi.spyOn(TasksAPI, 'useTask').mockImplementation(() => taskQuery);

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
  server.use(http.get(/\/namespaces\//, () => HttpResponse.json(data)));
  return API.getNamespaces().then(response => {
    expect(response).toEqual(data);
  });
});

it('useNamespaces', async () => {
  const namespaces = {
    metadata: {},
    items: [
      { metadata: { name: 'namespace1' } },
      { metadata: { name: 'namespace2' } }
    ]
  };
  server.use(http.get(/\/namespaces\//, () => HttpResponse.json(namespaces)));
  const { result, waitFor } = renderHook(() => API.useNamespaces(), {
    wrapper: getAPIWrapper()
  });
  await waitFor(() => result.current.isFetching);
  await waitFor(() => !result.current.isFetching);
  expect(result.current.data).toEqual(namespaces.items);
});

it('usePod', async () => {
  const name = 'fake_name';
  const namespace = 'fake_namespace';
  const pod = {
    metadata: {},
    spec: 'fake_spec'
  };
  server.use(http.get(/\/pods\//, () => HttpResponse.json(pod)));
  const { result, waitFor } = renderHook(
    () => API.usePod({ name, namespace }),
    {
      wrapper: getAPIWrapper()
    }
  );
  await waitFor(() => result.current.isFetching);
  await waitFor(() => !result.current.isFetching);
  expect(result.current.data).toEqual(pod);
});

it('useEvents', async () => {
  const involvedObjectKind = 'fake_kind';
  const involvedObjectName = 'fake_name';
  const namespace = 'fake_namespace';
  const events = {
    metadata: {},
    items: [{ metadata: { name: 'event1' } }, { metadata: { name: 'event2' } }]
  };
  server.use(http.get(/\/events\//, () => HttpResponse.json(events)));
  const { result, waitFor } = renderHook(
    () => API.useEvents({ involvedObjectKind, involvedObjectName, namespace }),
    {
      wrapper: getAPIWrapper()
    }
  );
  await waitFor(() => result.current.isFetching);
  await waitFor(() => !result.current.isFetching);
  expect(result.current.data).toEqual(events.items);
});

it('getExternalLogURL', () => {
  const container = 'fake_container';
  const externalLogsURL = 'fake_externalLogsURL';
  const namespace = 'fake_namespace';
  const podName = 'fake_podName';
  const startTime = '2000-01-02T03:04:05Z';
  const completionTime = '2006-07-08T09:10:11Z';
  expect(
    API.getExternalLogURL({
      completionTime,
      container,
      externalLogsURL,
      namespace,
      podName,
      startTime
    })
  ).toEqual(
    `${externalLogsURL}/${namespace}/${podName}/${container}?startTime=${startTime.replaceAll(
      ':',
      '%3A'
    )}&completionTime=${completionTime.replaceAll(':', '%3A')}`
  );
});

it('getExternalLogURL with empty completionTime', () => {
  const container = 'fake_container';
  const externalLogsURL = 'fake_externalLogsURL';
  const namespace = 'fake_namespace';
  const podName = 'fake_podName';
  const startTime = '2000-01-02T03:04:05Z';
  expect(
    API.getExternalLogURL({
      container,
      externalLogsURL,
      namespace,
      podName,
      startTime
    })
  ).toEqual(
    `${externalLogsURL}/${namespace}/${podName}/${container}?startTime=${startTime.replaceAll(
      ':',
      '%3A'
    )}`
  );
});

it('getExternalLogURL with empty startTime and completionTime', () => {
  const container = 'fake_container';
  const externalLogsURL = 'fake_externalLogsURL';
  const namespace = 'fake_namespace';
  const podName = 'fake_podName';
  expect(
    API.getExternalLogURL({ container, externalLogsURL, namespace, podName })
  ).toEqual(`${externalLogsURL}/${namespace}/${podName}/${container}`);
});

it('getPodLog', () => {
  const namespace = 'default';
  const name = 'foo';
  const data = 'logs';
  server.use(
    http.get(new RegExp(`/${name}/log$`), () => new HttpResponse(data))
  );
  return API.getPodLog({ name, namespace }).then(log => {
    expect(log).toEqual(data);
  });
});

it('getPodLog with container name', () => {
  const namespace = 'default';
  const name = 'foo';
  const container = 'containerName';
  const data = 'logs';
  server.use(
    http.get(new RegExp(`/${name}/log$`), async ({ request: apiRequest }) =>
      new URL(apiRequest.url).searchParams.get('container') === container
        ? new HttpResponse(data)
        : HttpResponse.json(404)
    )
  );
  return API.getPodLog({ container, name, namespace }).then(log => {
    expect(log).toEqual(data);
  });
});

describe('importResources', () => {
  it('basic', () => {
    const mockDateNow = vi
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

    const fakeAPI = 'fake_api';
    vi.spyOn(utils, 'getKubeAPI').mockImplementation(() => fakeAPI);
    vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
      Promise.resolve(body)
    );
    return API.importResources(payload).then(() => {
      expect(comms.post).toHaveBeenCalledWith(
        fakeAPI,
        expect.objectContaining({
          apiVersion: 'tekton.dev/v1',
          kind: 'PipelineRun',
          metadata: expect.objectContaining({
            name: 'import-resources-fake-timestamp',
            labels: {
              [labels.DASHBOARD_IMPORT]: 'true'
            }
          }),
          spec: expect.objectContaining({
            params: expect.arrayContaining([
              { name: 'method', value: method },
              { name: 'path', value: path },
              { name: 'repositoryURL', value: repositoryURL },
              { name: 'revision', value: undefined },
              { name: 'target-namespace', value: namespace }
            ]),
            pipelineSpec: expect.objectContaining({}),
            taskRunTemplate: {
              podTemplate: expect.objectContaining({
                securityContext: expect.objectContaining({})
              }),
              serviceAccountName: serviceAccount
            },
            workspaces: expect.objectContaining({})
          })
        })
      );
      mockDateNow.mockRestore();
    });
  });

  it('with revision and no serviceAccount', () => {
    const mockDateNow = vi
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

    const fakeAPI = 'fake_api';
    vi.spyOn(utils, 'getKubeAPI').mockImplementation(() => fakeAPI);
    vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
      Promise.resolve(body)
    );

    return API.importResources(payload).then(() => {
      expect(comms.post).toHaveBeenCalledWith(
        fakeAPI,
        expect.objectContaining({
          metadata: expect.objectContaining({
            name: 'import-resources-fake-timestamp',
            labels: {
              [labels.DASHBOARD_IMPORT]: 'true'
            }
          }),
          spec: expect.objectContaining({
            params: expect.arrayContaining([
              { name: 'method', value: method },
              { name: 'path', value: path },
              { name: 'repositoryURL', value: repositoryURL },
              { name: 'revision', value: revision },
              { name: 'target-namespace', value: namespace }
            ])
          })
        })
      );
      expect(comms.post).not.toHaveBeenCalledWith(
        fakeAPI,
        expect.objectContaining({
          spec: expect.objectContaining({
            serviceAccountName: expect.any(String)
          })
        })
      );
      mockDateNow.mockRestore();
    });
  });
});

describe('getAPIResource', () => {
  it('handles non-core group', () => {
    const group = 'testgroup';
    const version = 'testversion';
    const type = 'testtype';
    const apiResource = { name: type };
    const data = { resources: [apiResource] };
    server.use(
      http.get(new RegExp(`/apis/${group}/${version}$`), () =>
        HttpResponse.json(data)
      )
    );
    return API.getAPIResource({ group, version, type }).then(resource => {
      expect(resource).toEqual(apiResource);
    });
  });

  it('handles core group', () => {
    const group = 'core';
    const version = 'testversion';
    const type = 'testtype';
    const apiResource = { name: type };
    const data = { resources: [apiResource] };
    server.use(
      http.get(new RegExp(`/api/${version}$`), () => HttpResponse.json(data))
    );
    return API.getAPIResource({ group, version, type }).then(resource => {
      expect(resource).toEqual(apiResource);
    });
  });

  it('handles empty resources response', () => {
    const group = 'core';
    const version = 'testversion';
    const type = 'testtype';
    const data = { resources: [] };
    server.use(
      http.get(new RegExp(`/api/${version}$`), () => HttpResponse.json(data))
    );
    return API.getAPIResource({ group, version, type }).then(resource => {
      expect(resource).toEqual({});
    });
  });
});

describe('getInstallProperties', () => {
  it('returns expected data', async () => {
    const data = { fake: 'properties' };
    server.use(http.get(/\/properties$/, () => HttpResponse.json(data)));
    const properties = await API.getInstallProperties();
    expect(properties).toEqual(data);
  });

  it('handles error in case of Dashboard client mode', async () => {
    server.use(
      http.get(/\/properties$/, () => new HttpResponse(null, { status: 404 }))
    );
    const properties = await API.getInstallProperties();
    expect(properties.dashboardVersion).toEqual('kubectl-proxy-client');
  });

  it('handles unexpected errors', async () => {
    server.use(
      http.get(/\/properties$/, () => new HttpResponse(null, { status: 500 }))
    );
    const properties = await API.getInstallProperties();
    expect(properties).toEqual({ isReadOnly: true });
  });
});

it('useProperties', async () => {
  const properties = { fake: 'properties' };
  server.use(http.get(/\/properties$/, () => HttpResponse.json(properties)));
  const { result, waitFor } = renderHook(() => API.useProperties(), {
    wrapper: getAPIWrapper()
  });
  await waitFor(() => result.current.isFetching);
  await waitFor(() => !result.current.isFetching);
  expect(result.current.data).toEqual(properties);
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
    tenantNamespaces: [tenantNamespace],
    triggersNamespace,
    triggersVersion
  };
  server.use(http.get(/\/properties$/, () => HttpResponse.json(properties)));
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
    () => API.useTenantNamespaces(),
    {
      wrapper: getAPIWrapper({ queryClient })
    }
  );
  expect(tenantNamespaceResult.current).toEqual([tenantNamespace]);

  const { result: isTriggersInstalledResult } = renderHook(
    () => API.useIsTriggersInstalled(),
    {
      wrapper: getAPIWrapper({ queryClient })
    }
  );
  expect(isTriggersInstalledResult.current).toEqual(true);
});

it('useTenantNamespaces', async () => {
  const queryClient = getQueryClient();

  const tenantNamespaces = ['fake_tenantNamespace1', 'fake_tenantNamespace2'];

  const properties = { tenantNamespaces };
  server.use(http.get(/\/properties$/, () => HttpResponse.json(properties)));
  const { result, waitFor } = renderHook(() => API.useProperties(), {
    wrapper: getAPIWrapper({ queryClient })
  });
  await waitFor(() => result.current.isFetching);
  await waitFor(() => !result.current.isFetching);
  expect(result.current.data).toEqual(properties);

  const { result: tenantNamespacesResult } = renderHook(
    () => API.useTenantNamespaces(),
    {
      wrapper: getAPIWrapper({ queryClient })
    }
  );
  expect(tenantNamespacesResult.current).toEqual(tenantNamespaces);
});

it('useDefaultNamespace', async () => {
  const queryClient = getQueryClient();

  const defaultNamespace = 'fake_defaultNamespace';

  const properties = { defaultNamespace };
  server.use(http.get(/\/properties$/, () => HttpResponse.json(properties)));
  const { result, waitFor } = renderHook(() => API.useProperties(), {
    wrapper: getAPIWrapper({ queryClient })
  });
  await waitFor(() => result.current.isFetching);
  await waitFor(() => !result.current.isFetching);
  expect(result.current.data).toEqual(properties);

  const { result: defaultNamespacesResult } = renderHook(
    () => API.useDefaultNamespace(),
    {
      wrapper: getAPIWrapper({ queryClient })
    }
  );
  expect(defaultNamespacesResult.current).toEqual(defaultNamespace);
});
