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

import * as API from './pipelineRuns';
import * as utils from './utils';
import { rest, server } from '../../config_frontend/msw';

it('cancelPipelineRun', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const payload = [{ op: 'replace', path: '/spec/status', value: 'Cancelled' }];
  const returnedPipelineRun = { fake: 'PipelineRun' };
  server.use(
    rest.patch(new RegExp(`/${name}$`), async (req, res, ctx) =>
      (await req.text()) === JSON.stringify(payload)
        ? res(ctx.json(returnedPipelineRun))
        : res(ctx.json(400))
    )
  );
  return API.cancelPipelineRun({ name, namespace }).then(response => {
    expect(response).toEqual(returnedPipelineRun);
  });
});

it('cancelPipelineRun with non-default status', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const status = 'StoppedRunFinally';
  const payload = [{ op: 'replace', path: '/spec/status', value: status }];
  const returnedPipelineRun = { fake: 'PipelineRun' };
  server.use(
    rest.patch(new RegExp(`/${name}$`), async (req, res, ctx) =>
      (await req.text()) === JSON.stringify(payload)
        ? res(ctx.json(returnedPipelineRun))
        : res(ctx.json(400))
    )
  );
  return API.cancelPipelineRun({ name, namespace, status }).then(response => {
    expect(response).toEqual(returnedPipelineRun);
  });
});

it('createPipelineRun', () => {
  const mockDateNow = jest
    .spyOn(Date, 'now')
    .mockImplementation(() => 'fake-timestamp');
  const pipelineName = 'fake-pipelineName';
  const resources = { 'fake-resource-name': 'fake-resource-value' };
  const params = { 'fake-param-name': 'fake-param-value' };
  const serviceAccount = 'fake-serviceAccount';
  const timeout = 'fake-timeout';
  const payload = {
    pipelineName,
    resources,
    params,
    serviceAccount,
    timeoutsPipeline: timeout
  };
  const data = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    metadata: {
      name: `${pipelineName}-run-${Date.now()}`
    },
    spec: {
      pipelineRef: {
        name: pipelineName
      },
      resources: Object.keys(resources).map(name => ({
        name,
        resourceRef: { name: resources[name] }
      })),
      params: Object.keys(params).map(name => ({
        name,
        value: params[name]
      })),
      serviceAccountName: serviceAccount,
      timeouts: {
        pipeline: timeout
      }
    }
  };
  server.use(
    rest.post(/\/pipelineruns/, async (req, res, ctx) => {
      expect(await req.json()).toEqual(data);
      return res(ctx.status(201), ctx.json(data));
    })
  );

  return API.createPipelineRun(payload).then(response => {
    expect(response).toEqual(data);
    mockDateNow.mockRestore();
  });
});

it('createPipelineRun with nodeSelector', () => {
  const mockDateNow = jest
    .spyOn(Date, 'now')
    .mockImplementation(() => 'fake-timestamp');
  const pipelineName = 'fake-pipelineName';
  const resources = { 'fake-resource-name': 'fake-resource-value' };
  const params = { 'fake-param-name': 'fake-param-value' };
  const serviceAccount = 'fake-serviceAccount';
  const timeout = 'fake-timeout';
  const payload = {
    pipelineName,
    resources,
    params,
    serviceAccount,
    timeoutsPipeline: timeout,
    nodeSelector: {
      disk: 'ssd'
    }
  };
  const data = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    metadata: {
      name: `${pipelineName}-run-${Date.now()}`
    },
    spec: {
      pipelineRef: {
        name: pipelineName
      },
      resources: Object.keys(resources).map(name => ({
        name,
        resourceRef: { name: resources[name] }
      })),
      params: Object.keys(params).map(name => ({
        name,
        value: params[name]
      })),
      podTemplate: {
        nodeSelector: {
          disk: 'ssd'
        }
      },
      serviceAccountName: serviceAccount,
      timeouts: {
        pipeline: timeout
      }
    }
  };
  server.use(
    rest.post(/\/pipelineruns/, async (req, res, ctx) => {
      expect(await req.json()).toEqual(data);
      return res(ctx.status(201), ctx.json(data));
    })
  );

  return API.createPipelineRun(payload).then(response => {
    expect(response).toEqual(data);
    mockDateNow.mockRestore();
  });
});

