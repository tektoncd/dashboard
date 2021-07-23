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

import * as API from './taskRuns';
import * as utils from './utils';

it('cancelTaskRun', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const returnedTaskRun = { fake: 'taskRun' };
  const payload = [
    { op: 'replace', path: '/spec/status', value: 'TaskRunCancelled' }
  ];
  fetchMock.patch(`end:${name}`, returnedTaskRun);
  return API.cancelTaskRun({ name, namespace }).then(response => {
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
    expect(response).toEqual(returnedTaskRun);
    fetchMock.restore();
  });
});

it('createTaskRun uses correct kubernetes information', () => {
  const data = { fake: 'createtaskrun' };
  fetchMock.post(/taskruns/, { body: data, status: 201 });
  return API.createTaskRun({}).then(response => {
    expect(response).toEqual(data);
    const sentBody = JSON.parse(fetchMock.lastOptions().body);
    expect(sentBody).toHaveProperty('apiVersion', 'tekton.dev/v1beta1');
    expect(sentBody).toHaveProperty('kind', 'TaskRun');
    expect(sentBody).toHaveProperty('metadata');
    expect(sentBody).toHaveProperty('spec');
    fetchMock.restore();
  });
});

it('createTaskRun has correct metadata', () => {
  const mockDateNow = jest
    .spyOn(Date, 'now')
    .mockImplementation(() => 'fake-timestamp');
  const namespace = 'fake-namespace';
  const taskName = 'fake-task';
  const labels = { app: 'fake-app' };
  fetchMock.post(/taskruns/, {});
  return API.createTaskRun({ namespace, taskName, labels }).then(() => {
    const sentMetadata = JSON.parse(fetchMock.lastOptions().body).metadata;
    expect(sentMetadata.name).toMatch(taskName); // include name
    expect(sentMetadata.name).toMatch('fake-timestamp'); // include timestamp
    expect(sentMetadata).toHaveProperty('namespace', namespace);
    expect(sentMetadata.labels).toHaveProperty('app', 'fake-app');
    fetchMock.restore();
    mockDateNow.mockRestore();
  });
});

it('createTaskRun handles taskRef', () => {
  const taskName = 'fake-task';
  fetchMock.post(/taskruns/, {});
  return API.createTaskRun({ taskName }).then(() => {
    const sentSpec = JSON.parse(fetchMock.lastOptions().body).spec;
    expect(sentSpec.taskRef).toHaveProperty('name', taskName);
    expect(sentSpec.taskRef).toHaveProperty('kind', 'Task');
    fetchMock.restore();
  });
});

it('createTaskRun handles ClusterTask in taskRef', () => {
  const taskName = 'fake-task';
  fetchMock.post(/taskruns/, {});
  return API.createTaskRun({ taskName, kind: 'ClusterTask' }).then(() => {
    const sentSpec = JSON.parse(fetchMock.lastOptions().body).spec;
    expect(sentSpec.taskRef).toHaveProperty('kind', 'ClusterTask');
    fetchMock.restore();
  });
});

it('createTaskRun handles parameters', () => {
  const taskName = 'fake-task';
  const params = { 'fake-param-name': 'fake-param-value' };
  fetchMock.post(/taskruns/, {});
  return API.createTaskRun({ taskName, params }).then(() => {
    const sentSpec = JSON.parse(fetchMock.lastOptions().body).spec;
    expect(sentSpec.params).toContainEqual({
      name: 'fake-param-name',
      value: 'fake-param-value'
    });
    fetchMock.restore();
  });
});

it('createTaskRun handles resources', () => {
  const taskName = 'fake-task';
  const resources = {
    inputs: { 'fake-task-input': 'fake-input-resource' },
    outputs: { 'fake-task-output': 'fake-output-resource' }
  };
  fetchMock.post(/taskruns/, {});
  return API.createTaskRun({ taskName, resources }).then(() => {
    const sentResources = JSON.parse(fetchMock.lastOptions().body).spec
      .resources;
    expect(sentResources.inputs).toContainEqual({
      name: 'fake-task-input',
      resourceRef: { name: 'fake-input-resource' }
    });
    expect(sentResources.outputs).toContainEqual({
      name: 'fake-task-output',
      resourceRef: { name: 'fake-output-resource' }
    });
    fetchMock.restore();
  });
});

