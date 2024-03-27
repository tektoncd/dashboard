/*
Copyright 2024 The Tekton Authors
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

import * as API from './stepActions';
import * as utils from './utils';
import { server } from '../../config_frontend/msw';

it('getStepActions', () => {
  const data = {
    items: 'stepactions'
  };
  server.use(http.get(/\/stepactions\//, () => HttpResponse.json(data)));
  return API.getStepActions().then(stepActions => {
    expect(stepActions).toEqual(data);
  });
});

it('getStepAction', () => {
  const name = 'foo';
  const data = { fake: 'stepAction' };
  server.use(http.get(new RegExp(`/${name}$`), () => HttpResponse.json(data)));
  return API.getStepAction({ name }).then(stepAction => {
    expect(stepAction).toEqual(data);
  });
});

it('deleteStepAction', () => {
  const name = 'foo';
  const data = { fake: 'stepAction' };
  server.use(
    http.delete(new RegExp(`/${name}$`), () => HttpResponse.json(data))
  );
  return API.deleteStepAction({ name }).then(stepAction => {
    expect(stepAction).toEqual(data);
  });
});

it('useStepActions', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  vi.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useStepActions(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getStepActions,
      kind: 'StepAction',
      params
    })
  );
});

it('useStepAction', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  vi.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useStepAction(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getStepAction,
      kind: 'StepAction',
      params
    })
  );

  const queryConfig = { fake: 'queryConfig' };
  API.useStepAction(params, queryConfig);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getStepAction,
      kind: 'StepAction',
      params,
      queryConfig
    })
  );
});
