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

import * as API from './pipelines';
import * as utils from './utils';
import { rest, server } from '../../config_frontend/msw';

it('getPipelines', () => {
  const data = {
    items: 'pipelines'
  };
  server.use(rest.get(/\/pipelines\//, (req, res, ctx) => res(ctx.json(data))));
  return API.getPipelines().then(pipelines => {
    expect(pipelines).toEqual(data);
  });
});

it('getPipeline', () => {
  const name = 'foo';
  const data = { fake: 'pipeline' };
  server.use(
    rest.get(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.getPipeline({ name }).then(pipeline => {
    expect(pipeline).toEqual(data);
  });
});

it('deletePipeline', () => {
  const name = 'foo';
  const data = { fake: 'pipeline' };
  server.use(
    rest.delete(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.deletePipeline({ name }).then(pipeline => {
    expect(pipeline).toEqual(data);
  });
});

it('usePipelines', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.usePipelines(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getPipelines,
      kind: 'Pipeline',
      params
    })
  );
});

it('usePipeline', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.usePipeline(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getPipeline,
      kind: 'Pipeline',
      params
    })
  );

  const queryConfig = { fake: 'queryConfig' };
  API.usePipeline(params, queryConfig);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getPipeline,
      kind: 'Pipeline',
      params,
      queryConfig
    })
  );
});
