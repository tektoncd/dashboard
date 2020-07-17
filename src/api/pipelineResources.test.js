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

import * as API from './pipelineResources';
import { mockCSRFToken } from '../utils/test';

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
  return API.createPipelineResource({ namespace, payload }).then(response => {
    expect(response).toEqual(data);
    fetchMock.restore();
  });
});

it('deletePipelineResource', () => {
  const name = 'foo';
  const data = { fake: 'pipelineResource' };
  mockCSRFToken();
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
