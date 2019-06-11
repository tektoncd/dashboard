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

import { combineReducers } from 'redux';
import keyBy from 'lodash.keyby';
import merge from 'lodash.merge';

import { ALL_NAMESPACES } from '../constants';

function byId(state = {}, action) {
  switch (action.type) {
    case 'TaskCreated':
    case 'TaskUpdated':
      const resourceById = { [action.payload.metadata.uid]: action.payload };
      return merge({}, state, resourceById);
    case 'TaskDeleted':
      const newState = { ...state };
      delete newState[action.payload.metadata.uid];
      return newState;
    case 'TASKS_FETCH_SUCCESS':
      return { ...state, ...keyBy(action.data, 'metadata.uid') };
    default:
      return state;
  }
}

function byNamespace(state = {}, action) {
  switch (action.type) {
    case 'TaskCreated':
    case 'TaskUpdated':
      const resource = {
        [action.payload.metadata.namespace]: {
          [action.payload.metadata.name]: action.payload.metadata.uid
        }
      };
      return merge({}, state, resource);
    case 'TaskDeleted':
      const newState = { ...state };
      delete newState[action.payload.metadata.namespace][
        action.payload.metadata.name
      ];
      return newState;
    case 'TASKS_FETCH_SUCCESS':
      const namespaces = action.data.reduce((accumulator, task) => {
        const { name, namespace, uid } = task.metadata;
        return merge(accumulator, {
          [namespace]: {
            [name]: uid
          }
        });
      }, {});

      return merge({}, state, namespaces);
    default:
      return state;
  }
}

function isFetching(state = false, action) {
  switch (action.type) {
    case 'TASKS_FETCH_REQUEST':
      return true;
    case 'TASKS_FETCH_SUCCESS':
    case 'TASKS_FETCH_FAILURE':
      return false;
    default:
      return state;
  }
}

function errorMessage(state = null, action) {
  switch (action.type) {
    case 'TASKS_FETCH_FAILURE':
      return action.error.message;
    case 'TASKS_FETCH_REQUEST':
    case 'TASKS_FETCH_SUCCESS':
      return null;
    default:
      return state;
  }
}

export default combineReducers({
  byId,
  byNamespace,
  errorMessage,
  isFetching
});

export function getTasks(state, namespace) {
  if (namespace === ALL_NAMESPACES) {
    return Object.values(state.byId);
  }

  const tasks = state.byNamespace[namespace];
  return tasks ? Object.values(tasks).map(id => state.byId[id]) : [];
}

export function getTask(state, name, namespace) {
  const tasks = state.byNamespace[namespace] || {};
  const taskId = tasks[name];
  return taskId ? state.byId[taskId] : null;
}

export function getTasksErrorMessage(state) {
  return state.errorMessage;
}

export function isFetchingTasks(state) {
  return state.isFetching;
}
