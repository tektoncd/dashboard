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

import fetchMock from 'fetch-mock';

import {
  cancelPipelineRun,
  cancelTaskRun,
  checkData,
  createCredential,
  createPipelineRun,
  createPipelineRunAtProxy,
  deleteCredential,
  getAPI,
  getAPIRoot,
  getClusterTask,
  getClusterTasks,
  getCredential,
  getCredentials,
  getExtensionBundleURL,
  getExtensions,
  getNamespaces,
  getPipeline,
  getPipelineResource,
  getPipelineResources,
  getPipelineRun,
  getPipelineRuns,
  getPipelines,
  getPodLog,
  getServiceAccounts,
  getTask,
  getTaskRun,
  getTaskRuns,
  getTasks,
  getTektonAPI,
  updateCredential
} from '.';

beforeEach(jest.resetAllMocks);

describe('getAPIRoot', () => {
  it('handles base URL with trailing slash', () => {
    window.history.pushState({}, 'Title', '/path/#hash');
    expect(getAPIRoot()).toContain('/path');
  });

  it('handles base URL without trailing slash', () => {
    window.history.pushState({}, 'Title', '/path#hash');
    expect(getAPIRoot()).toContain('/path');
  });
});

describe('getAPI', () => {
  it('returns a URI containing the given type', () => {
    const uri = getAPI('pipelines');
    expect(uri).toContain('pipelines');
  });

  it('returns a URI containing the given type and name', () => {
    const uri = getAPI('pipelines', { name: 'somename' });
    expect(uri).toContain('pipelines');
    expect(uri).toContain('somename');
  });

  it('returns a URI containing the given type, name, and namespace', () => {
    const uri = getAPI('pipelines', {
      name: 'somename',
      namespace: 'customnamespace'
    });
    expect(uri).toContain('pipelines');
    expect(uri).toContain('somename');
    expect(uri).toContain('customnamespace');
  });
});

describe('getTektonAPI', () => {
  it('returns a URI containing the given type', () => {
    const uri = getTektonAPI('pipelines');
    expect(uri).toContain('pipelines');
  });

  it('returns a URI containing the given type and name', () => {
    const uri = getTektonAPI('pipelines', { name: 'somename' });
    expect(uri).toContain('pipelines');
    expect(uri).toContain('somename');
  });

  it('returns a URI containing the given type, name, and namespace', () => {
    const uri = getTektonAPI('pipelines', {
      name: 'somename',
      namespace: 'customnamespace'
    });
    expect(uri).toContain('pipelines');
    expect(uri).toContain('somename');
    expect(uri).toContain('namespaces');
    expect(uri).toContain('customnamespace');
  });

  it('returns a URI without namespace when omitted', () => {
    const uri = getTektonAPI('clustertasks', {
      name: 'somename'
    });
    expect(uri).toContain('clustertasks');
    expect(uri).toContain('somename');
    expect(uri).not.toContain('namespaces');
  });
});

describe('checkData', () => {
  it('returns items if present', () => {
    const items = 'foo';
    const data = {
      items
    };
    expect(checkData(data)).toEqual(items);
  });

  it('throws an error if items is not present', () => {
    expect(() => checkData({})).toThrow();
  });
});

