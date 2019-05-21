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
  fetchServiceAccounts,
  fetchServiceAccountsSuccess
} from './serviceAccounts';

it('fetchServiceAccountsSuccess', () => {
  const data = { fake: 'data' };
  expect(fetchServiceAccountsSuccess(data)).toEqual({
    type: 'SERVICE_ACCOUNTS_FETCH_SUCCESS',
    data
  });
});

it('fetchServiceAccounts', async () => {
  const namespace = 'default';
  const serviceAccounts = { fake: 'serviceAccounts' };
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest
    .spyOn(API, 'getServiceAccounts')
    .mockImplementation(() => serviceAccounts);

  const expectedActions = [
    { type: 'SERVICE_ACCOUNTS_FETCH_REQUEST' },
    fetchServiceAccountsSuccess(serviceAccounts)
  ];

  await store.dispatch(fetchServiceAccounts());
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchServiceAccounts error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error();

  jest.spyOn(API, 'getServiceAccounts').mockImplementation(() => {
    throw error;
  });

  const expectedActions = [
    { type: 'SERVICE_ACCOUNTS_FETCH_REQUEST' },
    { type: 'SERVICE_ACCOUNTS_FETCH_FAILURE', error }
  ];

  await store.dispatch(fetchServiceAccounts());
  expect(store.getActions()).toEqual(expectedActions);
});
