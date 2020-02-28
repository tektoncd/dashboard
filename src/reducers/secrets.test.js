/*
Copyright 2019-2020 The Tekton Authors
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
    byNamespace: {},
    errorMessage: null,
    deleteErrorMessage: null,
    createSuccessMessage: false,
    deleteSuccessMessage: false,
    isFetching: false,
    patchErrorMessage: null,
    patchSuccessMessage: false
  });
});

it('SECRETS_FETCH_REQUEST', () => {
  const action = { type: 'SECRETS_FETCH_REQUEST' };
  const state = secretsReducer({}, action);
  expect(selectors.isFetchingSecrets(state)).toBe(true);
});

it('SECRETS_FETCH_SUCCESS', () => {
  const name = 'secret-name';
  const namespace = '*';
  const uid = '0';
  const annotations = { 'tekton.dev/git-0': 'https://github.ibm.com' };
  const secret = {
    metadata: {
      name,
      uid,
      annotations,
      namespace
    }
  };
  const action = {
    type: 'SECRETS_FETCH_SUCCESS',
    data: [secret]
  };

  const state = secretsReducer({}, action);
  expect(selectors.getSecrets(state, namespace)).toEqual([secret]);
  expect(selectors.isFetchingSecrets(state)).toBe(false);
});

it('SECRETS_FETCH_FAILURE', () => {
  const error = 'The server reported a conflict';
  const action = {
    type: 'SECRETS_FETCH_FAILURE',
    error
  };

  const state = secretsReducer({}, action);
  expect(selectors.getSecretsErrorMessage(state)).toEqual(
    'The server reported a conflict'
  );
});

it('SECRET_PATCH_SUCCESS', () => {
  const action = {
    type: 'SECRET_PATCH_SUCCESS'
  };

  const state = secretsReducer({}, action);
  expect(selectors.getPatchSecretsSuccessMessage(state)).toEqual(true);
});

it('SECRET_PATCH_FAILURE', () => {
  const error = 'The server reported a conflict';
  const action = {
    type: 'SECRET_PATCH_FAILURE',
    error
  };

  const state = secretsReducer({}, action);
  expect(selectors.getPatchSecretsErrorMessage(state)).toEqual(
    'The server reported a conflict'
  );
});

it('SECRET_DELETE_SUCCESS for one secret', () => {
  const secrets = [{ name: 'secret-name', namespace: 'default' }];
  const secretsState = {
    byNamespace: {
      default: {
        0: {
          uid: '0',
          name: 'github-repo-access-secret',
          namespace: 'default',
          annotations: {}
        }
      }
    }
  };

  const action = {
    type: 'SECRET_DELETE_SUCCESS',
    success: 'Secret(s) deleted successfully',
    secrets
  };
  const state = secretsReducer(secretsState, action);

  expect(selectors.isFetchingSecrets(state)).toBe(false);
});

it('SECRET_DELETE_SUCCESS for multiple secrets', () => {
  const secrets = [
    { name: 'secret-name', namespace: 'default' },
    { name: 'other-secret', namespace: 'default' },
    { name: 'another-one', namespace: 'default' }
  ];
  const secretsState = {
    byNamespace: {
      default: {
        0: {
          uid: '0',
          name: 'github-repo-access-secret',
          namespace: 'default',
          annotations: {}
        }
      }
    }
  };

  const action = {
    type: 'SECRET_DELETE_SUCCESS',
    success: 'Secret(s) deleted successfully',
    secrets
  };
  const state = secretsReducer(secretsState, action);

  expect(selectors.isFetchingSecrets(state)).toBe(false);
});

it('SecretCreated', () => {
  const secret = {
    metadata: {
      creationTimestamp: 'some timestamp',
      name: 'github-repo-access-secret',
      namespace: 'default',
      annotations: {}
    },
    type: 'kubernetes.io/basic-auth'
  };

  const action = { type: 'SecretCreated', payload: secret };
  const state = secretsReducer({}, action);

  expect(selectors.getSecrets(state, 'default')[0]).toStrictEqual(secret);
});

it('SecretCreated with unsupported type', () => {
  const secret = {
    metadata: {
      name: 'github-repo-access-secret',
      namespace: 'default',
      annotations: {}
    },
    type: 'Opaque'
  };

  const action = { type: 'SecretCreated', payload: secret };
  const state = secretsReducer({}, action);

  expect(selectors.getSecrets(state, 'default')).toEqual([]);
});

it('SecretDeleted', () => {
  const secret = {
    metadata: {
      name: 'github-repo-access-secret',
      namespace: 'default',
      annotations: {}
    }
  };
  const secretsState = {
    byNamespace: {
      default: {
        'github-repo-access-secret': {
          uid: '0',
          name: 'github-repo-access-secret',
          namespace: 'default',
          annotations: {}
        }
      }
    }
  };

  const action = { type: 'SecretDeleted', payload: secret };
  const state = secretsReducer(secretsState, action);

  expect(selectors.getSecrets(state, 'default')).toStrictEqual([]);
});

it('getSecrets', () => {
  const namespace = 'namespace';
  const state = { byNamespace: {} };
  expect(selectors.getSecrets(state, namespace)).toEqual([]);
});
