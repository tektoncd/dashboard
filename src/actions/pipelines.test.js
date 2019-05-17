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
  fetchPipeline,
  fetchPipelines,
  fetchPipelinesSuccess
} from './pipelines';

it('fetchPipelinesSuccess', () => {
  const data = { fake: 'data' };
  expect(fetchPipelinesSuccess(data)).toEqual({
    type: 'PIPELINES_FETCH_SUCCESS',
    data
  });
});

it('fetchPipeline', async () => {
  const pipeline = { fake: 'pipeline' };
  const namespace = 'default';
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest.spyOn(API, 'getPipeline').mockImplementation(() => pipeline);

  const expectedActions = [
    { type: 'PIPELINES_FETCH_REQUEST' },
    fetchPipelinesSuccess([pipeline])
  ];

  await store.dispatch(fetchPipeline({ name: 'foo' }));
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchPipeline error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error();

  jest.spyOn(API, 'getPipeline').mockImplementation(() => {
    throw error;
  });

  const expectedActions = [
    { type: 'PIPELINES_FETCH_REQUEST' },
    { type: 'PIPELINES_FETCH_FAILURE', error }
  ];

  await store.dispatch(fetchPipeline({ name: 'foo' }));
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchPipelines', async () => {
  const pipelines = { fake: 'pipelines' };
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest.spyOn(API, 'getPipelines').mockImplementation(() => pipelines);

  const expectedActions = [
    { type: 'PIPELINES_FETCH_REQUEST' },
    fetchPipelinesSuccess(pipelines)
  ];

  await store.dispatch(fetchPipelines());
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchPipelines error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error();

  jest.spyOn(API, 'getPipelines').mockImplementation(() => {
    throw error;
  });

  const expectedActions = [
    { type: 'PIPELINES_FETCH_REQUEST' },
    { type: 'PIPELINES_FETCH_FAILURE', error }
  ];

  await store.dispatch(fetchPipelines());
  expect(store.getActions()).toEqual(expectedActions);
});
