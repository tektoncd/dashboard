/*
Copyright 2019-2023 The Tekton Authors
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

import { http, HttpResponse } from 'msw';

import * as API from './triggerBindings';
import * as utils from './utils';
import { server } from '../../config_frontend/msw';

it('getTriggerBinding', () => {
  const name = 'foo';
  const data = { fake: 'triggerBinding' };
  server.use(http.get(new RegExp(`/${name}$`), () => HttpResponse.json(data)));
  return API.getTriggerBinding({ name }).then(triggerBinding => {
    expect(triggerBinding).toEqual(data);
  });
});

it('getTriggerBindings', () => {
  const data = {
    items: 'triggerBindings'
  };
  server.use(http.get(/\/triggerbindings\//, () => HttpResponse.json(data)));
  return API.getTriggerBindings().then(triggerBindings => {
    expect(triggerBindings).toEqual(data);
  });
});

it('useTriggerBindings', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  vi.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useTriggerBindings(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getTriggerBindings,
      kind: 'TriggerBinding',
      params
    })
  );
});

it('useTriggerBinding', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  vi.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useTriggerBinding(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getTriggerBinding,
      kind: 'TriggerBinding',
      params
    })
  );
});
