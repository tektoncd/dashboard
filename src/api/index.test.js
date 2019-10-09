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
import * as comms from './comms';
import * as index from '.';

beforeEach(jest.resetAllMocks);

const serviceAccountPass = {
  apiVersion: 'v1',
  kind: 'ServiceAccount',
  metadata: {
    creationTimestamp: '2019-08-28T14:50:37Z',
    name: 'default',
    namespace: 'tekton-pipelines',
    resourceVersion: '333247',
    selfLink: '/api/v1/namespaces/tekton-pipelines/serviceaccounts/default',
    uid: '3233be5f-c9a3-11e9-a380-025000000001'
  },
  secrets: [
    {
      name: 'default-token-dcb4b'
    },
    {
      name: 'secret-name'
    }
  ]
};

const serviceAccountPassV2 = {
  apiVersion: 'v1',
  kind: 'ServiceAccount',
  metadata: {
    creationTimestamp: '2019-08-28T14:50:37Z',
    name: 'default',
    namespace: 'tekton-pipelines',
    resourceVersion: '333247',
    selfLink: '/api/v1/namespaces/tekton-pipelines/serviceaccounts/default',
    uid: '3233be5f-c9a3-11e9-a380-025000000001'
  },
  secrets: [
    {
      name: 'default-token-dcb4b'
    },
    {
      name: 'secret-name'
    },
    {
      name: 'secret-nameV2'
    }
  ]
};

const serviceAccountFail = {
  apiVersion: 'v1',
  kind: 'ServiceAccount',
  metadata: {
    creationTimestamp: '2019-08-28T14:50:37Z',
    name: 'default',
    namespace: 'tekton-pipelines',
    resourceVersion: '333247',
    selfLink: '/api/v1/namespaces/tekton-pipelines/serviceaccounts/default',
    uid: '3233be5f-c9a3-11e9-a380-025000000001'
  },
  secrets: [
    {
      name: 'default-token-dcb4b'
    }
  ]
};

const serviceAccount1 = {
  apiVersion: 'v1',
  kind: 'ServiceAccount',
  metadata: {
    annotations: {
      'kubectl.kubernetes.io/last-applied-configuration':
        '{"apiVersion":"v1","kind":"ServiceAccount","metadata":{"annotations":{},"labels":{"app":"tekton-dashboard"},"name":"tekton-dashboard","namespace":"tekton-pipelines"}}\n'
    },
    creationTimestamp: '2019-09-11T09:01:24Z',
    labels: {
      app: 'tekton-dashboard'
    },
    name: 'tekton-dashboard',
    namespace: 'tekton-pipelines',
    resourceVersion: '333387',
    selfLink:
      '/api/v1/namespaces/tekton-pipelines/serviceaccounts/tekton-dashboard',
    uid: 'bb5a9a2c-d472-11e9-a380-025000000001'
  },
  secrets: [
    {
      name: 'tekton-dashboard-token-6xdwf'
    },
    {
      name: 'secret-name'
    }
  ]
};

const serviceAccount2 = {
  apiVersion: 'v1',
  kind: 'ServiceAccount',
  metadata: {
    annotations: {
      'kubectl.kubernetes.io/last-applied-configuration':
        '{"apiVersion":"v1","kind":"ServiceAccount","metadata":{"annotations":{},"labels":{"app":"tekton-dashboard"},"name":"tekton-dashboard","namespace":"tekton-pipelines"}}\n'
    },
    creationTimestamp: '2019-09-11T09:01:24Z',
    labels: {
      app: 'tekton-dashboard'
    },
    name: 'Groot',
    namespace: 'tekton-pipelines',
    resourceVersion: '333387',
    selfLink:
      '/api/v1/namespaces/tekton-pipelines/serviceaccounts/tekton-dashboard',
    uid: 'bb5a9a2c-d472-11e9-a380-025000000001'
  },
  secrets: [
    {
      name: 'tekton-dashboard-token-6xdwf'
    }
  ]
};

const serviceAccountList = { items: serviceAccountFail };
const serviceAccountListMultipleWithNoSecretName = {
  items: serviceAccountFail,
  serviceAccountPass
};
const serviceAccountListMultiple = {
  items: serviceAccountFail,
  serviceAccountPass,
  serviceAccountPassV2
};

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
  fetchMock.delete(`end:${name}`, data);
  return index.deletePipelineRun({ name }).then(pipelineRun => {
    expect(pipelineRun).toEqual(data);
    fetchMock.restore();
  });
});

it('deletePipelineRun', () => {
  const name = 'foo';
  const data = { fake: 'pipelineRun' };
  fetchMock.delete(`end:${name}`, data);
  return index.deletePipelineRun({ name }).then(pipelineRun => {
    expect(pipelineRun).toEqual(data);
    fetchMock.restore();
  });
});

it('deletePipelineRun', () => {
  const name = 'foo';
  const data = { fake: 'pipelineRun' };
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
  const payload = { pipelineName, resources, params, serviceAccount, timeout };
  const data = {
    apiVersion: 'tekton.dev/v1alpha1',
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
      serviceAccount,
      timeout
    }
  };
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
    expect(response).toEqual(data);
    fetchMock.restore();
  });
});

