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

import { isStale, sortRunsByStartTime, typeToPlural } from '.';

it('sortRunsByStartTime', () => {
  const a = { name: 'a', status: { startTime: '0' } };
  const b = { name: 'b', status: {} };
  const c = { name: 'c', status: { startTime: '2' } };
  const d = { name: 'd', status: { startTime: '1' } };
  const e = { name: 'e', status: {} };
  const f = { name: 'f', status: { startTime: '3' } };

  const runs = [a, b, c, d, e, f];
  /*
    sort is stable on all modern browsers so
    input order is preserved for b and e
   */
  const sortedRuns = [b, e, f, c, d, a];
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
