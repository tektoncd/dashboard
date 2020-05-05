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
import * as comms from './comms';
import * as index from '.';
import { mockCSRFToken } from '../utils/test';

describe('getAPIRoot', () => {
  it('handles base URL with trailing slash', () => {
    window.history.pushState({}, 'Title', '/path/#hash');
    expect(index.getAPIRoot()).toContain('/path');
  });

  it('handles base URL without trailing slash', () => {
    window.history.pushState({}, 'Title', '/path#hash');
    expect(index.getAPIRoot()).toContain('/path');
  });
});

describe('getAPI', () => {
  it('returns a URI containing the given type', () => {
    const uri = index.getAPI('pipelines');
    expect(uri).toContain('pipelines');
  });

  it('returns a URI containing the given type and name', () => {
    const uri = index.getAPI('pipelines', { name: 'somename' });
    expect(uri).toContain('pipelines');
    expect(uri).toContain('somename');
  });

  it('returns a URI containing the given type, name, and namespace', () => {
    const uri = index.getAPI('pipelines', {
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
    const uri = index.getTektonAPI('pipelines');
    expect(uri).toContain('pipelines');
  });

  it('returns a URI containing the given type and name', () => {
    const uri = index.getTektonAPI('pipelines', { name: 'somename' });
    expect(uri).toContain('pipelines');
    expect(uri).toContain('somename');
  });

  it('returns a URI containing the given type, name, and namespace', () => {
    const uri = index.getTektonAPI('pipelines', {
      name: 'somename',
      namespace: 'customnamespace'
    });
    expect(uri).toContain('pipelines');
    expect(uri).toContain('somename');
    expect(uri).toContain('namespaces');
    expect(uri).toContain('customnamespace');
  });

  it('returns a URI without namespace when omitted', () => {
    const uri = index.getTektonAPI('clustertasks', {
      name: 'somename'
    });
    expect(uri).toContain('clustertasks');
    expect(uri).toContain('somename');
    expect(uri).not.toContain('namespaces');
  });
});

describe('getResourceAPI', () => {
  it('returns a URI containing the given type', () => {
    const uri = index.getResourcesAPI({
      group: 'test.dev',
      version: 'testversion',
      type: 'testtype'
    });
    expect(uri).toContain('test.dev');
    expect(uri).toContain('testversion');
    expect(uri).toContain('testtype');
  });

  it('returns a URI containing the given type and name without namespace', () => {
    const uri = index.getResourcesAPI({
      group: 'test.dev',
      version: 'testversion',
      type: 'testtype',
      name: 'testname'
    });
    expect(uri).toContain('test.dev');
    expect(uri).toContain('testversion');
    expect(uri).toContain('testtype');
    expect(uri).toContain('testname');
    expect(uri).not.toContain('namespaces');
  });

  it('returns a URI containing the given type, name and namespace', () => {
    const uri = index.getResourcesAPI({
      group: 'test.dev',
      version: 'testversion',
      type: 'testtype',
      namespace: 'testnamespace',
      name: 'testname'
    });
    expect(uri).toContain('test.dev');
    expect(uri).toContain('testversion');
    expect(uri).toContain('testtype');
    expect(uri).toContain('testname');
    expect(uri).toContain('namespaces');
    expect(uri).toContain('testnamespace');
  });
});

describe('checkData', () => {
  it('returns items if present', () => {
    const items = 'foo';
    const data = {
      items
    };
    expect(index.checkData(data)).toEqual(items);
  });

  it('throws an error if items is not present', () => {
    expect(() => index.checkData({})).toThrow();
  });
});

it('getPipelines', () => {
  const data = {
    items: 'pipelines'
  };
  fetchMock.get(/pipelines/, data);
  return index.getPipelines().then(pipelines => {
    expect(pipelines).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getPipeline', () => {
  const name = 'foo';
  const data = { fake: 'pipeline' };
  fetchMock.get(`end:${name}`, data);
  return index.getPipeline({ name }).then(pipeline => {
    expect(pipeline).toEqual(data);
    fetchMock.restore();
  });
});

it('getPipelineRuns', () => {
  const data = {
    items: 'pipelineRuns'
  };
  fetchMock.get(/pipelineruns/, data);
  return index.getPipelineRuns({ filters: [] }).then(pipelineRuns => {
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
  return index
    .getPipelineRuns({ pipelineName, filters: [] })
    .then(pipelineRuns => {
      expect(pipelineRuns).toEqual(data.items);
      fetchMock.restore();
    });
});

it('getPipelineRun', () => {
  const name = 'foo';
  const data = { fake: 'pipelineRun' };
  fetchMock.get(`end:${name}`, data);
  return index.getPipelineRun({ name }).then(pipelineRun => {
    expect(pipelineRun).toEqual(data);
    fetchMock.restore();
  });
});

it('deletePipelineRun', () => {
  const name = 'foo';
  const data = { fake: 'pipelineRun' };
  mockCSRFToken();
  fetchMock.delete(`end:${name}`, data);
  return index.deletePipelineRun({ name }).then(pipelineRun => {
    expect(pipelineRun).toEqual(data);
    fetchMock.restore();
  });
});

it('cancelPipelineRun', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const data = { fake: 'pipelineRun', spec: { status: 'running' } };
  mockCSRFToken();
  fetchMock.get(/pipelineruns/, Promise.resolve(data));
  const payload = {
    fake: 'pipelineRun',
    spec: { status: 'PipelineRunCancelled' }
  };
  fetchMock.put(`end:${name}`, 204);
  return index.cancelPipelineRun({ name, namespace }).then(() => {
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
  mockCSRFToken();
  fetchMock.get(/taskruns/, Promise.resolve(data));
  const payload = {
    fake: 'taskRun',
    spec: { status: 'TaskRunCancelled' }
  };
  fetchMock.put(`end:${name}`, 204);
  return index.cancelTaskRun({ name, namespace }).then(() => {
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
  return index.getClusterTasks().then(tasks => {
    expect(tasks).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getClusterTask', () => {
  const name = 'foo';
  const data = { fake: 'clustertask' };
  fetchMock.get(`end:${name}`, data);
  return index.getClusterTask({ name }).then(task => {
    expect(task).toEqual(data);
    fetchMock.restore();
  });
});

it('getTasks', () => {
  const data = {
    items: 'tasks'
  };
  fetchMock.get(/tasks/, data);
  return index.getTasks().then(tasks => {
    expect(tasks).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getTask', () => {
  const name = 'foo';
  const data = { fake: 'task' };
  fetchMock.get(`end:${name}`, data);
  return index.getTask({ name }).then(task => {
    expect(task).toEqual(data);
    fetchMock.restore();
  });
});

it('getTaskRuns', () => {
  const data = {
    items: 'taskRuns'
  };
  fetchMock.get(/taskruns/, data);
  return index.getTaskRuns().then(taskRuns => {
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
  return index.getTaskRuns({ taskName }).then(taskRuns => {
    expect(taskRuns).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getTaskRun', () => {
  const name = 'foo';
  const data = { fake: 'taskRun' };
  fetchMock.get(`end:${name}`, data);
  return index.getTaskRun({ name }).then(taskRun => {
    expect(taskRun).toEqual(data);
    fetchMock.restore();
  });
});

it('getPipelineResources', () => {
  const data = {
    items: 'pipelineResources'
  };
  fetchMock.get(/pipelineresources/, data);
  return index.getPipelineResources().then(pipelineResources => {
    expect(pipelineResources).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getPipelineResource', () => {
  const name = 'foo';
  const data = { fake: 'pipelineResource' };
  fetchMock.get(`end:${name}`, data);
  return index.getPipelineResource({ name }).then(pipelineResource => {
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
  return index.getPodLog({ name, namespace }).then(log => {
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
  return index.getPodLog({ container, name, namespace }).then(log => {
    expect(log).toEqual(data);
    fetchMock.restore();
  });
});

it('createPipelineResource', () => {
  const namespace = 'namespace1';
  const payload = {
    apiVersion: 'tekton.dev/v1alpha1',
    kind: 'PipelineResource',
    metadata: {
      generateName: 'git-source',
      namespace
    },
    spec: {
      type: 'git',
      params: [
        {
          name: 'url',
          value: 'http://someUrl.com'
        },
        {
          name: 'revision',
          value: 'master'
        }
      ]
    }
  };
  const data = { fake: 'data' };
  mockCSRFToken();
  fetchMock.post('*', data);
  return index.createPipelineResource({ namespace, payload }).then(response => {
    expect(response).toEqual(data);
    fetchMock.restore();
  });
});

it('createPipelineRun', () => {
  const mockDateNow = jest
    .spyOn(Date, 'now')
    .mockImplementation(() => 'fake-timestamp');
  const pipelineName = 'fake-pipelineName';
  const resources = { 'fake-resource-name': 'fake-resource-value' };
  const params = { 'fake-param-name': 'fake-param-value' };
  const serviceAccount = 'fake-serviceAccount';
  const timeout = 'fake-timeout';
  const payload = {
    pipelineName,
    resources,
    params,
    serviceAccount,
    timeout
  };
  const data = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    metadata: {
      name: `${pipelineName}-run-${Date.now()}`,
      labels: {
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
      })),
      serviceAccountName: serviceAccount,
      timeout
    }
  };
  mockCSRFToken();
  fetchMock.post('*', data);
  return index.createPipelineRun(payload).then(response => {
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
  fetchMock.get(/secrets/, data);
  return index.getCredentials().then(response => {
    expect(response).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getAllCredentials', () => {
  const data = {
    items: 'credentials'
  };
  fetchMock.get(/secrets/, data);
  return index.getAllCredentials().then(response => {
    expect(response).toEqual(data);
    fetchMock.restore();
  });
});

it('getCredential', () => {
  const credentialId = 'foo';
  const namespace = 'default';
  const data = { fake: 'credential' };
  fetchMock.get(/secrets/, data);
  return index.getCredential(credentialId, namespace).then(credential => {
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
  mockCSRFToken();
  fetchMock.post('*', data);
  return index.createCredential(payload).then(response => {
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
  mockCSRFToken();
  fetchMock.put('*', data);
  return index.updateCredential(payload).then(response => {
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
  mockCSRFToken();
  fetchMock.delete('*', data);
  return index.deleteCredential(credentialId).then(response => {
    expect(response).toEqual(data);
    fetchMock.restore();
  });
});

it('getExtensions', () => {
  const displayName = 'displayName';
  const name = 'name';
  const bundlelocation = 'bundlelocation';
  const source = index.getExtensionBundleURL(name, bundlelocation);
  const extensions = [{ displayname: displayName, name, bundlelocation }];
  const transformedExtensions = [{ displayName, name, source }];
  fetchMock.get(/extensions/, extensions);
  return index.getExtensions().then(response => {
    expect(response).toEqual(transformedExtensions);
    fetchMock.restore();
  });
});

it('getExtensions null', () => {
  fetchMock.get(/extensions/, 'null');
  return index.getExtensions().then(response => {
    expect(response).toEqual([]);
    fetchMock.restore();
  });
});

it('getNamespaces returns the correct data', () => {
  const data = {
    items: 'namespaces'
  };
  fetchMock.get(/namespaces/, data);
  return index.getNamespaces().then(response => {
    expect(response).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getServiceAccount returns the correct data', () => {
  const data = { items: 'serviceaccounts' };
  fetchMock.get(/serviceaccounts/, data);
  return index.getServiceAccount('default', 'default').then(response => {
    expect(response).toEqual(data);
    fetchMock.restore();
  });
});

it('getServiceAccounts returns the correct data', () => {
  const data = { items: 'serviceaccounts' };
  fetchMock.get(/serviceaccounts/, data);
  return index.getServiceAccounts().then(response => {
    expect(response).toEqual(data.items);
    fetchMock.restore();
  });
});

it('patchServiceAccount', () => {
  const data = 'data';
  jest.spyOn(comms, 'patchAddSecret').mockImplementation(() => data);
  mockCSRFToken();
  fetchMock.get(/serviceaccounts/, data);
  return index
    .patchServiceAccount('default', 'default', 'secret-name')
    .then(response => {
      expect(response).toEqual(data);
      fetchMock.restore();
    });
});

it('getResources', () => {
  const group = 'testgroup';
  const version = 'testversion';
  const type = 'testtype';
  const namespace = 'testnamespace';
  const data = { items: 'resourcedata' };
  fetchMock.get(`end:${type}/`, data);
  return index
    .getCustomResources({ group, version, type, namespace })
    .then(resources => {
      expect(resources).toEqual(data.items);
      fetchMock.restore();
    });
});

it('getResource', () => {
  const group = 'testgroup';
  const version = 'testversion';
  const type = 'testtype';
  const name = 'testresource';
  const namespace = 'testnamespace';
  const data = { fake: 'resourcedata' };
  fetchMock.get(`end:${name}`, data);
  return index
    .getCustomResource({ group, version, type, namespace, name })
    .then(resource => {
      expect(resource).toEqual(data);
      fetchMock.restore();
    });
});

it('getTriggerTemplate', () => {
  const name = 'foo';
  const data = { fake: 'triggerTemplate' };
  fetchMock.get(`end:${name}`, data);
  return index.getTriggerTemplate({ name }).then(triggerTemplate => {
    expect(triggerTemplate).toEqual(data);
    fetchMock.restore();
  });
});

it('getTriggerTemplates', () => {
  const data = {
    items: 'triggerTemplates'
  };
  fetchMock.get(/triggertemplates/, data);
  return index.getTriggerTemplates().then(triggerTemplates => {
    expect(triggerTemplates).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getTriggerBinding', () => {
  const name = 'foo';
  const data = { fake: 'triggerBinding' };
  fetchMock.get(`end:${name}`, data);
  return index.getTriggerBinding({ name }).then(triggerBinding => {
    expect(triggerBinding).toEqual(data);
    fetchMock.restore();
  });
});

it('getClusterTriggerBinding', () => {
  const name = 'foo';
  const data = { fake: 'clusterTriggerBinding' };
  fetchMock.get(`end:${name}`, data);
  return index
    .getClusterTriggerBinding({ name })
    .then(clusterTriggerBinding => {
      expect(clusterTriggerBinding).toEqual(data);
      fetchMock.restore();
    });
});

it('getTriggerBindings', () => {
  const data = {
    items: 'triggerBindings'
  };
  fetchMock.get(/triggerbindings/, data);
  return index.getTriggerBindings().then(triggerBindings => {
    expect(triggerBindings).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getClusterTriggerBindings', () => {
  const data = {
    items: 'clusterTriggerBindings'
  };
  fetchMock.get(/clustertriggerbindings/, data);
  return index.getClusterTriggerBindings().then(clusterTriggerBindings => {
    expect(clusterTriggerBindings).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getEventListener', () => {
  const name = 'foo';
  const data = { fake: 'eventListener' };
  fetchMock.get(`end:${name}`, data);
  return index.getEventListener({ name }).then(eventListener => {
    expect(eventListener).toEqual(data);
    fetchMock.restore();
  });
});

it('getEventListeners', () => {
  const data = {
    items: 'eventListeners'
  };
  fetchMock.get(/eventlisteners/, data);
  return index.getEventListeners().then(eventListeners => {
    expect(eventListeners).toEqual(data.items);
    fetchMock.restore();
  });
});

it('deletePipelineResource', () => {
  const name = 'foo';
  const data = { fake: 'pipelineResource' };
  mockCSRFToken();
  fetchMock.delete(`end:${name}`, data);
  return index.deletePipelineResource({ name }).then(pipelineResource => {
    expect(pipelineResource).toEqual(data);
    fetchMock.restore();
  });
});

it('deleteTaskRun', () => {
  const name = 'foo';
  const data = { fake: 'taskRun' };
  mockCSRFToken();
  fetchMock.delete(`end:${name}`, data);
  return index.deleteTaskRun({ name }).then(taskRun => {
    expect(taskRun).toEqual(data);
    fetchMock.restore();
  });
});

it('rerunPipelineRun', () => {
  const namespace = 'namespace';
  const data = { fake: 'pipelineRun' };
  mockCSRFToken();
  fetchMock.post(`end:/rerun/`, data);
  return index
    .rerunPipelineRun(namespace, { fake: 'existingPipelineRun' })
    .then(pipelineRun => {
      expect(pipelineRun).toEqual(data);
      fetchMock.restore();
    });
});

it('createTaskRun uses correct kubernetes information', () => {
  const data = { fake: 'createtaskrun' };
  mockCSRFToken();
  fetchMock.post(/taskruns/, data);
  return index.createTaskRun({}).then(response => {
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
  return index.createTaskRun({ namespace, taskName, labels }).then(() => {
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
  return index.createTaskRun({ taskName }).then(() => {
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
  return index.createTaskRun({ taskName, kind: 'ClusterTask' }).then(() => {
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
  return index.createTaskRun({ taskName, params }).then(() => {
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
  return index.createTaskRun({ taskName, resources }).then(() => {
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
  return index.createTaskRun({ taskName, serviceAccount }).then(() => {
    const sentSpec = JSON.parse(fetchMock.lastOptions().body).spec;
    expect(sentSpec).toHaveProperty('serviceAccountName', serviceAccount);
    fetchMock.restore();
  });
});

it('createTaskRun handles timeout', () => {
  const taskName = 'fake-task';
  const timeout = 'fake-timeout';
  mockCSRFToken();
  fetchMock.post(/taskruns/, {});
  return index.createTaskRun({ taskName, timeout }).then(() => {
    const sentSpec = JSON.parse(fetchMock.lastOptions().body).spec;
    expect(sentSpec).toHaveProperty('timeout', timeout);
    fetchMock.restore();
  });
});

it('importResources', () => {
  const mockDateNow = jest
    .spyOn(Date, 'now')
    .mockImplementation(() => 'fake-timestamp');
  const repositoryURL = 'https://github.com/test/testing';
  const applyDirectory = 'fake-directory';
  const namespace = 'fake-namespace';
  const serviceAccount = 'fake-serviceAccount';
  const importerNamespace = 'fake-importer-namespace';

  const payload = {
    repositoryURL,
    applyDirectory,
    namespace,
    serviceAccount,
    importerNamespace
  };
  const data = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    metadata: {
      name: `import-resources-${Date.now()}`,
      labels: {
        app: 'tekton-app',
        'dashboard.tekton.dev/import': 'true'
      }
    },
    spec: {
      params: [
        {
          name: 'apply-directory',
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
            default: '/workspace/git-source',
            description: 'The path to the resource files to apply',
            name: 'pathToResourceFiles',
            type: 'string'
          },
          {
            default: '.',
            description: 'The directory from which resources are to be applied',
            name: 'apply-directory',
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
            },
            taskSpec: {
              params: [
                {
                  default: '/workspace/git-source',
                  description: 'The path to the resource files to apply',
                  name: 'pathToResourceFiles',
                  type: 'string'
                },
                {
                  default: '.',
                  description:
                    'The directory from which resources are to be applied',
                  name: 'apply-directory',
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
                    'apply',
                    '-f',
                    '$(params.pathToResourceFiles)/$(params.apply-directory)',
                    '-n',
                    '$(params.target-namespace)'
                  ],
                  command: ['kubectl'],
                  image: 'lachlanevenson/k8s-kubectl:latest',
                  name: 'kubectl-apply'
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
                value: 'master'
              }
            ],
            type: 'git'
          }
        }
      ]
    }
  };

  mockCSRFToken();
  fetchMock.post('*', data);
  return index.importResources(payload).then(response => {
    expect(response).toEqual(data);
    expect(JSON.parse(fetchMock.lastOptions().body)).toMatchObject(data);
    fetchMock.restore();
    mockDateNow.mockRestore();
  });
});
