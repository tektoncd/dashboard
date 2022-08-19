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

import fetchMock from 'fetch-mock';

import * as API from './runs';
import * as utils from './utils';

it('cancelRun', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const returnedRun = { fake: 'Run' };
  const payload = [
    { op: 'replace', path: '/spec/status', value: 'RunCancelled' }
  ];
  fetchMock.patch(`end:${name}`, returnedRun);
  return API.cancelRun({ name, namespace }).then(response => {
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
    expect(response).toEqual(returnedRun);
    fetchMock.restore();
  });
});

it('deleteRun', () => {
  const name = 'foo';
  const data = { fake: 'Run' };
  fetchMock.delete(`end:${name}`, data);
  return API.deleteRun({ name }).then(run => {
    expect(run).toEqual(data);
    fetchMock.restore();
  });
});

it('getRun', () => {
  const name = 'foo';
  const data = { fake: 'Run' };
  fetchMock.get(`end:${name}`, data);
  return API.getRun({ name }).then(run => {
    expect(run).toEqual(data);
    fetchMock.restore();
  });
});

it('getRuns', () => {
  const data = {
    items: 'Runs'
  };
  fetchMock.get(/runs/, data);
  return API.getRuns({ filters: [] }).then(runs => {
    expect(runs).toEqual(data);
    fetchMock.restore();
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
  const filter = 'end:/runs/';
  const originalRun = {
    metadata: { name: 'fake_run' },
    spec: { status: 'fake_status' },
    status: 'fake_status'
  };
  const newRun = { metadata: { name: 'fake_run_rerun' } };
  fetchMock.post(filter, { body: newRun, status: 201 });
  return API.rerunRun(originalRun).then(data => {
    const body = JSON.parse(fetchMock.lastCall(filter)[1].body);
    expect(body.metadata.generateName).toMatch(
      new RegExp(originalRun.metadata.name)
    );
    expect(body.status).toBeUndefined();
    expect(body.spec.status).toBeUndefined();
    expect(data).toEqual(newRun);
    fetchMock.restore();
  });
});
