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

import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import { createNamespacedReducer } from './reducerCreators';
import * as selectors from './pipelineResources';

const createResource = (name, namespace, uid, other) => {
  return {
    metadata: {
      name,
      namespace,
      uid
    },
    ...other
  };
};

const resourceType = 'PipelineResource';
const reducer = createNamespacedReducer({ type: resourceType });

const name = 'pipeline name';
const namespace = 'default';
const uid = 'some-uid';
const pipelineResource = createResource(name, namespace, uid);

it('handles init or unknown actions', () => {
  expect(reducer(undefined, { type: 'does_not_exist' })).toEqual({
    byId: {},
    byNamespace: {},
    errorMessage: null,
    isFetching: false
  });
});

it('PIPELINE_RESOURCES_FETCH_REQUEST', () => {
  const action = { type: 'PIPELINE_RESOURCES_FETCH_REQUEST' };
  const state = reducer({}, action);
  expect(selectors.isFetchingPipelineResources(state)).toBe(true);
});

it('PIPELINE_RESOURCES_FETCH_SUCCESS', () => {
  const action = {
    type: 'PIPELINE_RESOURCES_FETCH_SUCCESS',
    data: [pipelineResource],
    namespace
  };

  const state = reducer({}, action);
  expect(selectors.getPipelineResources(state, namespace)).toEqual([
    pipelineResource
  ]);
  expect(selectors.getPipelineResource(state, name, namespace)).toEqual(
    pipelineResource
  );
  expect(selectors.isFetchingPipelineResources(state)).toBe(false);
});

it('PIPELINE_RESOURCES_FETCH_FAILURE', () => {
  const message = 'fake error message';
  const error = { message };
  const action = {
    type: 'PIPELINE_RESOURCES_FETCH_FAILURE',
    error
  };

  const state = reducer({}, action);
  expect(selectors.getPipelineResourcesErrorMessage(state)).toEqual(message);
});

it('PipelineResource Events', () => {
  const createdPipelineResource = createResource(name, namespace, uid, {
    status: { running: true }
  });
  const action = {
    type: 'PipelineResourceCreated',
    payload: createdPipelineResource,
    namespace
  };

  const state = reducer({}, action);
  expect(selectors.getPipelineResources(state, namespace)).toEqual([
    createdPipelineResource
  ]);
  expect(selectors.getPipelineResource(state, name, namespace)).toEqual(
    createdPipelineResource
  );
  expect(selectors.isFetchingPipelineResources(state)).toBe(false);

  // update pipeline resource
  const updatedPipelineResource = createResource(name, namespace, uid, {
    status: { terminated: true }
  });
  const updateAction = {
    type: 'PipelineResourceUpdated',
    payload: updatedPipelineResource,
    namespace
  };
  const updatedState = reducer(state, updateAction);
  expect(selectors.getPipelineResources(updatedState, namespace)).toEqual([
    updatedPipelineResource
  ]);
  expect(selectors.getPipelineResource(updatedState, name, namespace)).toEqual(
    updatedPipelineResource
  );

  // delete pipeline resource
  const deleteAction = {
    type: 'PipelineResourceDeleted',
    payload: pipelineResource,
    namespace
  };

  const deletedPipelineResourceState = reducer(updatedState, deleteAction);
  expect(
    selectors.getPipelineResources(deletedPipelineResourceState, namespace)
  ).toEqual([]);
  expect(
    selectors.getPipelineResource(deletedPipelineResourceState, name, namespace)
  ).toBeNull();
});

it('getPipelineResources', () => {
  const selectedNamespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getPipelineResources(state, selectedNamespace)).toEqual([]);
});

it('getPipelineResources all namespaces', () => {
  const selectedNamespace = ALL_NAMESPACES;
  const state = { byId: { id: pipelineResource } };
  expect(selectors.getPipelineResources(state, selectedNamespace)).toEqual([
    pipelineResource
  ]);
});

it('getPipelineResource', () => {
  const selectedNamespace = 'namespace';
  const state = { byNamespace: {} };
  expect(
    selectors.getPipelineResource(state, name, selectedNamespace)
  ).toBeNull();
});
