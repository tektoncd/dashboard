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
import { ALL_NAMESPACES } from '../constants';

const createPipeline = (name, namespace, uid, content = 'other') => {
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
const pipeline = createPipeline(name, namespace, uid);

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

it('Pipeline Events', () => {
  const action = {
    type: 'PipelineCreated',
    payload: pipeline,
    namespace
  };

  const state = pipelinesReducer({}, action);
  expect(selectors.getPipelines(state, namespace)).toEqual([pipeline]);
  expect(selectors.getPipeline(state, name, namespace)).toEqual(pipeline);
  expect(selectors.isFetchingPipelines(state)).toBe(false);

  // update pipeline
  const updatedPipeline = createPipeline(
    name,
    namespace,
    uid,
    'updated content'
  );
  const updateAction = {
    type: 'PipelineUpdated',
    payload: updatedPipeline,
    namespace
  };
  const updatedState = pipelinesReducer(state, updateAction);
  expect(selectors.getPipelines(updatedState, namespace)).toEqual([
    updatedPipeline
  ]);
  expect(selectors.getPipeline(updatedState, name, namespace)).toEqual(
    updatedPipeline
  );

  // delete pipeline

  const deleteAction = {
    type: 'PipelineDeleted',
    payload: pipeline,
    namespace
  };

  const deletedPipelineState = pipelinesReducer(updatedState, deleteAction);
  expect(selectors.getPipelines(deletedPipelineState, namespace)).toEqual([]);
  expect(
    selectors.getPipeline(deletedPipelineState, name, namespace)
  ).toBeNull();
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
  const selectedNamespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getPipelines(state, selectedNamespace)).toEqual([]);
});

it('getPipelines all namespaces', () => {
  const selectedNamespace = ALL_NAMESPACES;
  const selectedPipeline = { fake: 'pipeline' };
  const state = { byId: { id: selectedPipeline } };
  expect(selectors.getPipelines(state, selectedNamespace)).toEqual([
    selectedPipeline
  ]);
});

it('getPipeline', () => {
  const selectedName = 'name';
  const selectedNamespace = 'namespace';
  const state = { byNamespace: {} };
  expect(
    selectors.getPipeline(state, selectedName, selectedNamespace)
  ).toBeNull();
});
