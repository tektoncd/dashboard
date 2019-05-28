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

import { getTask, getTasks } from '../api';
import { getSelectedNamespace } from '../reducers';

export function fetchTasksSuccess(data) {
  return {
    type: 'TASKS_FETCH_SUCCESS',
    data
  };
}

export function fetchTask({ name, namespace }) {
  return async (dispatch, getState) => {
    dispatch({ type: 'TASKS_FETCH_REQUEST' });
    let task;
    try {
      const requestedNamespace = namespace || getSelectedNamespace(getState());
      task = await getTask(name, requestedNamespace);
      dispatch(fetchTasksSuccess([task]));
    } catch (error) {
      dispatch({ type: 'TASKS_FETCH_FAILURE', error });
    }
    return task;
  };
}

export function fetchTasks({ namespace } = {}) {
  return async (dispatch, getState) => {
    dispatch({ type: 'TASKS_FETCH_REQUEST' });
    let tasks;
    try {
      const requestedNamespace = namespace || getSelectedNamespace(getState());
      tasks = await getTasks(requestedNamespace);
      dispatch(fetchTasksSuccess(tasks));
    } catch (error) {
      dispatch({ type: 'TASKS_FETCH_FAILURE', error });
    }
    return tasks;
  };
}
