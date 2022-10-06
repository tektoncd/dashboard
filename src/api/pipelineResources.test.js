/*
Copyright 2019-2022 The Tekton Authors
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

import * as API from './pipelineResources';
import * as utils from './utils';
import { rest, server } from '../../config_frontend/msw';

it('createPipelineResource', () => {
  const namespace = 'namespace1';
  const payload = {
    apiVersion: 'tekton.dev/v1alpha1',
    kind: 'PipelineResource',
    metadata: {
      generateName: 'git-source',
      namespace
    },
    spec: {
      type: 'git',
      params: [
        {
          name: 'url',
          value: 'http://someUrl.com'
        },
        {
          name: 'revision',
          value: 'master'
        }
      ]
    }
  };
  const data = { fake: 'data' };
  server.use(
    rest.post(/\/pipelineresources\//, (req, res, ctx) => res(ctx.json(data)))
  );
  return API.createPipelineResource({ namespace, payload }).then(response => {
    expect(response).toEqual(data);
  });
});

it('deletePipelineResource', () => {
  const name = 'foo';
  const data = { fake: 'pipelineResource' };
  server.use(
    rest.delete(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.deletePipelineResource({ name }).then(pipelineResource => {
    expect(pipelineResource).toEqual(data);
  });
});

it('getPipelineResources', () => {
  const data = {
    items: 'pipelineResources'
  };
  server.use(
    rest.get(/\/pipelineresources\//, (req, res, ctx) => res(ctx.json(data)))
  );
  return API.getPipelineResources().then(pipelineResources => {
    expect(pipelineResources).toEqual(data);
  });
});

it('getPipelineResource', () => {
  const name = 'foo';
  const data = { fake: 'pipelineResource' };
  server.use(
    rest.get(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.getPipelineResource({ name }).then(pipelineResource => {
    expect(pipelineResource).toEqual(data);
  });
});

it('usePipelineResources', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.usePipelineResources(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getPipelineResources,
      kind: 'PipelineResource',
      params
    })
  );
});

it('usePipelineResource', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.usePipelineResource(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getPipelineResource,
      kind: 'PipelineResource',
      params
    })
  );
});
