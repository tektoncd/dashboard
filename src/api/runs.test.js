/*
Copyright 2022 The Tekton Authors
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

import * as API from './runs';
import * as utils from './utils';
import { rest, server } from '../../config_frontend/msw';

it('cancelRun', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const returnedRun = { fake: 'Run' };
  const payload = [
    { op: 'replace', path: '/spec/status', value: 'RunCancelled' }
  ];
  server.use(
    rest.patch(new RegExp(`/${name}$`), async (req, res, ctx) =>
      (await req.text()) === JSON.stringify(payload)
        ? res(ctx.json(returnedRun))
        : res(ctx.json(400))
    )
  );
  return API.cancelRun({ name, namespace }).then(response => {
    expect(response).toEqual(returnedRun);
  });
});

it('deleteRun', () => {
  const name = 'foo';
  const data = { fake: 'Run' };
  server.use(
    rest.delete(new RegExp(`/${name}$`), async (req, res, ctx) =>
      res(ctx.json(data))
    )
  );
  return API.deleteRun({ name }).then(run => {
    expect(run).toEqual(data);
  });
});

it('getRun', () => {
  const name = 'foo';
  const data = { fake: 'Run' };
  server.use(
    rest.get(new RegExp(`/${name}$`), async (req, res, ctx) =>
      res(ctx.json(data))
    )
  );
  return API.getRun({ name }).then(run => {
    expect(run).toEqual(data);
  });
});

it('getRuns', () => {
  const data = {
    items: 'Runs'
  };
  server.use(
    rest.get(/\/runs\//, async (req, res, ctx) => res(ctx.json(data)))
  );
  return API.getRuns({ filters: [] }).then(runs => {
    expect(runs).toEqual(data);
  });
});

it('useRuns', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useRuns(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getRuns,
      kind: 'Run',
      params
    })
  );
});

it('useRun', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useRun(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getRun,
      kind: 'Run',
      params
    })
  );

  const queryConfig = { fake: 'queryConfig' };
  API.useRun(params, queryConfig);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getRun,
      kind: 'Run',
      params,
      queryConfig
    })
  );
});

it('rerunRun', () => {
  const originalRun = {
    metadata: { name: 'fake_run' },
    spec: { status: 'fake_status' },
    status: 'fake_status'
  };
  const newRun = { metadata: { name: 'fake_run_rerun' } };
  server.use(
    rest.post(/\/runs\/$/, async (req, res, ctx) => {
      const { metadata, spec, status } = await req.json();
      expect(metadata.generateName).toMatch(
        new RegExp(originalRun.metadata.name)
      );
      expect(spec.status).toBeUndefined();
      expect(status).toBeUndefined();
      return res(ctx.status(201), ctx.json(newRun));
    })
  );

  return API.rerunRun(originalRun).then(data => {
    expect(data).toEqual(newRun);
  });
});
