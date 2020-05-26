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

import {
  fetchCollection,
  fetchNamespacedResource,
  fetchResource,
  fetchSuccess
} from './actionCreators';

it('fetchSuccess', () => {
  const data = { fake: 'data' };
  expect(fetchSuccess('Extension', data)).toEqual({
    type: 'EXTENSIONS_FETCH_SUCCESS',
    data
  });
});

describe('fetchCollection', () => {
  it('success', async () => {
    const data = { fake: 'data' };
    const fakeAPI = jest.fn().mockImplementation(() => data);
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore();

    const expectedActions = [
      { type: 'EXTENSIONS_FETCH_REQUEST' },
      { type: 'EXTENSIONS_FETCH_SUCCESS', data }
    ];

    await store.dispatch(fetchCollection('Extension', fakeAPI));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('error', async () => {
    const error = new Error();
    const fakeAPI = jest.fn().mockImplementation(() => {
      throw error;
    });

    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore();

    const expectedActions = [
      { type: 'EXTENSIONS_FETCH_REQUEST' },
      { type: 'EXTENSIONS_FETCH_FAILURE', error }
    ];

    await store.dispatch(fetchCollection('Extension', fakeAPI));
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('fetchNamespacedResource', () => {
  it('success', async () => {
    const data = { fake: 'data' };
    const namespace = 'default';
    const params = { name: 'name' };
    const fakeAPI = jest.fn().mockImplementation(() => data);
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({ namespaces: { selected: namespace } });

    const expectedActions = [
      { type: 'EXTENSIONS_FETCH_REQUEST' },
      { type: 'EXTENSIONS_FETCH_SUCCESS', data: [data] }
    ];

    await store.dispatch(fetchNamespacedResource('Extension', fakeAPI, params));
    expect(store.getActions()).toEqual(expectedActions);
    expect(fakeAPI).toHaveBeenCalledWith({ ...params, namespace });
  });

  it('error', async () => {
    const namespace = 'default';
    const params = { name: 'name' };
    const error = new Error();
    const fakeAPI = jest.fn().mockImplementation(() => {
      throw error;
    });

    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({ namespaces: { selected: namespace } });

    const expectedActions = [
      { type: 'EXTENSIONS_FETCH_REQUEST' },
      { type: 'EXTENSIONS_FETCH_FAILURE', error }
    ];

    await store.dispatch(fetchNamespacedResource('Extension', fakeAPI, params));
    expect(store.getActions()).toEqual(expectedActions);
    expect(fakeAPI).toHaveBeenCalledWith({ ...params, namespace });
  });
});

describe('fetchResource', () => {
  it('success', async () => {
    const data = { fake: 'data' };
    const params = { name: 'name' };
    const fakeAPI = jest.fn().mockImplementation(() => data);
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({});

    const expectedActions = [
      { type: 'EXTENSIONS_FETCH_REQUEST' },
      { type: 'EXTENSIONS_FETCH_SUCCESS', data: [data] }
    ];

    await store.dispatch(fetchResource('Extension', fakeAPI, params));
    expect(store.getActions()).toEqual(expectedActions);
    expect(fakeAPI).toHaveBeenCalledWith({ ...params });
  });

  it('error', async () => {
    const params = { name: 'name' };
    const error = new Error();
    const fakeAPI = jest.fn().mockImplementation(() => {
      throw error;
    });

    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore();

    const expectedActions = [
      { type: 'EXTENSIONS_FETCH_REQUEST' },
      { type: 'EXTENSIONS_FETCH_FAILURE', error }
    ];

    await store.dispatch(fetchResource('Extension', fakeAPI, params));
    expect(store.getActions()).toEqual(expectedActions);
    expect(fakeAPI).toHaveBeenCalledWith({ ...params });
  });
});
