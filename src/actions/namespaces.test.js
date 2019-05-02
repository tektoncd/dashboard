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
  fetchNamespaces,
  fetchNamespacesSuccess,
  selectNamespace
} from './namespaces';

it('selectNamespace', () => {
  const namespace = 'namespace';
  expect(selectNamespace(namespace)).toMatchObject({
    namespace
  });
});

it('fetchNamespacesSuccess', () => {
  const data = { fake: 'data' };
  expect(fetchNamespacesSuccess(data)).toEqual({
    type: 'NAMESPACES_FETCH_SUCCESS',
    data
  });
});

it('fetchNamespaces', async () => {
  const namespace = 'default';
  const pipelines = { fake: 'pipelines' };
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest.spyOn(API, 'getNamespaces').mockImplementation(() => pipelines);

  const expectedActions = [
    { type: 'NAMESPACES_FETCH_REQUEST' },
    fetchNamespacesSuccess(pipelines, namespace)
  ];

  await store.dispatch(fetchNamespaces());
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchNamespaces error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error();

  jest.spyOn(API, 'getNamespaces').mockImplementation(() => {
    throw error;
  });

  const expectedActions = [
    { type: 'NAMESPACES_FETCH_REQUEST' },
    { type: 'NAMESPACES_FETCH_FAILURE', error }
  ];

  await store.dispatch(fetchNamespaces());
  expect(store.getActions()).toEqual(expectedActions);
});
