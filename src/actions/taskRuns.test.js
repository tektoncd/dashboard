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
import { fetchTaskRun, fetchTaskRuns, fetchTaskRunsSuccess } from './taskRuns';

it('fetchTaskRunsSuccess', () => {
  const data = { fake: 'data' };
  expect(fetchTaskRunsSuccess(data)).toEqual({
    type: 'TASK_RUNS_FETCH_SUCCESS',
    data
  });
});

it('fetchTaskRuns', async () => {
  const namespace = 'default';
  const tasks = { fake: 'tasks' };
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest.spyOn(API, 'getTaskRuns').mockImplementation(() => tasks);

  const expectedActions = [
    { type: 'TASK_RUNS_FETCH_REQUEST' },
    fetchTaskRunsSuccess(tasks)
  ];

  await store.dispatch(fetchTaskRuns());
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchTaskRun', async () => {
  const namespace = 'default';
  const task = { fake: 'task' };
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest.spyOn(API, 'getTaskRun').mockImplementation(() => task);

  const expectedActions = [
    { type: 'TASK_RUNS_FETCH_REQUEST' },
    fetchTaskRunsSuccess([task])
  ];

  await store.dispatch(fetchTaskRun());
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchTaskRuns error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error();

  jest.spyOn(API, 'getTaskRuns').mockImplementation(() => {
    throw error;
  });

  const expectedActions = [
    { type: 'TASK_RUNS_FETCH_REQUEST' },
    { type: 'TASK_RUNS_FETCH_FAILURE', error }
  ];

  await store.dispatch(fetchTaskRuns());
  expect(store.getActions()).toEqual(expectedActions);
});
