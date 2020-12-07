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

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as creators from './actionCreators';
import * as SecretsAPI from '../api/secrets';
import * as ServiceAccountsAPI from '../api/serviceAccounts';
import * as selectors from '../reducers';
import {
  clearNotification,
  createSecret,
  deleteSecret,
  fetchSecret,
  fetchSecrets,
  fetchSecretsSuccess,
  patchSecret,
  resetCreateSecret
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
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest.spyOn(SecretsAPI, 'getSecrets').mockImplementation(() => data);

  const expectedActions = [
    { type: 'SECRETS_FETCH_REQUEST' },
    fetchSecretsSuccess(data)
  ];

  await store.dispatch(fetchSecrets({ namespace }));
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchSecrets error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error('Could not fetch secrets');

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest.spyOn(SecretsAPI, 'getSecrets').mockImplementation(() => {
    throw error;
  });

  const expectedActions = [
    { type: 'SECRETS_FETCH_REQUEST' },
    { type: 'SECRETS_FETCH_FAILURE', error }
  ];

  await store.dispatch(fetchSecrets());
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchSecret', () => {
  const name = 'fake-secret-name';
  const secret = { fake: 'secret' };
  jest
    .spyOn(creators, 'fetchNamespacedResource')
    .mockImplementation(() => secret);

  fetchSecret({ name, namespace });
  expect(creators.fetchNamespacedResource).toHaveBeenCalledWith(
    'Secret',
    SecretsAPI.getSecret,
    { name, namespace }
  );
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
    .spyOn(ServiceAccountsAPI, 'getServiceAccounts')
    .mockImplementation(() => [defaultServiceAccount]);
  jest
    .spyOn(ServiceAccountsAPI, 'updateServiceAccountSecrets')
    .mockImplementation(() => {});
  jest.spyOn(SecretsAPI, 'deleteSecret').mockImplementation(() => {});

  const expectedActions = [
    { type: 'CLEAR_SECRET_ERROR_NOTIFICATION' },
    { type: 'SECRET_DELETE_REQUEST' },
    { type: 'SECRET_DELETE_SUCCESS' }
  ];

  const cancelMethod = jest.fn();
  await store.dispatch(deleteSecret(secrets, cancelMethod));
  expect(store.getActions()).toEqual(expectedActions);
  expect(cancelMethod).toHaveBeenCalled();
});

it('deleteSecret error', async () => {
  const secrets = [{ name: 'default-token-kbn7j', namespace: 'default' }];
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(ServiceAccountsAPI, 'getServiceAccounts')
    .mockImplementation(() => [defaultServiceAccount]);
  jest
    .spyOn(ServiceAccountsAPI, 'updateServiceAccountSecrets')
    .mockImplementation(() => {});
  jest
    .spyOn(SecretsAPI, 'deleteSecret')
    .mockImplementation(() => Promise.reject());

  const expectedActions = [
    { type: 'CLEAR_SECRET_ERROR_NOTIFICATION' },
    { type: 'SECRET_DELETE_REQUEST' },
    { type: 'SECRET_DELETE_FAILURE' }
  ];

  const cancelMethod = jest.fn();
  await store.dispatch(deleteSecret(secrets, cancelMethod));
  expect(store.getActions()).toEqual(expectedActions);
  expect(cancelMethod).not.toHaveBeenCalled();
});

it('createSecret', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);

  jest.spyOn(SecretsAPI, 'getSecrets').mockImplementation(() => data);
  jest.spyOn(SecretsAPI, 'createSecret').mockImplementation(() => response);

  const expectedActions = [
    { type: 'CLEAR_SECRET_ERROR_NOTIFICATION' },
    { type: 'SECRET_CREATE_REQUEST' },
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
      text: () =>
        Promise.resolve(
          'A secret already exists in namespace default with name default-token-kbn7j'
        )
    }
  };

  jest.spyOn(SecretsAPI, 'createSecret').mockImplementation(() => {
    throw error;
  });

  jest.spyOn(SecretsAPI, 'getAllSecrets').mockImplementation(() => data);

  const expectedActions = [
    { type: 'CLEAR_SECRET_ERROR_NOTIFICATION' },
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

it('patchSecret', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const serviceAccounts = [
    {
      name: 'default',
      namespace: 'default'
    },
    {
      name: 'tekton-dashboard',
      namespace: 'tekton-pipelines'
    }
  ];

  const secret = data.items[0].metadata.name;

  jest
    .spyOn(ServiceAccountsAPI, 'patchServiceAccount')
    .mockImplementation(() => Promise.resolve(response));

  const expectedActions = [
    { type: 'CLEAR_SECRET_ERROR_NOTIFICATION' },
    { type: 'SECRET_PATCH_REQUEST' },
    { type: 'SECRET_PATCH_SUCCESS' }
  ];

  await store
    .dispatch(patchSecret(serviceAccounts, secret, () => {}))
    .then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
});

it('patchSecret error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const errorResponseMock = {
    response: {
      status: 400,
      text: () =>
        Promise.resolve('Something went wrong when patching the secret.')
    }
  };

  jest
    .spyOn(ServiceAccountsAPI, 'patchServiceAccount')
    .mockImplementation(() => Promise.reject(errorResponseMock));

  const expectedActions = [
    { type: 'CLEAR_SECRET_ERROR_NOTIFICATION' },
    { type: 'SECRET_PATCH_REQUEST' },
    {
      type: 'SECRET_PATCH_FAILURE',
      error: 'Something went wrong when patching the secret.'
    }
  ];

  const serviceAccounts = [
    {
      name: 'default',
      namespace: 'default'
    },
    {
      name: 'tekton-dashboard',
      namespace: 'tekton-pipelines'
    }
  ];

  const secret = data.items[0].metadata.name;

  await store
    .dispatch(patchSecret(serviceAccounts, secret, () => {}))
    .then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
});

it('resetCreateSecret', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const expectedActions = [{ type: 'RESET_CREATE_SECRET' }];

  await store.dispatch(resetCreateSecret());
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
