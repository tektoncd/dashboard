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
    case 'PipelineRunCreated':
    case 'PipelineRunUpdated':
      const runById = { [action.payload.metadata.uid]: action.payload };
      return merge({}, state, runById);
    case 'PipelineRunDeleted':
      const newState = { ...state };
      delete newState[action.payload.metadata.uid];
      return newState;
    case 'PIPELINE_RUNS_FETCH_SUCCESS':
      return { ...state, ...keyBy(action.data, 'metadata.uid') };
    default:
      return state;
  }
}

function byNamespace(state = {}, action) {
  switch (action.type) {
    case 'PipelineRunCreated':
    case 'PipelineRunUpdated':
      const run = {
        [action.payload.metadata.namespace]: {
          [action.payload.metadata.name]: action.payload.metadata.uid
        }
      };
      return merge({}, state, run);
    case 'PipelineRunDeleted':
      const newState = { ...state };
      delete newState[action.payload.metadata.namespace][
        action.payload.metadata.name
      ];
      return newState;
    case 'PIPELINE_RUNS_FETCH_SUCCESS':
      const namespaces = action.data.reduce((accumulator, pipelineRun) => {
        const { name, namespace, uid } = pipelineRun.metadata;
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
    case 'PIPELINE_RUNS_FETCH_REQUEST':
      return true;
    case 'PIPELINE_RUNS_FETCH_SUCCESS':
    case 'PIPELINE_RUNS_FETCH_FAILURE':
      return false;
    default:
      return state;
  }
}

function errorMessage(state = null, action) {
  switch (action.type) {
    case 'PIPELINE_RUNS_FETCH_FAILURE':
      return action.error.message;
    case 'PIPELINE_RUNS_FETCH_REQUEST':
    case 'PIPELINE_RUNS_FETCH_SUCCESS':
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

export function getPipelineRuns(state, namespace) {
  if (namespace === ALL_NAMESPACES) {
    return Object.values(state.byId);
  }

  const pipelineRuns = state.byNamespace[namespace];
  return pipelineRuns
    ? Object.values(pipelineRuns).map(id => state.byId[id])
    : [];
}

export function getPipelineRun(state, name, namespace) {
  const pipelineRuns = state.byNamespace[namespace] || {};
  const pipelineRunId = pipelineRuns[name];
  return pipelineRunId ? state.byId[pipelineRunId] : null;
}

export function getPipelineRunsErrorMessage(state) {
  return state.errorMessage;
}

export function isFetchingPipelineRuns(state) {
  return state.isFetching;
}
