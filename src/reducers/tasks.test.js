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
import createReducer, * as selectors from './tasks';
import { ALL_NAMESPACES } from '../constants';

it('creates a namespaced reducer for the correct type', () => {
  const type = 'Task';
  jest.spyOn(creators, 'createNamespacedReducer');
  createReducer();
  expect(creators.createNamespacedReducer).toHaveBeenCalledWith({ type });
});

it('getTasks', () => {
  const selectedNamespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getTasks(state, selectedNamespace)).toEqual([]);
});

it('getTasks all namespaces', () => {
  const selectedNamespace = ALL_NAMESPACES;
  const selectedTask = { fake: 'task' };
  const state = { byId: { id: selectedTask } };
  expect(selectors.getTasks(state, selectedNamespace)).toEqual([selectedTask]);
});

it('getTask', () => {
  const selectedName = 'name';
  const selectedNamespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getTask(state, selectedName, selectedNamespace)).toBeNull();
});
