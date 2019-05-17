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

import pipelinesReducer, * as selectors from './pipelines';

it('handles init or unknown actions', () => {
  expect(pipelinesReducer(undefined, { type: 'does_not_exist' })).toEqual({
    byId: {},
    byNamespace: {},
    errorMessage: null,
    isFetching: false
  });
});

it('PIPELINES_FETCH_REQUEST', () => {
  const action = { type: 'PIPELINES_FETCH_REQUEST' };
  const state = pipelinesReducer({}, action);
  expect(selectors.isFetchingPipelines(state)).toBe(true);
});

it('PIPELINES_FETCH_SUCCESS', () => {
  const name = 'pipeline name';
  const namespace = 'default';
  const uid = 'some-uid';
  const pipeline = {
    metadata: {
      name,
      namespace,
      uid
    },
    other: 'content'
  };
  const action = {
    type: 'PIPELINES_FETCH_SUCCESS',
    data: [pipeline],
    namespace
  };

  const state = pipelinesReducer({}, action);
  expect(selectors.getPipelines(state, namespace)).toEqual([pipeline]);
  expect(selectors.getPipeline(state, name, namespace)).toEqual(pipeline);
  expect(selectors.isFetchingPipelines(state)).toBe(false);
});

it('PIPELINES_FETCH_FAILURE', () => {
  const message = 'fake error message';
  const error = { message };
  const action = {
    type: 'PIPELINES_FETCH_FAILURE',
    error
  };

  const state = pipelinesReducer({}, action);
  expect(selectors.getPipelinesErrorMessage(state)).toEqual(message);
});

it('getPipelines', () => {
  const namespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getPipelines(state, namespace)).toEqual([]);
});

it('getPipeline', () => {
  const name = 'name';
  const namespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getPipeline(state, name, namespace)).toBeNull();
});
