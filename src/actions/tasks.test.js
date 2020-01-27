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
  fetchClusterTask,
  fetchClusterTasks,
  fetchTask,
  fetchTaskByType,
  fetchTasks
} from './tasks';

it('fetchTask', () => {
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

it('fetchTasks', () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  const namespace = 'namespace';
  fetchTasks({ namespace });
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'Task',
    API.getTasks,
    { namespace }
  );
});

it('fetchTasks no params', () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  fetchTasks();
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'Task',
    API.getTasks,
    { filters: undefined, namespace: undefined }
  );
});

it('fetchClusterTask', () => {
  jest.spyOn(creators, 'fetchResource');
  const name = 'clusterTaskName';
  fetchClusterTask(name);
  expect(creators.fetchResource).toHaveBeenCalledWith(
    'ClusterTask',
    API.getClusterTask,
    { name }
  );
});

it('fetchClusterTasks', () => {
  jest.spyOn(creators, 'fetchCollection');
  fetchClusterTasks();
  expect(creators.fetchCollection).toHaveBeenCalledWith(
    'ClusterTask',
    API.getClusterTasks,
    { filters: undefined }
  );
});

it('fetchClusterTaskByType', () => {
  jest.spyOn(creators, 'fetchResource');
  const name = 'clusterTaskName';
  fetchTaskByType(name, 'clustertasks');
  expect(creators.fetchResource).toHaveBeenCalledWith(
    'ClusterTask',
    API.getClusterTask,
    { name }
  );
});

it('fetchTaskByType', () => {
  jest.spyOn(creators, 'fetchResource');
  const name = 'clusterTaskName';

  jest.spyOn(creators, 'fetchNamespacedResource');
  const namespace = 'namespace';
  fetchTaskByType(name, 'tasks', namespace);
  expect(creators.fetchNamespacedResource).toHaveBeenCalledWith(
    'Task',
    API.getTask,
    { name, namespace }
  );
});
