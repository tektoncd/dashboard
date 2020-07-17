/*
Copyright 2019-2020 The Tekton Authors
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
import * as API from './conditions';

it('getConditions', () => {
  const data = {
    items: 'conditions'
  };
  fetchMock.get(/conditions/, data);
  return API.getConditions().then(conditions => {
    expect(conditions).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getCondition', () => {
  const name = 'foo';
  const data = { fake: 'condition' };
  fetchMock.get(`end:${name}`, data);
  return API.getCondition({ name }).then(condition => {
    expect(condition).toEqual(data);
    fetchMock.restore();
  });
});
