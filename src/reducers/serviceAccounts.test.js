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

import * as reducerCreators from './reducerCreators';
import * as selectorCreators from './selectorCreators';
import createReducer, * as selectors from './serviceAccounts';

it('creates a namespaced reducer for the correct type', () => {
  const type = 'ServiceAccount';
  jest.spyOn(reducerCreators, 'createNamespacedReducer');
  createReducer();
  expect(reducerCreators.createNamespacedReducer).toHaveBeenCalledWith({
    type
  });
});

it('getServiceAccount', () => {
  const name = 'service-account1';
  const namespace = 'default';
  const state = { fake: 'state' };
  jest.spyOn(selectorCreators, 'getResource').mockImplementation(() => name);
  expect(selectors.getServiceAccount(state, name, namespace)).toEqual(name);
});

it('getServiceAccounts', () => {
  const collection = { fake: 'collection' };
  const namespace = 'default';
  const state = { fake: 'state' };
  jest
    .spyOn(selectorCreators, 'getCollection')
    .mockImplementation(() => collection);
  expect(selectors.getServiceAccounts(state, namespace)).toEqual(collection);
});

it('getServiceAccountsErrorMessage', () => {
  const errorMessage = 'errorMessage';
  expect(selectors.getServiceAccountsErrorMessage({ errorMessage })).toEqual(
    errorMessage
  );
});

it('isFetchingServiceAccounts', () => {
  const isFetching = 'isFetching';
  expect(selectors.isFetchingServiceAccounts({ isFetching })).toEqual(
    isFetching
  );
});
