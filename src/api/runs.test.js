/*
Copyright 2022-2023 The Tekton Authors
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
import * as comms from './comms';
import { rest, server } from '../../config_frontend/msw';

it('cancelRun', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const payload = [
    { op: 'replace', path: '/spec/status', value: 'RunCancelled' }
  ];
  jest
    .spyOn(comms, 'patch')
    .mockImplementation((uri, body) => Promise.resolve(body));
  return API.cancelRun({ name, namespace }).then(() => {
    expect(comms.patch).toHaveBeenCalled();
    expect(comms.patch.mock.lastCall[1]).toEqual(payload);
  });
});

it('deleteRun', () => {
  const name = 'foo';
  const data = { fake: 'Run' };
  server.use(
    rest.delete(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.deleteRun({ name }).then(run => {
    expect(run).toEqual(data);
  });
});

it('getRun', () => {
  const name = 'foo';
  const data = { fake: 'Run' };
  server.use(
    rest.get(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.getRun({ name }).then(run => {
    expect(run).toEqual(data);
  });
});

it('getRuns', () => {
  const data = {
    items: 'Runs'
  };
  server.use(rest.get(/\/runs\//, (req, res, ctx) => res(ctx.json(data))));
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
  jest
    .spyOn(comms, 'post')
    .mockImplementation((uri, body) => Promise.resolve(body));

  return API.rerunRun(originalRun).then(() => {
    expect(comms.post).toHaveBeenCalled();
    const sentBody = comms.post.mock.lastCall[1];
    const { metadata, spec, status } = sentBody;
    expect(metadata.generateName).toMatch(
      new RegExp(originalRun.metadata.name)
    );
    expect(spec.status).toBeUndefined();
    expect(status).toBeUndefined();
  });
});
