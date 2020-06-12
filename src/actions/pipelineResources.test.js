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

import * as API from '../api';
import * as creators from './actionCreators';
import {
  fetchPipelineResource,
  fetchPipelineResources
} from './pipelineResources';

it('fetchPipelineResource', async () => {
  jest.spyOn(creators, 'fetchNamespacedResource');
  const name = 'pipelineResourceName';
  const namespace = 'namespace';
  fetchPipelineResource({ name, namespace });
  expect(creators.fetchNamespacedResource).toHaveBeenCalledWith(
    'PipelineResource',
    API.getPipelineResource,
    {
      name,
      namespace
    }
  );
});

it('fetchPipelineResources', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  const namespace = 'namespace';
  fetchPipelineResources({ namespace });
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'PipelineResource',
    API.getPipelineResources,
    {
      namespace
    }
  );
});

it('fetchPipelineResources no namespace', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  fetchPipelineResources();
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'PipelineResource',
    API.getPipelineResources,
    {
      namespace: undefined
    }
  );
});
