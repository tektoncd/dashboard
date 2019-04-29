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
import { fetchTasks, fetchTasksSuccess } from './tasks';

it('fetchTasksSuccess', () => {
  const data = { fake: 'data' };
  expect(fetchTasksSuccess(data)).toEqual({
    type: 'TASKS_FETCH_SUCCESS',
    data
  });
});

it('fetchTasks', async () => {
  const tasks = { fake: 'tasks' };
  const namespace = 'default';
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest.spyOn(API, 'getTasks').mockImplementation(() => tasks);

  const expectedActions = [
    { type: 'TASKS_FETCH_REQUEST' },
    fetchTasksSuccess(tasks, namespace)
  ];

  await store.dispatch(fetchTasks());
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchTasks error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error();

  jest.spyOn(API, 'getTasks').mockImplementation(() => {
    throw error;
  });

  const expectedActions = [
    { type: 'TASKS_FETCH_REQUEST' },
    { type: 'TASKS_FETCH_FAILURE', error }
  ];

  await store.dispatch(fetchTasks());
  expect(store.getActions()).toEqual(expectedActions);
});
