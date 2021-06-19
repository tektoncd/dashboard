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
import * as API from './conditions';
import * as utils from './utils';

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

it('useConditions', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useConditions(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    'Condition',
    API.getConditions,
    params
  );
});

it('useCondition', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useCondition(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    'Condition',
    API.getCondition,
    params
  );
});
