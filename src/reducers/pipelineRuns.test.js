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

import pipelineRunsReducer, * as selectors from './pipelineRuns';
import { ALL_NAMESPACES } from '../constants';

const createPipelineRun = (name, namespace, uid, content = 'other') => {
  return {
    metadata: {
      name,
      namespace,
      uid
    },
    other: content
  };
};

const name = 'pipeline name';
const namespace = 'default';
const uid = 'some-uid';
const pipelineRun = createPipelineRun(name, namespace, uid);

it('handles init or unknown actions', () => {
  expect(pipelineRunsReducer(undefined, { type: 'does_not_exist' })).toEqual({
    byId: {},
    byNamespace: {},
    errorMessage: null,
    isFetching: false
  });
});

it('PIPELINE_RUNS_FETCH_REQUEST', () => {
  const action = { type: 'PIPELINE_RUNS_FETCH_REQUEST' };
  const state = pipelineRunsReducer({}, action);
  expect(selectors.isFetchingPipelineRuns(state)).toBe(true);
});

it('PIPELINE_RUNS_FETCH_SUCCESS', () => {
  const action = {
    type: 'PIPELINE_RUNS_FETCH_SUCCESS',
    data: [pipelineRun],
    namespace
  };

  const state = pipelineRunsReducer({}, action);
  expect(selectors.getPipelineRuns(state, namespace)).toEqual([pipelineRun]);
  expect(selectors.getPipelineRun(state, name, namespace)).toEqual(pipelineRun);
  expect(selectors.isFetchingPipelineRuns(state)).toBe(false);
});

it('PipelineRun Events', () => {
  const action = {
    type: 'PipelineRunCreated',
    payload: pipelineRun,
    namespace
  };

  const state = pipelineRunsReducer({}, action);
  expect(selectors.getPipelineRuns(state, namespace)).toEqual([pipelineRun]);
  expect(selectors.getPipelineRun(state, name, namespace)).toEqual(pipelineRun);
  expect(selectors.isFetchingPipelineRuns(state)).toBe(false);

  // update pipeline run
  const updatedPipelineRun = createPipelineRun(
    name,
    namespace,
    uid,
    'updated content'
  );
  const updateAction = {
    type: 'PipelineRunUpdated',
    payload: updatedPipelineRun,
    namespace
  };
  const updatedState = pipelineRunsReducer(state, updateAction);
  expect(selectors.getPipelineRuns(updatedState, namespace)).toEqual([
    updatedPipelineRun
  ]);
  expect(selectors.getPipelineRun(updatedState, name, namespace)).toEqual(
    updatedPipelineRun
  );

  // delete pipeline run

  const deleteAction = {
    type: 'PipelineRunDeleted',
    payload: pipelineRun,
    namespace
  };

  const deletedPipelineRunState = pipelineRunsReducer(
    updatedState,
    deleteAction
  );
  expect(selectors.getPipelineRuns(deletedPipelineRunState, namespace)).toEqual(
    []
  );
  expect(
    selectors.getPipelineRun(deletedPipelineRunState, name, namespace)
  ).toBeNull();
});

it('PIPELINE_RUNS_FETCH_FAILURE', () => {
  const message = 'fake error message';
  const error = { message };
  const action = {
    type: 'PIPELINE_RUNS_FETCH_FAILURE',
    error
  };

  const state = pipelineRunsReducer({}, action);
  expect(selectors.getPipelineRunsErrorMessage(state)).toEqual(message);
});

it('getPipelineRuns', () => {
  const selectedNamespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getPipelineRuns(state, selectedNamespace)).toEqual([]);
});

it('getPipelineRuns all namespaces', () => {
  const selectedNamespace = ALL_NAMESPACES;
  const state = { byId: { id: pipelineRun } };
  expect(selectors.getPipelineRuns(state, selectedNamespace)).toEqual([
    pipelineRun
  ]);
});

it('getPipelineRun', () => {
  const selectedNamespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getPipelineRun(state, name, selectedNamespace)).toBeNull();
});
