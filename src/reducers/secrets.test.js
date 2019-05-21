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

import secretsReducer, * as selectors from './secrets';

it('handles init or unknown actions', () => {
  expect(secretsReducer(undefined, { type: 'does_not_exist' })).toEqual({
    byId: {},
    byNamespace: {},
    errorMessage: null,
    isFetching: false
  });
});

it('SECRETS_FETCH_REQUEST', () => {
  const action = { type: 'SECRETS_FETCH_REQUEST' };
  const state = secretsReducer({}, action);
  expect(selectors.isFetchingSecrets(state)).toBe(true);
});

it('SECRETS_FETCH_SUCCESS', () => {
  const name = 'secret name';
  const namespace = 'default';
  const uid = '0';
  const type = "some"
  const annotations = undefined
  const secret = {
      name,
      uid,
      type,
      annotations
  };
  const action = {
    type: 'SECRETS_FETCH_SUCCESS',
    data: [secret],
    namespace
  };

  const state = secretsReducer({}, action);
  expect(selectors.getSecrets(state, namespace)).toEqual([secret]);
  expect(selectors.isFetchingSecrets(state)).toBe(false);
});

it('SECRETS_FETCH_FAILURE', () => {
  const message = 'fake error message';
  const error = { message };
  const action = {
    type: 'SECRETS_FETCH_FAILURE',
    error
  };

  const state = secretsReducer({}, action);
  expect(selectors.getSecretsErrorMessage(state)).toEqual(message);
});

it('SECRET_DELETE_SUCCESS', () => {
  const id = 'name'
  const namespace = 'default';
  const action = { type: 'SECRET_DELETE_SUCCESS', id };
  const state = secretsReducer({}, action);

  expect(selectors.getSecrets(state, namespace)).toEqual(undefined);
  expect(selectors.isFetchingSecrets(state)).toBe(false);
});

it('getSecrets', () => {
  const namespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getSecrets(state, namespace)).toEqual(undefined);
});
