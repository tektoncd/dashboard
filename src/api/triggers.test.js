/*
Copyright 2021-2023 The Tekton Authors
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

import * as API from './triggers';
import * as utils from './utils';
import { rest, server } from '../../config_frontend/msw';

it('getTrigger', () => {
  const name = 'foo';
  const data = { fake: 'trigger' };
  server.use(
    rest.get(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.getTrigger({ name }).then(trigger => {
    expect(trigger).toEqual(data);
  });
});

it('getTriggers', () => {
  const data = {
    items: 'triggers'
  };
  server.use(rest.get(/\/triggers\//, (req, res, ctx) => res(ctx.json(data))));
  return API.getTriggers().then(triggers => {
    expect(triggers).toEqual(data);
  });
});

it('useTriggers', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  vi.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useTriggers(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getTriggers,
      kind: 'Trigger',
      params
    })
  );
});

it('useTrigger', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  vi.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useTrigger(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getTrigger,
      kind: 'Trigger',
      params
    })
  );
});
