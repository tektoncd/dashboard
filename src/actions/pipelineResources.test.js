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
  fetchPipelineResource,
  fetchPipelineResources,
  fetchPipelineResourcesSuccess
} from './pipelineResources';

it('fetchPipelineResourcesSuccess', () => {
  const data = { fake: 'data' };
  expect(fetchPipelineResourcesSuccess(data)).toEqual({
    type: 'PIPELINE_RESOURCES_FETCH_SUCCESS',
    data
  });
});

it('fetchPipelineResource', async () => {
  const pipelineResource = { fake: 'pipelineResource' };
  const namespace = 'default';
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest
    .spyOn(API, 'getPipelineResource')
    .mockImplementation(() => pipelineResource);

  const expectedActions = [
    { type: 'PIPELINE_RESOURCES_FETCH_REQUEST' },
    fetchPipelineResourcesSuccess([pipelineResource])
  ];

  await store.dispatch(fetchPipelineResource({ name: 'foo' }));
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchPipelineResource error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error();

  jest.spyOn(API, 'getPipelineResource').mockImplementation(() => {
    throw error;
  });

  const expectedActions = [
    { type: 'PIPELINE_RESOURCES_FETCH_REQUEST' },
    { type: 'PIPELINE_RESOURCES_FETCH_FAILURE', error }
  ];

  await store.dispatch(fetchPipelineResource({ name: 'foo' }));
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchPipelineResources', async () => {
  const pipelines = { fake: 'pipelines' };
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest.spyOn(API, 'getPipelineResources').mockImplementation(() => pipelines);

  const expectedActions = [
    { type: 'PIPELINE_RESOURCES_FETCH_REQUEST' },
    fetchPipelineResourcesSuccess(pipelines)
  ];

  await store.dispatch(fetchPipelineResources());
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchPipelineResources error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error();

  jest.spyOn(API, 'getPipelineResources').mockImplementation(() => {
    throw error;
  });

  const expectedActions = [
    { type: 'PIPELINE_RESOURCES_FETCH_REQUEST' },
    { type: 'PIPELINE_RESOURCES_FETCH_FAILURE', error }
  ];

  await store.dispatch(fetchPipelineResources());
  expect(store.getActions()).toEqual(expectedActions);
});
