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

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as API from '../api';
import * as selectors from '../reducers';
import * as creators from './actionCreators';
import { fetchTask, fetchTasks, fetchTasksSuccess } from './tasks';

it('fetchTask', async () => {
  const task = { fake: 'task' };
  const namespace = 'default';
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest.spyOn(API, 'getTask').mockImplementation(() => task);

  const expectedActions = [
    { type: 'TASKS_FETCH_REQUEST' },
    fetchTasksSuccess([task])
  ];

  await store.dispatch(fetchTask({ name: 'foo' }));
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchTask error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error();

  jest.spyOn(API, 'getTask').mockImplementation(() => {
    throw error;
  });

  const expectedActions = [
    { type: 'TASKS_FETCH_REQUEST' },
    { type: 'TASKS_FETCH_FAILURE', error }
  ];

  await store.dispatch(fetchTask({ name: 'foo' }));
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchTasksSuccess', () => {
  const data = { fake: 'data' };
  expect(fetchTasksSuccess(data)).toEqual({
    type: 'TASKS_FETCH_SUCCESS',
    data
  });
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
