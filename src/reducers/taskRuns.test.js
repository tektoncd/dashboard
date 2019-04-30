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

import taskRunsReducer, * as selectors from './taskRuns';

it('handles init or unknown actions', () => {
  expect(taskRunsReducer(undefined, { type: 'does_not_exist' })).toEqual({
    byId: {},
    byNamespace: {},
    errorMessage: null,
    isFetching: false
  });
});

it('TASK_RUNS_FETCH_REQUEST', () => {
  const action = { type: 'TASK_RUNS_FETCH_REQUEST' };
  const state = taskRunsReducer({}, action);
  expect(selectors.isFetchingTaskRuns(state)).toBe(true);
});

it('TASK_RUNS_FETCH_SUCCESS', () => {
  const name = 'pipeline name';
  const namespace = 'default';
  const uid = 'some-uid';
  const taskRun = {
    metadata: {
      name,
      namespace,
      uid
    },
    other: 'content'
  };
  const action = {
    type: 'TASK_RUNS_FETCH_SUCCESS',
    data: [taskRun],
    namespace
  };

  const state = taskRunsReducer({}, action);
  expect(selectors.getTaskRuns(state, namespace)).toEqual([taskRun]);
  expect(selectors.getTaskRun(state, name, namespace)).toEqual(taskRun);
  expect(selectors.isFetchingTaskRuns(state)).toBe(false);
});

it('TASK_RUNS_FETCH_FAILURE', () => {
  const message = 'fake error message';
  const error = { message };
  const action = {
    type: 'TASK_RUNS_FETCH_FAILURE',
    error
  };

  const state = taskRunsReducer({}, action);
  expect(selectors.getTaskRunsErrorMessage(state)).toEqual(message);
});

it('getPipelineRuns', () => {
  const namespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getTaskRuns(state, namespace)).toEqual([]);
});

it('getPipelineRun', () => {
  const name = 'name';
  const namespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getTaskRun(state, name, namespace)).toBeNull();
});
