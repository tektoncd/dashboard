/*
Copyright 2019-2022 The Tekton Authors
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

import * as API from './clusterTasks';
import * as utils from './utils';
import { rest, server } from '../../config_frontend/msw';

it('getClusterTasks', () => {
  const data = {
    items: 'clustertasks'
  };
  server.use(
    rest.get(/\/clustertasks\//, (req, res, ctx) => res(ctx.json(data)))
  );

  return API.getClusterTasks().then(tasks => {
    expect(tasks).toEqual(data);
  });
});

it('getClusterTask', () => {
  const name = 'foo';
  const data = { fake: 'clustertask' };
  server.use(
    rest.get(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.getClusterTask({ name }).then(task => {
    expect(task).toEqual(data);
  });
});

it('deletePipelineRun', () => {
  const name = 'foo';
  const data = { fake: 'clusterTask' };
  server.use(
    rest.delete(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.deleteClusterTask({ name }).then(clusterTask => {
    expect(clusterTask).toEqual(data);
  });
});

it('useClusterTasks', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useClusterTasks(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getClusterTasks,
      kind: 'ClusterTask',
      params
    })
  );
});

it('useClusterTask', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useClusterTask(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getClusterTask,
      kind: 'ClusterTask',
      params
    })
  );

  const queryConfig = { fake: 'queryConfig' };
  API.useClusterTask(params, queryConfig);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getClusterTask,
      kind: 'ClusterTask',
      params,
      queryConfig
    })
  );
});
