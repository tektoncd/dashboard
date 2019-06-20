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

import clusterTasksReducer, * as selectors from './clusterTasks';

const name = 'clusterTask';
const uid = 'some-uid';
const clusterTask = {
  metadata: {
    name,
    uid
  },
  other: 'content'
};

it('handles init or unknown actions', () => {
  expect(clusterTasksReducer(undefined, { type: 'does_not_exist' })).toEqual({
    byName: {},
    errorMessage: null,
    isFetching: false
  });
});

it('CLUSTER_TASKS_FETCH_REQUEST', () => {
  const action = { type: 'CLUSTER_TASKS_FETCH_REQUEST' };
  const state = clusterTasksReducer({}, action);
  expect(selectors.isFetchingClusterTasks(state)).toBe(true);
});

it('CLUSTER_TASKS_FETCH_SUCCESS', () => {
  const action = {
    type: 'CLUSTER_TASKS_FETCH_SUCCESS',
    data: [clusterTask]
  };

  const state = clusterTasksReducer({}, action);
  expect(selectors.getClusterTasks(state)).toEqual([clusterTask]);
  expect(selectors.isFetchingClusterTasks(state)).toBe(false);
});

it('ClusterTask Events', () => {
  const action = {
    type: 'ClusterTaskCreated',
    payload: clusterTask
  };

  const state = clusterTasksReducer({}, action);
  expect(selectors.getClusterTasks(state)).toEqual([clusterTask]);
  expect(selectors.isFetchingClusterTasks(state)).toBe(false);

  const updatedClusterTask = {
    metadata: {
      name,
      uid
    },
    other: 'differentcontent'
  };

  const updateAction = {
    type: 'ClusterTaskUpdated',
    payload: updatedClusterTask
  };

  const updatedState = clusterTasksReducer({}, updateAction);
  expect(selectors.getClusterTasks(updatedState)).toEqual([updatedClusterTask]);
  expect(selectors.isFetchingClusterTasks(updatedState)).toBe(false);

  const deleteAction = {
    type: 'ClusterTaskDeleted',
    payload: updatedClusterTask
  };

  const deletedState = clusterTasksReducer(state, deleteAction);
  expect(selectors.getClusterTasks(deletedState)).toEqual([]);
  expect(selectors.isFetchingClusterTasks(deletedState)).toBe(false);
});

it('CLUSTER_TASKS_FETCH_FAILURE', () => {
  const message = 'fake error message';
  const error = { message };
  const action = {
    type: 'CLUSTER_TASKS_FETCH_FAILURE',
    error
  };

  const state = clusterTasksReducer({}, action);
  expect(selectors.getClusterTasksErrorMessage(state)).toEqual(message);
});
