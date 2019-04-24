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
import { ALL_NAMESPACES } from '../constants';

const createTaskRun = (name, namespace, uid, content = 'other') => {
  return {
    metadata: {
      name,
      namespace,
      uid
    },
    other: content
  };
};

const name = 'task name';
const namespace = 'default';
const uid = 'some-uid';
const taskRun = createTaskRun(name, namespace, uid);

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

it('TaskRun Events', () => {
  const action = {
    type: 'TaskRunCreated',
    payload: taskRun,
    namespace
  };

  const state = taskRunsReducer({}, action);
  expect(selectors.getTaskRuns(state, namespace)).toEqual([taskRun]);
  expect(selectors.getTaskRun(state, name, namespace)).toEqual(taskRun);
  expect(selectors.isFetchingTaskRuns(state)).toBe(false);

  // update the task run
  const updatedTaskRun = createTaskRun(name, namespace, uid, 'updated content');
  const updateAction = {
    type: 'TaskRunUpdated',
    payload: updatedTaskRun,
    namespace
  };
  const updatedState = taskRunsReducer(state, updateAction);
  expect(selectors.getTaskRuns(updatedState, namespace)).toEqual([
    updatedTaskRun
  ]);
  expect(selectors.getTaskRun(updatedState, name, namespace)).toEqual(
    updatedTaskRun
  );

  // delete the task run
  const deleteAction = {
    type: 'TaskRunDeleted',
    payload: taskRun,
    namespace
  };

  const deletedTaskRunState = taskRunsReducer(state, deleteAction);
  expect(selectors.getTaskRuns(deletedTaskRunState, namespace)).toEqual([]);
  expect(selectors.getTaskRun(deletedTaskRunState, name, namespace)).toBeNull();
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

it('getTaskRuns', () => {
  const selectedNamespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getTaskRuns(state, selectedNamespace)).toEqual([]);
});

it('getTaskRuns all namespaces', () => {
  const selectedNamespace = ALL_NAMESPACES;
  const selectedTaskRun = { fake: 'taskRun' };
  const state = { byId: { id: selectedTaskRun } };
  expect(selectors.getTaskRuns(state, selectedNamespace)).toEqual([
    selectedTaskRun
  ]);
});

it('getTaskRun', () => {
  const selectedName = 'name';
  const selectedNamespace = 'namespace';
  const state = { byNamespace: {} };
  expect(
    selectors.getTaskRun(state, selectedName, selectedNamespace)
  ).toBeNull();
});
