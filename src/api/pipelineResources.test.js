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

import * as API from './pipelineResources';
import * as utils from './utils';

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
  return API.createPipelineResource({ namespace, payload }).then(response => {
    expect(response).toEqual(data);
    fetchMock.restore();
  });
});

it('deletePipelineResource', () => {
  const name = 'foo';
  const data = { fake: 'pipelineResource' };
  fetchMock.delete(`end:${name}`, data);
  return API.deletePipelineResource({ name }).then(pipelineResource => {
    expect(pipelineResource).toEqual(data);
    fetchMock.restore();
  });
});

it('getPipelineResources', () => {
  const data = {
    items: 'pipelineResources'
  };
  fetchMock.get(/pipelineresources/, data);
  return API.getPipelineResources().then(pipelineResources => {
    expect(pipelineResources).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getPipelineResource', () => {
  const name = 'foo';
  const data = { fake: 'pipelineResource' };
  fetchMock.get(`end:${name}`, data);
  return API.getPipelineResource({ name }).then(pipelineResource => {
    expect(pipelineResource).toEqual(data);
    fetchMock.restore();
  });
});

it('usePipelineResources', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.usePipelineResources(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    'PipelineResource',
    API.getPipelineResources,
    params
  );
});

it('usePipelineResource', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.usePipelineResource(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    'PipelineResource',
    API.getPipelineResource,
    params
  );
});
