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
import { ALL_NAMESPACES } from '../constants';

const createTask = (name, namespace, uid, content = 'other') => {
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
const task = createTask(name, namespace, uid);

it('handles init or unknown actions', () => {
  expect(tasksReducer(undefined, { type: 'does_not_exist' })).toEqual({
    byId: {},
    byNamespace: {},
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
  const action = {
    type: 'TASKS_FETCH_SUCCESS',
    data: [task],
    namespace
  };

  const state = tasksReducer({}, action);
  expect(selectors.getTasks(state, namespace)).toEqual([task]);
  expect(selectors.getTask(state, name, namespace)).toEqual(task);
  expect(selectors.isFetchingTasks(state)).toBe(false);
});

it('task Events', () => {
  const action = {
    type: 'TaskCreated',
    payload: task,
    namespace
  };

  const state = tasksReducer({}, action);
  expect(selectors.getTasks(state, namespace)).toEqual([task]);
  expect(selectors.getTask(state, name, namespace)).toEqual(task);
  expect(selectors.isFetchingTasks(state)).toBe(false);

  // update the task
  const updatedTask = createTask(name, namespace, uid, 'updated content');
  const updateAction = {
    type: 'TaskUpdated',
    payload: updatedTask,
    namespace
  };
  const updatedState = tasksReducer(state, updateAction);
  expect(selectors.getTasks(updatedState, namespace)).toEqual([updatedTask]);
  expect(selectors.getTask(updatedState, name, namespace)).toEqual(updatedTask);

  // delete the task
  const deleteAction = {
    type: 'TaskDeleted',
    payload: task,
    namespace
  };

  const deletedTaskState = tasksReducer(state, deleteAction);
  expect(selectors.getTasks(deletedTaskState, namespace)).toEqual([]);
  expect(selectors.getTask(deletedTaskState, name, namespace)).toBeNull();
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

it('getTasks', () => {
  const selectedNamespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getTasks(state, selectedNamespace)).toEqual([]);
});

it('getTasks all namespaces', () => {
  const selectedNamespace = ALL_NAMESPACES;
  const selectedTask = { fake: 'task' };
  const state = { byId: { id: selectedTask } };
  expect(selectors.getTasks(state, selectedNamespace)).toEqual([selectedTask]);
});

it('getTask', () => {
  const selectedName = 'name';
  const selectedNamespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getTask(state, selectedName, selectedNamespace)).toBeNull();
});
