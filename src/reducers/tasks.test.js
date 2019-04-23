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

import tasksReducer, * as selectors from './tasks';

it('handles init or unknown actions', () => {
  expect(tasksReducer(undefined, { type: 'does_not_exist' })).toEqual({
    byName: {},
    errorMessage: null,
    isFetching: false
  });
});

it('TASKS_FETCH_REQUEST', () => {
  const action = { type: 'TASKS_FETCH_REQUEST' };
  const state = tasksReducer({}, action);
  expect(selectors.isFetchingTasks(state)).toBe(true);
});

it('TASKS_FETCH_SUCCESS', () => {
  const name = 'task name';
  const task = {
    metadata: {
      name
    },
    other: 'content'
  };
  const action = {
    type: 'TASKS_FETCH_SUCCESS',
    data: [task]
  };

  const state = tasksReducer({}, action);
  expect(selectors.getTasks(state)).toEqual([task]);
  expect(selectors.getTask(state, name)).toEqual(task);
  expect(selectors.isFetchingTasks(state)).toBe(false);
});

it('TASKS_FETCH_FAILURE', () => {
  const message = 'fake error message';
  const error = { message };
  const action = {
    type: 'TASKS_FETCH_FAILURE',
    error
  };

  const state = tasksReducer({}, action);
  expect(selectors.getTasksErrorMessage(state)).toEqual(message);
});
