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
import * as API from './eventListeners';
import * as utils from './utils';

it('getEventListener', () => {
  const name = 'foo';
  const data = { fake: 'eventListener' };
  fetchMock.get(`end:${name}`, data);
  return API.getEventListener({ name }).then(eventListener => {
    expect(eventListener).toEqual(data);
    fetchMock.restore();
  });
});

it('getEventListeners', () => {
  const data = {
    items: 'eventListeners'
  };
  fetchMock.get(/eventlisteners/, data);
  return API.getEventListeners().then(eventListeners => {
    expect(eventListeners).toEqual(data.items);
    fetchMock.restore();
  });
});

it('useEventListeners', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useEventListeners(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    'EventListener',
    API.getEventListeners,
    params
  );
});

it('useEventListener', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useEventListener(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    'EventListener',
    API.getEventListener,
    params
  );
});
