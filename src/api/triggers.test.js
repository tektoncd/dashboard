/*
Copyright 2021 The Tekton Authors
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
import * as API from './triggers';
import * as utils from './utils';

it('getTrigger', () => {
  const name = 'foo';
  const data = { fake: 'trigger' };
  fetchMock.get(`end:${name}`, data);
  return API.getTrigger({ name }).then(trigger => {
    expect(trigger).toEqual(data);
    fetchMock.restore();
  });
});

it('getTriggers', () => {
  const data = {
    items: 'triggers'
  };
  fetchMock.get(/triggers/, data);
  return API.getTriggers().then(triggers => {
    expect(triggers).toEqual(data.items);
    fetchMock.restore();
  });
});

it('useTriggers', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useTriggers(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    'Trigger',
    API.getTriggers,
    params
  );
});

it('useTrigger', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useTrigger(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    'Trigger',
    API.getTrigger,
    params
  );
});
