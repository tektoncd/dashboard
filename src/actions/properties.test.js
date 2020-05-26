/*
Copyright 2020 The Tekton Authors
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
import { fetchInstallProperties } from './properties';

it('fetchInstallProperties', async () => {
  const data = { fake: 'data' };
  jest.spyOn(API, 'getInstallProperties').mockImplementation(() => data);
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({});

  const expectedActions = [{ type: 'INSTALL_PROPERTIES_SUCCESS', data }];

  await store.dispatch(fetchInstallProperties());
  expect(API.getInstallProperties).toHaveBeenCalled();
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchInstallProperties error', async () => {
  const error = new Error();
  jest.spyOn(API, 'getInstallProperties').mockImplementation(() => {
    throw error;
  });
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({});

  const expectedActions = [{ type: 'INSTALL_PROPERTIES_FAILURE', error }];

  await store.dispatch(fetchInstallProperties());
  expect(API.getInstallProperties).toHaveBeenCalled();
  expect(store.getActions()).toEqual(expectedActions);
});
