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
import { fetchTaskRun, fetchTaskRuns } from './taskRuns';
import * as creators from './actionCreators';

it('fetchTaskRun', async () => {
  jest.spyOn(creators, 'fetchNamespacedResource');
  const name = 'taskRunName';
  const namespace = 'default';

  fetchTaskRun({ name, namespace });
  expect(creators.fetchNamespacedResource).toHaveBeenCalledWith(
    'TaskRun',
    API.getTaskRun,
    { name, namespace }
  );
});

it('fetchTaskRuns', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  const namespace = 'namespace';
  const filters = ['someFilter'];
  fetchTaskRuns({ filters, namespace });
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'TaskRun',
    API.getTaskRuns,
    { filters, namespace }
  );
});

it('fetchTaskRuns no params', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  fetchTaskRuns();
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'TaskRun',
    API.getTaskRuns,
    { namespace: undefined }
  );
});