it('createPipelineRunRaw', () => {
  const pipelineRunRaw = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    metadata: { name: 'test-pipeline-run-name', namespace: 'test-namespace' },
    spec: {
      pipelineSpec: {
        tasks: [
          {
            name: 'hello',
            taskSpec: {
              steps: [
                {
                  image: 'busybox',
                  name: 'echo',
                  script: '#!/bin/ash\necho "Hello World!"\n'
                }
              ]
            }
          }
        ]
      }
    }
  };
  server.use(
    rest.post(/\/pipelineruns/, async (req, res, ctx) => {
      expect(await req.json()).toEqual(pipelineRunRaw);
      return res(ctx.status(201), ctx.json(pipelineRunRaw));
    })
  );

  return API.createPipelineRunRaw({
    namespace: 'test-namespace',
    payload: pipelineRunRaw
  }).then(response => {
    expect(response).toEqual(pipelineRunRaw);
  });
});

it('deletePipelineRun', () => {
  const name = 'foo';
  const data = { fake: 'pipelineRun' };
  server.use(
    rest.delete(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.deletePipelineRun({ name }).then(pipelineRun => {
    expect(pipelineRun).toEqual(data);
  });
});

it('getPipelineRun', () => {
  const name = 'foo';
  const data = { fake: 'pipelineRun' };
  server.use(
    rest.get(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.getPipelineRun({ name }).then(pipelineRun => {
    expect(pipelineRun).toEqual(data);
  });
});

it('getPipelineRuns', () => {
  const data = {
    items: 'pipelineRuns'
  };
  server.use(
    rest.get(/\/pipelineruns\//, (req, res, ctx) => res(ctx.json(data)))
  );
  return API.getPipelineRuns({ filters: [] }).then(pipelineRuns => {
    expect(pipelineRuns).toEqual(data);
  });
});

it('getPipelineRuns With Query Params', () => {
  const pipelineName = 'pipelineName';
  const data = {
    items: 'pipelineRuns'
  };
  server.use(
    rest.get(/\/pipelineruns\//, (req, res, ctx) => res(ctx.json(data)))
  );
  return API.getPipelineRuns({ pipelineName, filters: [] }).then(
    pipelineRuns => {
      expect(pipelineRuns).toEqual(data);
    }
  );
});

it('usePipelineRuns', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.usePipelineRuns(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getPipelineRuns,
      kind: 'PipelineRun',
      params
    })
  );
});

it('usePipelineRun', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.usePipelineRun(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getPipelineRun,
      kind: 'PipelineRun',
      params
    })
  );

  const queryConfig = { fake: 'queryConfig' };
  API.usePipelineRun(params, queryConfig);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getPipelineRun,
      kind: 'PipelineRun',
      params,
      queryConfig
    })
  );
});

it('rerunPipelineRun', () => {
  const originalPipelineRun = {
    metadata: {
      labels: {
        'tekton.dev/pipeline': 'foo'
      },
      name: 'fake_pipelineRun'
    },
    spec: { status: 'fake_status' },
    status: 'fake_status'
  };
  const newPipelineRun = { metadata: { name: 'fake_pipelineRun_rerun' } };
  server.use(
    rest.post(/\/pipelineruns\/$/, async (req, res, ctx) => {
      const { metadata, spec, status } = await req.json();
      expect(metadata.generateName).toMatch(
        new RegExp(originalPipelineRun.metadata.name)
      );
      expect(spec.status).toBeUndefined();
      expect(status).toBeUndefined();
      return res(ctx.status(201), ctx.json(newPipelineRun));
    })
  );

  return API.rerunPipelineRun(originalPipelineRun).then(data => {
    expect(data).toEqual(newPipelineRun);
  });
});

it('startPipelineRun', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const returnedPipelineRun = { fake: 'PipelineRun' };
  const payload = [{ op: 'remove', path: '/spec/status' }];
  server.use(
    rest.patch(new RegExp(`/${name}$`), async (req, res, ctx) =>
      (await req.text()) === JSON.stringify(payload)
        ? res(ctx.json(returnedPipelineRun))
        : res(ctx.json(400))
    )
  );
  return API.startPipelineRun({ metadata: { name, namespace } }).then(
    response => {
      expect(response).toEqual(returnedPipelineRun);
    }
  );
});
