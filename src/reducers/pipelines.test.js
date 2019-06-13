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
import createReducer, * as selectors from './pipelines';
import { ALL_NAMESPACES } from '../constants';

it('creates a namespaced reducer for the correct type', () => {
  const type = 'Pipeline';
  jest.spyOn(creators, 'createNamespacedReducer');
  createReducer();
  expect(creators.createNamespacedReducer).toHaveBeenCalledWith({ type });
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
