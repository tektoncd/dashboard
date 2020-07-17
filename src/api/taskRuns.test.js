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

import fetchMock from 'fetch-mock';
import * as API from './taskRuns';
import { mockCSRFToken } from '../utils/test';

it('cancelTaskRun', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const data = { fake: 'taskRun', spec: { status: 'running' } };
  mockCSRFToken();
  fetchMock.get(/taskruns/, Promise.resolve(data));
  const payload = {
    fake: 'taskRun',
    spec: { status: 'TaskRunCancelled' }
  };
  fetchMock.put(`end:${name}`, 204);
  return API.cancelTaskRun({ name, namespace }).then(() => {
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
    fetchMock.restore();
  });
});

it('createTaskRun uses correct kubernetes information', () => {
  const data = { fake: 'createtaskrun' };
  mockCSRFToken();
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
  mockCSRFToken();
  fetchMock.post(/taskruns/, {});
  return API.createTaskRun({ namespace, taskName, labels }).then(() => {
    const sentMetadata = JSON.parse(fetchMock.lastOptions().body).metadata;
    expect(sentMetadata.name).toMatch(taskName); // include name
    expect(sentMetadata.name).toMatch('fake-timestamp'); // include timestamp
    expect(sentMetadata).toHaveProperty('namespace', namespace);
    expect(sentMetadata.labels).toHaveProperty('app', 'fake-app');
    expect(sentMetadata.labels).toHaveProperty(['tekton.dev/task'], taskName);
    fetchMock.restore();
    mockDateNow.mockRestore();
  });
});

it('createTaskRun handles taskRef', () => {
  const taskName = 'fake-task';
  mockCSRFToken();
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
  mockCSRFToken();
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
  mockCSRFToken();
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
  mockCSRFToken();
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
  mockCSRFToken();
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
  mockCSRFToken();
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
  mockCSRFToken();
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
  mockCSRFToken();
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
