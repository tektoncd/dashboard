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
import createReducer, * as selectors from './pipelineRuns';
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

it('creates a namespaced reducer for the correct type', () => {
  const type = 'PipelineRun';
  jest.spyOn(creators, 'createNamespacedReducer');
  createReducer();
  expect(creators.createNamespacedReducer).toHaveBeenCalledWith({ type });
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
