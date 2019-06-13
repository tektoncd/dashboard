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
import createReducer, * as selectors from './taskRuns';
import { ALL_NAMESPACES } from '../constants';

it('creates a namespaced reducer for the correct type', () => {
  const type = 'TaskRun';
  jest.spyOn(creators, 'createNamespacedReducer');
  createReducer();
  expect(creators.createNamespacedReducer).toHaveBeenCalledWith({ type });
});

it('getTaskRuns', () => {
  const selectedNamespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getTaskRuns(state, selectedNamespace)).toEqual([]);
});

it('getTaskRuns all namespaces', () => {
  const selectedNamespace = ALL_NAMESPACES;
  const selectedTaskRun = { fake: 'taskRun' };
  const state = { byId: { id: selectedTaskRun } };
  expect(selectors.getTaskRuns(state, selectedNamespace)).toEqual([
    selectedTaskRun
  ]);
});

it('getTaskRun', () => {
  const selectedName = 'name';
  const selectedNamespace = 'namespace';
  const state = { byNamespace: {} };
  expect(
    selectors.getTaskRun(state, selectedName, selectedNamespace)
  ).toBeNull();
});
