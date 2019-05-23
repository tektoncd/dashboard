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
  fetchSecrets,
  fetchSecretsSuccess,
  deleteSecret,
  createSecret,
  clearNotification
} from './secrets';

const data = [
  {
    name: 'secret-name',
    password: '********',
    resourceVersion: '####',
    serviceAccount: 'default',
    type: 'userpass',
    url: { 'tekton.dev/git-0': 'https://github.ibm.com' },
    username: 'someUser@email.com'
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
    data,
    namespace
  });
});

it('fetchSecrets', async () => {
  const secrets = data;
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest.spyOn(API, 'getCredentials').mockImplementation(() => secrets);

  const expectedActions = [
    { type: 'SECRETS_FETCH_REQUEST' },
    fetchSecretsSuccess(secrets, namespace)
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
  const namespace = 'default';
  const secret = 'secret';
  const secrets = { fake: 'secrets' };
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest.spyOn(API, 'getCredentials').mockImplementation(() => secrets);

  jest
    .spyOn(API, 'deleteCredential')
    .mockImplementation((secret, namespace) => {});

  const expectedActions = [
    { type: 'SECRET_DELETE_REQUEST' },
    { type: 'SECRET_DELETE_SUCCESS', id: secret },
    { type: 'SECRETS_FETCH_REQUEST' },
    fetchSecretsSuccess(secrets, namespace)
  ];

  await store.dispatch(deleteSecret(secret, namespace));
  expect(store.getActions()).toEqual(expectedActions);
});

it('deleteSecret error', async () => {
  const secret = 'secret';
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error('Could not delete secret secret');

  jest
    .spyOn(API, 'deleteCredential')
    .mockImplementation((secret, namespace) => {
      throw error;
    });

  const expectedActions = [
    { type: 'SECRET_DELETE_REQUEST' },
    { type: 'SECRET_DELETE_FAILURE', error }
  ];

  await store.dispatch(deleteSecret(secret, namespace));
  expect(store.getActions()).toEqual(expectedActions);
});

it('createSecret', async () => {
  const secrets = data;
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest.spyOn(API, 'getCredentials').mockImplementation(() => secrets);

  jest
    .spyOn(API, 'createCredential')
    .mockImplementation((postData, namespace) => response);

  const expectedActions = [
    { type: 'SECRET_CREATE_REQUEST' },
    { type: 'SECRETS_FETCH_REQUEST' },
    fetchSecretsSuccess(secrets, namespace)
  ];

  await store.dispatch(createSecret(postData, namespace));
  expect(store.getActions()).toEqual(expectedActions);
});

it('createSecret error', async () => {
  const namespace = 'default';
  const postData = { name: 'secrets' };
  const secrets = { fake: 'secrets' };
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error(
    'Could not create secret secrets in namespace default'
  );

  jest
    .spyOn(API, 'createCredential')
    .mockImplementation((postData, namespace) => {
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
  const namespace = 'default';
  const secrets = { fake: 'secrets' };
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const expectedActions = [{ type: 'CLEAR_NOTIFICATION' }];

  await store.dispatch(clearNotification());
  expect(store.getActions()).toEqual(expectedActions);
});
