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
import { fetchPipelineRun, fetchPipelineRuns } from './pipelineRuns';

it('fetchPipelineRun', async () => {
  jest.spyOn(creators, 'fetchNamespacedResource');
  const name = 'pipelineRunName';
  const namespace = 'namespace';
  fetchPipelineRun({ name, namespace });
  expect(creators.fetchNamespacedResource).toHaveBeenCalledWith(
    'PipelineRun',
    API.getPipelineRun,
    { name, namespace }
  );
});

it('fetchPipelineRuns', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  const namespace = 'namespace';
  const filters = ['someFilter'];
  fetchPipelineRuns({ filters, namespace });
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'PipelineRun',
    API.getPipelineRuns,
    { namespace, filters }
  );
});

it('fetchPipelineRuns no params', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  fetchPipelineRuns();
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'PipelineRun',
    API.getPipelineRuns,
    { namespace: undefined }
  );
});
