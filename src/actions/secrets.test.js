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
        name: 'secret-name',
        namespace: 'default',
        annotations: undefined
      },
      resourceVersion: '####',
      password: '********',
      serviceAccount: 'default',
      username: 'someUser@email.com',
      type: 'userpass'
    }
  ]
};
const dataFormatted = [
  {
    name: 'secret-name',
    annotations: undefined,
    namespace: 'default',
    type: 'userpass'
  }
];
const postData = {
  name: 'secret-name',
  namespace: 'default',
  password: '********',
  serviceAccount: 'default',
  type: 'userpass',
  url: { 'tekton.dev/git-0': 'https://github.ibm.com' },
  username: 'someUser@email.com'
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
  const secrets = [{ name: 'secret-name', namespace: 'default' }];
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);

  jest.spyOn(API, 'deleteCredential').mockImplementation(() => {});

  const expectedActions = [
    { type: 'SECRET_DELETE_REQUEST' },
    { type: 'SECRET_DELETE_SUCCESS', secrets }
  ];

  await store.dispatch(deleteSecret(secrets));
  expect(store.getActions()).toEqual(expectedActions);
});

it('deleteSecret error', async () => {
  const secrets = [{ name: 'secret-name', namespace: 'default' }];
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(API, 'deleteCredential')
    .mockImplementation(() => Promise.reject());

  const expectedActions = [{ type: 'SECRET_DELETE_REQUEST' }];

  await store.dispatch(deleteSecret(secrets));
  expect(store.getActions()).toEqual(expectedActions);
});

it('createSecret', async () => {
  const secrets = data;
  const secretsFormatted = dataFormatted;
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest.spyOn(API, 'getCredentials').mockImplementation(() => secrets);

  jest.spyOn(API, 'createCredential').mockImplementation(() => response);

  const expectedActions = [
    { type: 'SECRET_CREATE_REQUEST' },
    { type: 'SECRETS_FETCH_REQUEST' },
    fetchSecretsSuccess(secretsFormatted)
  ];

  await store.dispatch(createSecret(postData, namespace));
  expect(store.getActions()).toEqual(expectedActions);
});

it('createSecret error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error(
    'Could not create secret "secret-name" in namespace default'
  );

  jest.spyOn(API, 'createCredential').mockImplementation(() => {
    throw error;
  });

  const expectedActions = [
    { type: 'SECRET_CREATE_REQUEST' },
    { type: 'SECRET_CREATE_FAILURE', error }
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
