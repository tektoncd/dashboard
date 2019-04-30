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

function byId(state = {}, action) {
  switch (action.type) {
    case 'PIPELINE_RUNS_FETCH_SUCCESS':
      return { ...state, ...keyBy(action.data, 'metadata.uid') };
    default:
      return state;
  }
}

function byNamespace(state = {}, action) {
  switch (action.type) {
    case 'PIPELINE_RUNS_FETCH_SUCCESS':
      const { namespace } = action;
      const pipelineRuns = state[namespace] || {};
      action.data.forEach(pipelineRun => {
        const { name, uid } = pipelineRun.metadata;
        pipelineRuns[name] = uid;
      });

      return {
        ...state,
        [namespace]: pipelineRuns
      };
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
