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
  checkData,
  createCredential,
  createPipelineRun,
  deleteCredential,
  getAPI,
  getAPIRoot,
  getCredential,
  getCredentials,
  getExtensions,
  getNamespaces,
  getPipeline,
  getPipelineResource,
  getPipelineResources,
  getPipelineRun,
  getPipelineRuns,
  getPipelines,
  getPodLog,
  getTask,
  getTaskRun,
  getTaskRunLog,
  getTaskRuns,
  getTasks,
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

  it('returns a URI containing the given, name, and namespace', () => {
    const uri = getAPI('pipelines', {
      name: 'somename',
      namespace: 'customnamespace'
    });
    expect(uri).toContain('pipelines');
    expect(uri).toContain('somename');
    expect(uri).toContain('customnamespace');
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
  const pipelineName = 'foo';
  const data = { fake: 'pipeline' };
  fetchMock.get(`end:${pipelineName}`, data);
  return getPipeline(pipelineName).then(pipeline => {
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
  return getPipelineRuns(pipelineName).then(pipelineRuns => {
    expect(pipelineRuns).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getPipelineRun', () => {
  const pipelineRunName = 'foo';
  const data = { fake: 'pipelineRun' };
  fetchMock.get(`end:${pipelineRunName}`, data);
  return getPipelineRun(pipelineRunName).then(pipelineRun => {
    expect(pipelineRun).toEqual(data);
    fetchMock.restore();
  });
});

it('cancelPipelineRun', () => {
  const pipelineRunName = 'foo';
  const payload = {
    status: 'PipelineRunCancelled'
  };
  fetchMock.put(`end:${pipelineRunName}`, 204);
  return cancelPipelineRun(pipelineRunName).then(() => {
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
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
  const taskName = 'foo';
  const data = { fake: 'task' };
  fetchMock.get(`end:${taskName}`, data);
  return getTask(taskName).then(task => {
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
  return getTaskRuns(taskName).then(taskRuns => {
    expect(taskRuns).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getTaskRun', () => {
  const taskRunName = 'foo';
  const data = { fake: 'taskRun' };
  fetchMock.get(`end:${taskRunName}`, data);
  return getTaskRun(taskRunName).then(taskRun => {
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
  const pipelineResourceName = 'foo';
  const data = { fake: 'pipelineResource' };
  fetchMock.get(`end:${pipelineResourceName}`, data);
  return getPipelineResource(pipelineResourceName).then(pipelineResource => {
    expect(pipelineResource).toEqual(data);
    fetchMock.restore();
  });
});

it('getPodLog', () => {
  const podName = 'foo';
  const data = ['logs'];
  fetchMock.get(`end:${podName}`, data);
  return getPodLog(podName).then(log => {
    expect(log).toEqual(data);
    fetchMock.restore();
  });
});

it('getTaskRunLog', () => {
  const taskRunName = 'foo';
  const data = ['logs'];
  fetchMock.get(`end:${taskRunName}`, data);
  return getTaskRunLog(taskRunName).then(log => {
    expect(log).toEqual(data);
    fetchMock.restore();
  });
});

it('createPipelineRun', () => {
  const payload = { fake: 'payload' };
  const data = { fake: 'data' };
  fetchMock.post('*', data);
  return createPipelineRun(payload).then(response => {
    expect(response).toEqual(data);
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
    fetchMock.restore();
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
  const data = { items: 'credential' };
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
  const extensions = [{ fake: 'extension' }];
  fetchMock.get(/extensions/, extensions);
  return getExtensions().then(response => {
    expect(response).toEqual(extensions);
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
