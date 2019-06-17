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
import * as creators from './actionCreators';
import {
  fetchPipelineRun,
  fetchPipelineRuns,
  fetchPipelineRunsSuccess
} from './pipelineRuns';

it('fetchPipelineRunsSuccess', () => {
  const data = { fake: 'data' };
  expect(fetchPipelineRunsSuccess(data)).toEqual({
    type: 'PIPELINE_RUNS_FETCH_SUCCESS',
    data
  });
});

it('fetchPipelineRun', async () => {
  const pipelineRun = { fake: 'pipelineRun' };
  const namespace = 'default';
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  jest
    .spyOn(selectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  jest.spyOn(API, 'getPipelineRun').mockImplementation(() => pipelineRun);

  const expectedActions = [
    { type: 'PIPELINE_RUNS_FETCH_REQUEST' },
    fetchPipelineRunsSuccess([pipelineRun])
  ];

  await store.dispatch(fetchPipelineRun({ name: 'foo' }));
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchPipelineRun error', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore();

  const error = new Error();

  jest.spyOn(API, 'getPipelineRun').mockImplementation(() => {
    throw error;
  });

  const expectedActions = [
    { type: 'PIPELINE_RUNS_FETCH_REQUEST' },
    { type: 'PIPELINE_RUNS_FETCH_FAILURE', error }
  ];

  await store.dispatch(fetchPipelineRun({ name: 'foo' }));
  expect(store.getActions()).toEqual(expectedActions);
});

it('fetchPipelineRuns', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  const namespace = 'namespace';
  const pipelineName = 'pipelineName';
  fetchPipelineRuns({ namespace, pipelineName });
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'PipelineRun',
    API.getPipelineRuns,
    { namespace, pipelineName }
  );
});

it('fetchPipelineRuns no params', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  fetchPipelineRuns();
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'PipelineRun',
    API.getPipelineRuns,
    { namespace: undefined, pipelineName: undefined }
  );
});