it('getPipelines', () => {
  const data = {
    items: 'pipelines'
  };
  fetchMock.get(/pipelines/, data);
  return getPipelines().then(pipelines => {
    expect(pipelines).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getPipeline', () => {
  const name = 'foo';
  const data = { fake: 'pipeline' };
  fetchMock.get(`end:${name}`, data);
  return getPipeline({ name }).then(pipeline => {
    expect(pipeline).toEqual(data);
    fetchMock.restore();
  });
});

it('getPipelineRuns', () => {
  const data = {
    items: 'pipelineRuns'
  };
  fetchMock.get(/pipelineruns/, data);
  return getPipelineRuns().then(pipelineRuns => {
    expect(pipelineRuns).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getPipelineRuns With Query Params', () => {
  const pipelineName = 'pipelineName';
  const data = {
    items: 'pipelineRuns'
  };
  fetchMock.get(/pipelineruns/, data);
  return getPipelineRuns({ pipelineName }).then(pipelineRuns => {
    expect(pipelineRuns).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getPipelineRun', () => {
  const name = 'foo';
  const data = { fake: 'pipelineRun' };
  fetchMock.get(`end:${name}`, data);
  return getPipelineRun({ name }).then(pipelineRun => {
    expect(pipelineRun).toEqual(data);
    fetchMock.restore();
  });
});

it('cancelPipelineRun', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const data = { fake: 'pipelineRun', spec: { status: 'running' } };
  fetchMock.get(/pipelineruns/, Promise.resolve(data));
  const payload = {
    fake: 'pipelineRun',
    spec: { status: 'PipelineRunCancelled' }
  };
  fetchMock.put(`end:${name}`, 204);
  return cancelPipelineRun({ name, namespace }).then(() => {
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
    fetchMock.restore();
  });
});

it('cancelTaskRun', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const data = { fake: 'taskRun', spec: { status: 'running' } };
  fetchMock.get(/taskruns/, Promise.resolve(data));
  const payload = {
    fake: 'taskRun',
    spec: { status: 'TaskRunCancelled' }
  };
  fetchMock.put(`end:${name}`, 204);
  return cancelTaskRun({ name, namespace }).then(() => {
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
    fetchMock.restore();
  });
});

it('getClusterTasks', () => {
  const data = {
    items: 'clustertasks'
  };
  fetchMock.get(/clustertasks/, data);
  return getClusterTasks().then(tasks => {
    expect(tasks).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getClusterTask', () => {
  const name = 'foo';
  const data = { fake: 'clustertask' };
  fetchMock.get(`end:${name}`, data);
  return getClusterTask({ name }).then(task => {
    expect(task).toEqual(data);
    fetchMock.restore();
  });
});

it('getTasks', () => {
  const data = {
    items: 'tasks'
  };
  fetchMock.get(/tasks/, data);
  return getTasks().then(tasks => {
    expect(tasks).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getTask', () => {
  const name = 'foo';
  const data = { fake: 'task' };
  fetchMock.get(`end:${name}`, data);
  return getTask({ name }).then(task => {
    expect(task).toEqual(data);
    fetchMock.restore();
  });
});

it('getTaskRuns', () => {
  const data = {
    items: 'taskRuns'
  };
  fetchMock.get(/taskruns/, data);
  return getTaskRuns().then(taskRuns => {
    expect(taskRuns).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getTaskRuns With Query Params', () => {
  const taskName = 'taskName';
  const data = {
    items: 'taskRuns'
  };
  fetchMock.get(/taskruns/, data);
  return getTaskRuns({ taskName }).then(taskRuns => {
    expect(taskRuns).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getTaskRun', () => {
  const name = 'foo';
  const data = { fake: 'taskRun' };
  fetchMock.get(`end:${name}`, data);
  return getTaskRun({ name }).then(taskRun => {
    expect(taskRun).toEqual(data);
    fetchMock.restore();
  });
});

it('getPipelineResources', () => {
  const data = {
    items: 'pipelineResources'
  };
  fetchMock.get(/pipelineresources/, data);
  return getPipelineResources().then(pipelineResources => {
    expect(pipelineResources).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getPipelineResource', () => {
  const name = 'foo';
  const data = { fake: 'pipelineResource' };
  fetchMock.get(`end:${name}`, data);
  return getPipelineResource({ name }).then(pipelineResource => {
    expect(pipelineResource).toEqual(data);
    fetchMock.restore();
  });
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
  return getPodLog({ name, namespace }).then(log => {
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
  return getPodLog({ container, name, namespace }).then(log => {
    expect(log).toEqual(data);
    fetchMock.restore();
  });
});

it('createPipelineRun', () => {
  const payload = { fake: 'payload' };
  const data = { fake: 'data' };
  fetchMock.post('*', data);
  return createPipelineRun({ payload }).then(response => {
    expect(response).toEqual(data);
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
    fetchMock.restore();
  });
});

it('createPipelineRunAtProxy', () => {
  const mockDateNow = jest
    .spyOn(Date, 'now')
    .mockImplementation(() => 'fake-timestamp');
  const pipelineName = 'fake-pipelineName';
  const resources = { 'fake-resource-name': 'fake-resource-value' };
  const params = { 'fake-param-name': 'fake-param-value' };
  const serviceAccount = 'fake-serviceAccount';
  const timeout = 'fake-timeout';
  const payload = { pipelineName, resources, params, serviceAccount, timeout };
  const data = {
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
      })),
      serviceAccount,
      timeout
    }
  };
  fetchMock.post('*', data);
  return createPipelineRunAtProxy(payload).then(response => {
    expect(response).toEqual(data);
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(data)
    });
    fetchMock.restore();
    mockDateNow.mockRestore();
  });
});

it('getCredentials', () => {
  const data = {
    items: 'credentials'
  };
  fetchMock.get(/credentials/, data);
  return getCredentials().then(credentials => {
    expect(credentials).toEqual(data);
    fetchMock.restore();
  });
});

it('getCredential', () => {
  const credentialId = 'foo';
  const data = { fake: 'credential' };
  fetchMock.get(`end:${credentialId}`, data);
  return getCredential(credentialId).then(credential => {
    expect(credential).toEqual(data);
    fetchMock.restore();
  });
});

it('createCredential', () => {
  const id = 'id';
  const username = 'username';
  const password = 'password';
  const type = 'type';
  const payload = { id, username, password, type };
  const data = { fake: 'data' };
  fetchMock.post('*', data);
  return createCredential(payload).then(response => {
    expect(response).toEqual(data);
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
    fetchMock.restore();
  });
});

it('updateCredential', () => {
  const id = 'id';
  const username = 'username';
  const password = 'password';
  const type = 'type';
  const payload = { id, username, password, type };
  const data = { fake: 'data' };
  fetchMock.put('*', data);
  return updateCredential(payload).then(response => {
    expect(response).toEqual(data);
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
    fetchMock.restore();
  });
});

it('deleteCredential', () => {
  const credentialId = 'fake credential id';
  const data = { fake: 'data' };
  fetchMock.delete('*', data);
  return deleteCredential(credentialId).then(response => {
    expect(response).toEqual(data);
    fetchMock.restore();
  });
});

it('getExtensions', () => {
  const displayName = 'displayName';
  const name = 'name';
  const bundlelocation = 'bundlelocation';
  const source = getExtensionBundleURL(name, bundlelocation);
  const url = 'url';
  const extensions = [{ displayname: displayName, name, bundlelocation, url }];
  const transformedExtensions = [{ displayName, name, source, url }];
  fetchMock.get(/extensions/, extensions);
  return getExtensions().then(response => {
    expect(response).toEqual(transformedExtensions);
    fetchMock.restore();
  });
});

it('getExtensions null', () => {
  fetchMock.get(/extensions/, 'null');
  return getExtensions().then(response => {
    expect(response).toEqual([]);
    fetchMock.restore();
  });
});

it('getNamespaces', () => {
  const data = {
    items: 'namespaces'
  };
  fetchMock.get(/namespaces/, data);
  return getNamespaces().then(response => {
    expect(response).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getServiceAccounts', () => {
  const data = { items: 'serviceaccounts' };
  fetchMock.get(/serviceaccounts/, data);
  return getServiceAccounts().then(response => {
    expect(response).toEqual(data.items);
    fetchMock.restore();
  });
});
