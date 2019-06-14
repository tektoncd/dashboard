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
import { fetchExtensions, fetchExtensionsSuccess } from './extensions';

it('fetchExtensionsSuccess', () => {
  const data = { fake: 'data' };
  expect(fetchExtensionsSuccess(data)).toEqual({
    type: 'EXTENSIONS_FETCH_SUCCESS',
    data
  });
});

it('fetchExtensions', async () => {
  const bundlelocation = 'bundlelocation';
  const displayName = 'displayName';
  const name = 'name';
  const url = 'url';
  const extensions = [
    {
      displayName,
      name,
      source: API.getExtensionBundleURL(name, bundlelocation),
      url
    }
  ];
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest.spyOn(API, 'getExtensions').mockImplementation(() => extensions);

  const expectedActions = [
    { type: 'EXTENSIONS_FETCH_REQUEST' },
    fetchExtensionsSuccess(extensions)
  ];

  await store.dispatch(fetchExtensions());
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchExtensions error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error();

  jest.spyOn(API, 'getExtensions').mockImplementation(() => {
    throw error;
  });

  const expectedActions = [
    { type: 'EXTENSIONS_FETCH_REQUEST' },
    { type: 'EXTENSIONS_FETCH_FAILURE', error }
  ];

  await store.dispatch(fetchExtensions());
  expect(store.getActions()).toEqual(expectedActions);
});