it('createTaskRun handles serviceAccount', () => {
  const taskName = 'fake-task';
  const serviceAccount = 'fake-service-account';
  fetchMock.post(/taskruns/, {});
  return API.createTaskRun({ taskName, serviceAccount }).then(() => {
    const sentSpec = JSON.parse(fetchMock.lastOptions().body).spec;
    expect(sentSpec).toHaveProperty('serviceAccountName', serviceAccount);
    fetchMock.restore();
  });
});

it('createTaskRun handles nodeSelector', () => {
  const taskName = 'fake-task';
  const nodeSelector = { disk: 'ssd' };
  fetchMock.post(/taskruns/, {});
  return API.createTaskRun({ taskName, nodeSelector }).then(() => {
    const sentSpec = JSON.parse(fetchMock.lastOptions().body).spec;
    expect(sentSpec).toHaveProperty('podTemplate', { nodeSelector });
    fetchMock.restore();
  });
});

it('createTaskRun handles timeout', () => {
  const taskName = 'fake-task';
  const timeout = 'fake-timeout';
  fetchMock.post(/taskruns/, {});
  return API.createTaskRun({ taskName, timeout }).then(() => {
    const sentSpec = JSON.parse(fetchMock.lastOptions().body).spec;
    expect(sentSpec).toHaveProperty('timeout', timeout);
    fetchMock.restore();
  });
});

it('deleteTaskRun', () => {
  const name = 'foo';
  const data = { fake: 'taskRun' };
  fetchMock.delete(`end:${name}`, data);
  return API.deleteTaskRun({ name }).then(taskRun => {
    expect(taskRun).toEqual(data);
    fetchMock.restore();
  });
});

it('getTaskRun', () => {
  const name = 'foo';
  const data = { fake: 'taskRun' };
  fetchMock.get(`end:${name}`, data);
  return API.getTaskRun({ name }).then(taskRun => {
    expect(taskRun).toEqual(data);
    fetchMock.restore();
  });
});

it('getTaskRuns', () => {
  const data = {
    items: 'taskRuns'
  };
  fetchMock.get(/taskruns/, data);
  return API.getTaskRuns().then(taskRuns => {
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
  return API.getTaskRuns({ taskName }).then(taskRuns => {
    expect(taskRuns).toEqual(data.items);
    fetchMock.restore();
  });
});

it('useTaskRuns', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useTaskRuns(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    'TaskRun',
    API.getTaskRuns,
    params
  );
});

it('useTaskRun', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useTaskRun(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    'TaskRun',
    API.getTaskRun,
    params,
    undefined
  );

  const queryConfig = { fake: 'queryConfig' };
  API.useTaskRun(params, queryConfig);
  expect(utils.useResource).toHaveBeenCalledWith(
    'TaskRun',
    API.getTaskRun,
    params,
    queryConfig
  );
});

it('rerunTaskRun', () => {
  const filter = 'end:/taskruns/';
  const originalTaskRun = {
    metadata: { name: 'fake_taskRun' },
    spec: { status: 'fake_status' },
    status: 'fake_status'
  };
  const newTaskRun = { metadata: { name: 'fake_taskRun_rerun' } };
  fetchMock.post(filter, { body: newTaskRun, status: 201 });
  return API.rerunTaskRun(originalTaskRun).then(data => {
    const body = JSON.parse(fetchMock.lastCall(filter)[1].body);
    expect(body.metadata.generateName).toMatch(
      new RegExp(originalTaskRun.metadata.name)
    );
    expect(body.status).toBeUndefined();
    expect(body.spec.status).toBeUndefined();
    expect(data).toEqual(newTaskRun);
    fetchMock.restore();
  });
});
