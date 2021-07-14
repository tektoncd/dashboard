/*
Copyright 2019-2021 The Tekton Authors
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

import fetchMock from 'fetch-mock';
import * as API from './clusterTasks';
import * as utils from './utils';

it('getClusterTasks', () => {
  const data = {
    items: 'clustertasks'
  };
  fetchMock.get(/clustertasks/, data);
  return API.getClusterTasks().then(tasks => {
    expect(tasks).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getClusterTask', () => {
  const name = 'foo';
  const data = { fake: 'clustertask' };
  fetchMock.get(`end:${name}`, data);
  return API.getClusterTask({ name }).then(task => {
    expect(task).toEqual(data);
    fetchMock.restore();
  });
});

it('deletePipelineRun', () => {
  const name = 'foo';
  const data = { fake: 'clusterTask' };
  fetchMock.delete(`end:${name}`, data);
  return API.deleteClusterTask({ name }).then(clusterTask => {
    expect(clusterTask).toEqual(data);
    fetchMock.restore();
  });
});

it('useClusterTasks', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useClusterTasks(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    'ClusterTask',
    API.getClusterTasks,
    params
  );
});

it('useClusterTask', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useClusterTask(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    'ClusterTask',
    API.getClusterTask,
    params,
    undefined
  );

  const queryConfig = { fake: 'queryConfig' };
  API.useClusterTask(params, queryConfig);
  expect(utils.useResource).toHaveBeenCalledWith(
    'ClusterTask',
    API.getClusterTask,
    params,
    queryConfig
  );
});