it('getCredential', () => {
  const credentialId = 'foo';
  const data = { fake: 'credential' };
  fetchMock.get(`end:${credentialId}`, data);
  return index.getCredential(credentialId).then(credential => {
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
  const url = 'url';
  const extensions = [{ displayname: displayName, name, bundlelocation, url }];
  const transformedExtensions = [{ displayName, name, source, url }];
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

// Checks that doesnt break when a secret is deleted when not patched to a service account
it('getSecretServiceAccountList Function doesnt break if recieves empty data', () => {
  const dataFail = [];

  return index
    .getSecretServiceAccountList(dataFail, 'secret-name')
    .then(response => {
      expect(response).toEqual([]);
    });
});

it('getSecretServiceAccountList No Secrets Matched', () => {
  const data = serviceAccountFail;
  return index
    .getSecretServiceAccountList(data, 'secret-name')
    .then(response => {
      expect(response).toEqual([]);
    });
});

it('getSecretServiceAccountList one Secret Matched', () => {
  const data = [serviceAccountPass];

  return index
    .getSecretServiceAccountList(data, 'secret-name')
    .then(response => {
      expect(response).toEqual(data);
    });
});

it('getSecretServiceAccountList two Secrets Matched', () => {
  const data = [serviceAccountPass];

  return index
    .getSecretServiceAccountList(data, 'secret-name')
    .then(response => {
      expect(response).toEqual(data);
    });
});

it('getSecretServiceAccountList two Secrets Matched with multiple service accounts', () => {
  const data = [serviceAccountPass, serviceAccount1, serviceAccount2];

  const dataExpected = [serviceAccountPass, serviceAccount1];

  return index
    .getSecretServiceAccountList(data, 'secret-name')
    .then(response => {
      expect(response).toEqual(dataExpected);
    });
});

it('getCredential', () => {
  const credentialId = 'foo';
  const data = { fake: 'credential' };
  fetchMock.get(`end:${credentialId}`, data);
  return index.getCredential(credentialId).then(credential => {
    expect(credential).toEqual(data);
    fetchMock.restore();
  });
});

it('getIndexOfSecret returns the correct data when secret exists', () => {
  const data = [
    {
      name: 'default-token-dcb4b'
    },
    {
      name: 'secret-name'
    }
  ];
  const response = index.getIndexOfSecret(data, 'secret-name');
  expect(response).toEqual(1);
});

it('getIndexOfSecret returns the correct data when the secret does not exist', () => {
  const data = [
    {
      name: 'default-token-dcb4b'
    }
  ];
  const response = index.getIndexOfSecret(data, 'secret-name');
  expect(response).toEqual(-1);
});

it('getIndexOfSecret returns the correct response when no secrets sent', () => {
  const data = [];
  const response = index.getIndexOfSecret(data, 'secret-name');
  expect(response).toEqual(-1);
});

it('getIndexOfSecret returns the correct data when a secret exists and has secrets after', () => {
  const data = [
    {
      name: 'default-token-dcb4b'
    },
    {
      name: 'secret-name'
    },
    {
      name: 'Groot'
    }
  ];
  const response = index.getIndexOfSecret(data, 'secret-name');
  expect(response).toEqual(1);
});

describe('getIndexAndRemove', () => {
  it('returns the correct response when a secret is found', () => {
    const data = { fake: 'request patch data' };

    jest.spyOn(comms, 'patchRemoveSecret').mockImplementation(() => data);
    return index
      .getIndexAndRemove(serviceAccountPass, 'secret-name', 'tekton-pipelines')
      .then(response => {
        expect(response).toEqual(data);
        fetchMock.restore();
      });
  });
});

describe('unpatchServiceAccount', () => {
  it('doesnt break when a secret is not patched to any service accounts', () => {
    const dataResponse = 'Completed unpatching';

    const data = serviceAccountList;
    fetchMock.get(/serviceaccounts/, data);

    jest
      .spyOn(index, 'getServiceAccounts')
      .mockImplementation(() => serviceAccountList);
    return index
      .unpatchServiceAccount('secret-name', 'default')
      .then(response => {
        expect(response).toEqual(dataResponse);
        fetchMock.restore();
      });
  });

  it('returns the correct response when a secret is patched to a single service accounts with a only one passing', () => {
    const dataResponse = 'Completed unpatching';

    const data = serviceAccountListMultipleWithNoSecretName;
    fetchMock.get(/serviceaccounts/, data);

    jest
      .spyOn(index, 'getServiceAccounts')
      .mockImplementation(() => serviceAccountList);
    return index
      .unpatchServiceAccount('secret-name', 'default')
      .then(response => {
        expect(response).toEqual(dataResponse);
        fetchMock.restore();
      });
  });

  it('returns the correct response when a secret is patched to a single service accounts with multiple passing', () => {
    const dataResponse = 'Completed unpatching';

    const data = serviceAccountListMultiple;
    fetchMock.get(/serviceaccounts/, data);

    jest
      .spyOn(index, 'getServiceAccounts')
      .mockImplementation(() => serviceAccountList);
    return index
      .unpatchServiceAccount('secret-name', 'default')
      .then(response => {
        expect(response).toEqual(dataResponse);
        fetchMock.restore();
      });
  });
});

it('patchServiceAccount', () => {
  const data = 'data';
  jest.spyOn(comms, 'patchAddSecret').mockImplementation(() => data);
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
