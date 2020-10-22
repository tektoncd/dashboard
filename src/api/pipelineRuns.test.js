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
import { labels } from '@tektoncd/dashboard-utils';

import * as API from './pipelineRuns';
import { mockCSRFToken } from '../utils/test';

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
  return API.cancelPipelineRun({ name, namespace }).then(() => {
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
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
        [labels.PIPELINE]: pipelineName,
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
  fetchMock.post('*', { body: data, status: 201 });
  return API.createPipelineRun(payload).then(response => {
    expect(response).toEqual(data);
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(data)
    });
    fetchMock.restore();
    mockDateNow.mockRestore();
  });
});

it('createPipelineRun with nodeSelector', () => {
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
    timeout,
    nodeSelector: {
      disk: 'ssd'
    }
  };
  const data = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    metadata: {
      name: `${pipelineName}-run-${Date.now()}`,
      labels: {
        [labels.PIPELINE]: pipelineName,
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
      podTemplate: {
        nodeSelector: {
          disk: 'ssd'
        }
      },
      serviceAccountName: serviceAccount,
      timeout
    }
  };
  mockCSRFToken();
  fetchMock.post('*', { body: data, status: 201 });
  return API.createPipelineRun(payload).then(response => {
    expect(response).toEqual(data);
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(data)
    });
    fetchMock.restore();
    mockDateNow.mockRestore();
  });
});

it('deletePipelineRun', () => {
  const name = 'foo';
  const data = { fake: 'pipelineRun' };
  mockCSRFToken();
  fetchMock.delete(`end:${name}`, data);
  return API.deletePipelineRun({ name }).then(pipelineRun => {
    expect(pipelineRun).toEqual(data);
    fetchMock.restore();
  });
});

it('getPipelineRun', () => {
  const name = 'foo';
  const data = { fake: 'pipelineRun' };
  fetchMock.get(`end:${name}`, data);
  return API.getPipelineRun({ name }).then(pipelineRun => {
    expect(pipelineRun).toEqual(data);
    fetchMock.restore();
  });
});

it('getPipelineRuns', () => {
  const data = {
    items: 'pipelineRuns'
  };
  fetchMock.get(/pipelineruns/, data);
  return API.getPipelineRuns({ filters: [] }).then(pipelineRuns => {
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
  return API.getPipelineRuns({ pipelineName, filters: [] }).then(
    pipelineRuns => {
      expect(pipelineRuns).toEqual(data.items);
      fetchMock.restore();
    }
  );
});

it('rerunPipelineRun', () => {
  const filter = 'end:/pipelineruns/';
  const originalPipelineRun = {
    metadata: { name: 'fake_pipelineRun' },
    spec: { status: 'fake_status' },
    status: 'fake_status'
  };
  const newPipelineRun = { metadata: { name: 'fake_pipelineRun_rerun' } };
  mockCSRFToken();
  fetchMock.post(filter, { body: newPipelineRun, status: 201 });
  return API.rerunPipelineRun(originalPipelineRun).then(data => {
    const body = JSON.parse(fetchMock.lastCall(filter)[1].body);
    expect(body.metadata.generateName).toMatch(
      new RegExp(originalPipelineRun.metadata.name)
    );
    expect(body.status).toBeUndefined();
    expect(body.spec.status).toBeUndefined();
    expect(data).toEqual(newPipelineRun);
    fetchMock.restore();
  });
});
