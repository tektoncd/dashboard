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
  const name = 'pipeline name';
  const namespace = 'default';
  const uid = 'some-uid';
  const pipelineRun = {
    metadata: {
      name,
      namespace,
      uid
    },
    other: 'content'
  };
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
  const namespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getPipelineRuns(state, namespace)).toEqual([]);
});

it('getPipelineRuns all namespaces', () => {
  const namespace = ALL_NAMESPACES;
  const pipelineRun = { fake: 'pipelineRun' };
  const state = { byId: { id: pipelineRun } };
  expect(selectors.getPipelineRuns(state, namespace)).toEqual([pipelineRun]);
});

it('getPipelineRun', () => {
  const name = 'name';
  const namespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getPipelineRun(state, name, namespace)).toBeNull();
});
