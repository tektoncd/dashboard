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

import * as API from './customRuns';
import * as utils from './utils';
import * as comms from './comms';
import { rest, server } from '../../config_frontend/msw';

it('cancelCustomRun', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const payload = [
    { op: 'replace', path: '/spec/status', value: 'RunCancelled' }
  ];
  jest
    .spyOn(comms, 'patch')
    .mockImplementation((uri, body) => Promise.resolve(body));
  return API.cancelCustomRun({ name, namespace }).then(() => {
    expect(comms.patch).toHaveBeenCalled();
    expect(comms.patch.mock.lastCall[1]).toEqual(payload);
  });
});

it('deleteCustomRun', () => {
  const name = 'foo';
  const data = { fake: 'CustomRun' };
  server.use(
    rest.delete(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.deleteCustomRun({ name }).then(run => {
    expect(run).toEqual(data);
  });
});

it('getCustomRun', () => {
  const name = 'foo';
  const data = { fake: 'CustomRun' };
  server.use(
    rest.get(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.getCustomRun({ name }).then(run => {
    expect(run).toEqual(data);
  });
});

it('getCustomRuns', () => {
  const data = {
    items: 'Runs'
  };
  server.use(
    rest.get(/\/customruns\//, (req, res, ctx) => res(ctx.json(data)))
  );
  return API.getCustomRuns({ filters: [] }).then(runs => {
    expect(runs).toEqual(data);
  });
});

it('useCustomRuns', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useCustomRuns(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getCustomRuns,
      kind: 'CustomRun',
      params
    })
  );
});

it('useCustomRun', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useCustomRun(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getCustomRun,
      kind: 'CustomRun',
      params
    })
  );

  const queryConfig = { fake: 'queryConfig' };
  API.useCustomRun(params, queryConfig);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getCustomRun,
      kind: 'CustomRun',
      params,
      queryConfig
    })
  );
});

it('rerunCustomRun', () => {
  const originalRun = {
    metadata: { name: 'fake_run' },
    spec: { status: 'fake_status' },
    status: 'fake_status'
  };
  jest
    .spyOn(comms, 'post')
    .mockImplementation((uri, body) => Promise.resolve(body));

  return API.rerunCustomRun(originalRun).then(() => {
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
