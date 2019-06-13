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

import * as creators from './reducerCreators';
import createReducer, * as selectors from './pipelineResources';
import { ALL_NAMESPACES } from '../constants';

const createPipelineResource = (name, namespace, uid, params) => {
  return {
    metadata: {
      name,
      namespace,
      uid
    },
    spec: {
      params
    }
  };
};

const name = 'pipeline name';
const namespace = 'default';
const uid = 'some-uid';
const pipelineResource = createPipelineResource(name, namespace, uid);

it('creates a namespaced reducer for the correct type', () => {
  const type = 'PipelineResource';
  jest.spyOn(creators, 'createNamespacedReducer');
  createReducer();
  expect(creators.createNamespacedReducer).toHaveBeenCalledWith({ type });
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
