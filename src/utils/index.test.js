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

import * as API from '../api';

import {
  fetchLogs,
  getGitValues,
  isStale,
  sortRunsByStartTime,
  typeToPlural
} from '.';

it('sortRunsByStartTime', () => {
  const a = { name: 'a', status: { startTime: '0' } };
  const b = { name: 'b', status: {} };
  const c = { name: 'c', status: { startTime: '2' } };
  const d = { name: 'd', status: { startTime: '1' } };
  const e = { name: 'e', status: {} };
  const f = { name: 'f', status: { startTime: '3' } };
  const g = { name: 'g' };

  const runs = [a, b, c, d, e, f, g];
  /*
    sort is stable on all modern browsers so
    input order is preserved for b and e
   */
  const sortedRuns = [b, e, g, f, c, d, a];
  sortRunsByStartTime(runs);
  expect(runs).toEqual(sortedRuns);
});

it('typeToPlural', () => {
  expect(typeToPlural('Extension')).toEqual('EXTENSIONS');
});

it('isStale', () => {
  const uid = 'fake_uid';
  const existingResource = {
    metadata: {
      uid,
      resourceVersion: '123'
    }
  };
  const incomingResource = {
    metadata: {
      uid,
      resourceVersion: '45'
    }
  };
  const state = {
    [uid]: existingResource
  };
  expect(isStale(incomingResource, {})).toBe(false);
  expect(isStale(incomingResource, state)).toBe(true);
  expect(isStale(existingResource, state)).toBe(false);
});

it('fetchLogs', () => {
  const stepName = 'kubectl-apply';
  const stepStatus = { container: 'step-kubectl-apply' };
  const taskRun = { pod: 'pipeline-run-123456', namespace: 'default' };

  const logs = 'fake logs';
  jest.spyOn(API, 'getPodLog').mockImplementation(() => logs);

  const returnedLogs = fetchLogs(stepName, stepStatus, taskRun);
  expect(API.getPodLog).toHaveBeenCalledWith(
    expect.objectContaining({
      container: stepStatus.container,
      name: taskRun.pod,
      namespace: taskRun.namespace
    })
  );
  returnedLogs.then(data => {
    expect(data).toBe(logs);
  });
});

it('getGitValues', () => {
  const url = 'https://github.com/user/repo';

  const returnedValue = getGitValues(url);

  expect(returnedValue).toStrictEqual({
    gitOrg: 'user',
    gitRepo: 'repo.git',
    gitServer: 'github.com'
  });
});
