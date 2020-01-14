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

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as API from '../api';
import * as selectors from '../reducers';
import {
  clearNotification,
  createSecret,
  deleteSecret,
  fetchSecrets,
  fetchSecretsSuccess
} from './secrets';

const data = {
  items: [
    {
      metadata: {
        name: 'default-token-kbn7j',
        namespace: 'default',
        annotations: undefined,
        labels: {
          serviceAccount: 'default'
        }
      },
      data: {
        username: 'someUser@email.com',
        password: '********'
      },
      resourceVersion: '####',
      type: 'userpass'
    },
    {
      metadata: {
        name: 'another-token-kbn7j',
        namespace: 'default',
        annotations: undefined,
        labels: {
          serviceAccount: 'default'
        }
      },
      data: {
        username: 'someUser@email.com',
        password: '********'
      },
      resourceVersion: '####',
      type: 'userpass'
    }
  ]
};

const dataFormatted = [
  {
    name: 'default-token-kbn7j',
    annotations: undefined,
    namespace: 'default',
    type: 'userpass',
    username: 'someUser@email.com'
  },
  {
    name: 'another-token-kbn7j',
    annotations: undefined,
    namespace: 'default',
    type: 'userpass',
    username: 'someUser@email.com'
  }
];
const postData = {
  metadata: {
    name: 'default-token-kbn7j',
    namespace: 'default',
    annotations: { 'tekton.dev/git-0': 'https://github.ibm.com' },
    labels: {
      serviceAccount: 'default'
    }
  },
  data: {
    username: 'someUser@email.com',
    password: '********'
  },
  type: 'userpass'
};

const defaultServiceAccount = {
  apiVersion: 'v1',
  kind: 'ServiceAccount',
  metadata: {
    creationTimestamp: '2019-08-28T12:46:08Z',
    name: 'default',
    namespace: 'default',
    resourceVersion: '331',
    selfLink: '/api/v1/namespaces/default/serviceaccounts/default',
    uid: 'ced1c79d-c991-11e9-a380-025000000001'
  },
  secrets: [
    {
      name: 'default-token-kbn7j'
    },
    {
      name: 'another-token-kbn7j'
    }
  ]
};

const response = { ok: true, status: 204 };
const namespace = 'default';

it('fetchSecretsSuccess', () => {
  expect(fetchSecretsSuccess(data, namespace)).toEqual({
    type: 'SECRETS_FETCH_SUCCESS',
    data
  });
});

it('fetchSecrets', async () => {
  const secrets = data;
  const secretsFormatted = dataFormatted;
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest.spyOn(API, 'getCredentials').mockImplementation(() => secrets);

  const expectedActions = [
    { type: 'SECRETS_FETCH_REQUEST' },
    fetchSecretsSuccess(secretsFormatted)
  ];

  await store.dispatch(fetchSecrets({ namespace }));
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchSecrets error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error('Could not fetch secrets');

  jest.spyOn(API, 'getCredentials').mockImplementation(() => {
    throw error;
  });

  const expectedActions = [
    { type: 'SECRETS_FETCH_REQUEST' },
    { type: 'SECRETS_FETCH_FAILURE', error }
  ];

  await store.dispatch(fetchSecrets());
  expect(store.getActions()).toEqual(expectedActions);
});

it('deleteSecret', async () => {
  const secrets = [
    { name: 'default-token-kbn7j', namespace: 'default' },
    { name: 'another-token-kbn7j', namespace: 'default' }
  ];
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);

  jest
    .spyOn(API, 'getServiceAccounts')
    .mockImplementation(() => [defaultServiceAccount]);
  jest.spyOn(API, 'updateServiceAccountSecrets').mockImplementation(() => {});
  jest.spyOn(API, 'deleteCredential').mockImplementation(() => {});

  const expectedActions = [
    { type: 'SECRET_DELETE_REQUEST' },
    { type: 'SECRET_DELETE_SUCCESS' }
  ];

  await store.dispatch(deleteSecret(secrets));
  expect(store.getActions()).toEqual(expectedActions);
});

it('deleteSecret error', async () => {
  const secrets = [{ name: 'default-token-kbn7j', namespace: 'default' }];
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(API, 'getServiceAccounts')
    .mockImplementation(() => [defaultServiceAccount]);
  jest.spyOn(API, 'updateServiceAccountSecrets').mockImplementation(() => {});
  jest
    .spyOn(API, 'deleteCredential')
    .mockImplementation(() => Promise.reject());

  const expectedActions = [{ type: 'SECRET_DELETE_REQUEST' }];

  await store.dispatch(deleteSecret(secrets));
  expect(store.getActions()).toEqual(expectedActions);
});

it('createSecret', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);

  jest.spyOn(API, 'getCredentials').mockImplementation(() => data);
  jest.spyOn(API, 'createCredential').mockImplementation(() => response);
  jest
    .spyOn(API, 'getServiceAccount')
    .mockImplementation(() => defaultServiceAccount);
  jest.spyOn(API, 'patchServiceAccount').mockImplementation(() => response);

  const expectedActions = [
    { type: 'SECRET_CREATE_REQUEST' },
    { type: 'CLEAR_SECRET_ERROR_NOTIFICATION' },
    { type: 'SECRET_CREATE_SUCCESS' }
  ];

  await store.dispatch(createSecret(postData, namespace));
  expect(store.getActions()).toEqual(expectedActions);
});

it('createSecret error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = {
    response: {
      text: () => {
        return Promise.resolve(
          'A secret already exists in namespace default with name default-token-kbn7j'
        );
      }
    }
  };

  jest.spyOn(API, 'createCredential').mockImplementation(() => {
    throw error;
  });

  jest.spyOn(API, 'getAllCredentials').mockImplementation(() => data);

  const expectedActions = [
    { type: 'SECRET_CREATE_REQUEST' },
    {
      type: 'SECRET_CREATE_FAILURE',
      error:
        'A secret already exists in namespace default with name default-token-kbn7j'
    }
  ];

  await store.dispatch(createSecret(postData, namespace));
  expect(store.getActions()).toEqual(expectedActions);
});

it('clearNotification', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const expectedActions = [{ type: 'CLEAR_SECRET_ERROR_NOTIFICATION' }];

  await store.dispatch(clearNotification());
  expect(store.getActions()).toEqual(expectedActions);
});
