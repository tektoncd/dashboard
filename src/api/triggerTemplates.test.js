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

import * as API from './triggerTemplates';
import * as utils from './utils';
import { server } from '../../config_frontend/msw';

it('getTriggerTemplate', () => {
  const name = 'foo';
  const data = { fake: 'triggerTemplate' };
  server.use(http.get(new RegExp(`/${name}$`), () => HttpResponse.json(data)));
  return API.getTriggerTemplate({ name }).then(triggerTemplate => {
    expect(triggerTemplate).toEqual(data);
  });
});

it('getTriggerTemplates', () => {
  const data = {
    items: 'triggerTemplates'
  };
  server.use(http.get(/\/triggertemplates\//, () => HttpResponse.json(data)));
  return API.getTriggerTemplates().then(triggerTemplates => {
    expect(triggerTemplates).toEqual(data);
  });
});

it('useTriggerTemplates', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  vi.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useTriggerTemplates(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getTriggerTemplates,
      kind: 'TriggerTemplate',
      params
    })
  );
});

it('useTriggerTemplate', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  vi.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useTriggerTemplate(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getTriggerTemplate,
      kind: 'TriggerTemplate',
      params
    })
  );
});
