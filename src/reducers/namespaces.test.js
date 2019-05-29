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

import namespacesReducer, * as selectors from './namespaces';
import { ALL_NAMESPACES } from '../constants';

it('handles init or unknown actions', () => {
  expect(namespacesReducer(undefined, { type: 'does_not_exist' })).toEqual({
    byName: {
      default: {}
    },
    errorMessage: null,
    isFetching: false,
    selected: ALL_NAMESPACES
  });
});

it('NAMESPACES_FETCH_REQUEST', () => {
  const action = { type: 'NAMESPACES_FETCH_REQUEST' };
  const state = namespacesReducer({}, action);
  expect(selectors.isFetchingNamespaces(state)).toBe(true);
});

it('NAMESPACES_FETCH_SUCCESS', () => {
  const name = 'default';
  const uid = 'some-uid';
  const namespace = {
    metadata: {
      name,
      uid
    },
    other: 'content'
  };
  const action = {
    type: 'NAMESPACES_FETCH_SUCCESS',
    data: [namespace]
  };

  const state = namespacesReducer({}, action);
  expect(selectors.getNamespaces(state)).toEqual([name]);
  expect(selectors.isFetchingNamespaces(state)).toBe(false);
});

it('NAMESPACES_FETCH_FAILURE', () => {
  const message = 'fake error message';
  const error = { message };
  const action = {
    type: 'NAMESPACES_FETCH_FAILURE',
    error
  };

  const state = namespacesReducer({}, action);
  expect(selectors.getNamespacesErrorMessage(state)).toEqual(message);
});

it('NAMESPACE_SELECT', () => {
  const namespace = 'some-namespace';
  const action = {
    type: 'NAMESPACE_SELECT',
    namespace
  };

  const state = namespacesReducer({}, action);
  expect(selectors.getSelectedNamespace(state)).toEqual(namespace);
});
