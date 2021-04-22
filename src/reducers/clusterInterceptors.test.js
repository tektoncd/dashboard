/*
Copyright 2021 The Tekton Authors
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

import * as reducerCreators from './reducerCreators';
import * as selectorCreators from './selectorCreators';
import createReducer, * as selectors from './clusterInterceptors';

const name = 'cluster interceptor name';
const state = { fake: 'state' };

it('creates a namespaced reducer for the correct type', () => {
  const type = 'ClusterInterceptor';
  jest.spyOn(reducerCreators, 'createNamespacedReducer');
  createReducer();
  expect(reducerCreators.createNamespacedReducer).toHaveBeenCalledWith({
    type
  });
});

it('getClusterInterceptors', () => {
  const collection = { fake: 'collection' };
  jest
    .spyOn(selectorCreators, 'getCollection')
    .mockImplementation(() => collection);
  expect(selectors.getClusterInterceptors(state)).toEqual(collection);
});

it('getClusterInterceptor', () => {
  const resource = { fake: 'resource' };
  jest
    .spyOn(selectorCreators, 'getResource')
    .mockImplementation(() => resource);
  expect(selectors.getClusterInterceptor(state, name)).toEqual(resource);
});

it('getClusterInterceptorsErrorMessage', () => {
  const errorMessage = 'errorMessage';
  expect(
    selectors.getClusterInterceptorsErrorMessage({ errorMessage })
  ).toEqual(errorMessage);
});

it('isFetchingClusterInterceptors', () => {
  const isFetching = 'isFetching';
  expect(selectors.isFetchingClusterInterceptors({ isFetching })).toEqual(
    isFetching
  );
});
