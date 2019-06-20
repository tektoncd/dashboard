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
import { fetchTask, fetchTasks } from './tasks';

it('fetchTask', async () => {
  jest.spyOn(creators, 'fetchNamespacedResource');
  const name = 'taskName';
  const namespace = 'namespace';
  fetchTask({ name, namespace });
  expect(creators.fetchNamespacedResource).toHaveBeenCalledWith(
    'Task',
    API.getTask,
    { name, namespace }
  );
});

it('fetchTasks', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  const namespace = 'namespace';
  fetchTasks({ namespace });
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'Task',
    API.getTasks,
    { namespace }
  );
});

it('fetchTasks no params', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  fetchTasks();
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'Task',
    API.getTasks,
    { namespace: undefined }
  );
});
