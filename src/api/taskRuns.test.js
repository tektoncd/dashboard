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

import * as API from './taskRuns';
import * as utils from './utils';
import { rest, server } from '../../config_frontend/msw';

it('cancelTaskRun', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const returnedTaskRun = { fake: 'taskRun' };
  const payload = [
    { op: 'replace', path: '/spec/status', value: 'TaskRunCancelled' }
  ];
  server.use(
    rest.patch(new RegExp(`/${name}$`), async (req, res, ctx) =>
      (await req.text()) === JSON.stringify(payload)
        ? res(ctx.json(returnedTaskRun))
        : res(ctx.json(400))
    )
  );
  return API.cancelTaskRun({ name, namespace }).then(response => {
    expect(response).toEqual(returnedTaskRun);
  });
});

it('createTaskRun uses correct kubernetes information', () => {
  const data = { fake: 'createtaskrun' };
  server.use(
    rest.post(/\/taskruns\//, async (req, res, ctx) => {
      const sentBody = await req.json();
      expect(sentBody.apiVersion).toEqual('tekton.dev/v1beta1');
      expect(sentBody.kind).toEqual('TaskRun');
      expect(sentBody).toHaveProperty('metadata');
      expect(sentBody).toHaveProperty('spec');
      return res(ctx.status(201), ctx.json(data));
    })
  );
  return API.createTaskRun({}).then(response => {
    expect(response).toEqual(data);
  });
});

it('createTaskRun has correct metadata', () => {
  const mockDateNow = jest
    .spyOn(Date, 'now')
    .mockImplementation(() => 'fake-timestamp');
  const namespace = 'fake-namespace';
  const taskName = 'fake-task';
  const labels = { app: 'fake-app' };
  server.use(
    rest.post(/\/taskruns\//, async (req, res, ctx) => {
      const { metadata: sentMetadata } = await req.json();
      expect(sentMetadata.name).toMatch(taskName); // include name
      expect(sentMetadata.name).toMatch('fake-timestamp'); // include timestamp
      expect(sentMetadata.namespace).toEqual(namespace);
      expect(sentMetadata.labels.app).toEqual('fake-app');
      return res(ctx.status(201), ctx.json({}));
    })
  );
  return API.createTaskRun({ namespace, taskName, labels }).then(() => {
    mockDateNow.mockRestore();
  });
});

it('createTaskRun handles taskRef', () => {
  const taskName = 'fake-task';
  server.use(
    rest.post(/\/taskruns\//, async (req, res, ctx) => {
      const { spec: sentSpec } = await req.json();
      expect(sentSpec.taskRef.name).toEqual(taskName);
      expect(sentSpec.taskRef.kind).toEqual('Task');
      return res(ctx.status(201), ctx.json({}));
    })
  );
  return API.createTaskRun({ taskName });
});

it('createTaskRun handles ClusterTask in taskRef', () => {
  const taskName = 'fake-task';
  server.use(
    rest.post(/\/taskruns\//, async (req, res, ctx) => {
      const { spec: sentSpec } = await req.json();
      expect(sentSpec.taskRef.kind).toEqual('ClusterTask');
      return res(ctx.status(201), ctx.json({}));
    })
  );
  return API.createTaskRun({ taskName, kind: 'ClusterTask' });
});

it('createTaskRun handles parameters', () => {
  const taskName = 'fake-task';
  const params = { 'fake-param-name': 'fake-param-value' };
  server.use(
    rest.post(/\/taskruns\//, async (req, res, ctx) => {
      const { spec: sentSpec } = await req.json();
      expect(sentSpec.params).toContainEqual({
        name: 'fake-param-name',
        value: 'fake-param-value'
      });
      return res(ctx.status(201), ctx.json({}));
    })
  );
  return API.createTaskRun({ taskName, params });
});

it('createTaskRun handles serviceAccount', () => {
  const taskName = 'fake-task';
  const serviceAccount = 'fake-service-account';
  server.use(
    rest.post(/\/taskruns\//, async (req, res, ctx) => {
      const { spec: sentSpec } = await req.json();
      expect(sentSpec.serviceAccountName).toEqual(serviceAccount);
      return res(ctx.status(201), ctx.json({}));
    })
  );
  return API.createTaskRun({ taskName, serviceAccount });
});

it('createTaskRun handles nodeSelector', () => {
  const taskName = 'fake-task';
  const nodeSelector = { disk: 'ssd' };
  server.use(
    rest.post(/\/taskruns\//, async (req, res, ctx) => {
      const { spec: sentSpec } = await req.json();
      expect(sentSpec.podTemplate).toEqual({ nodeSelector });
      return res(ctx.status(201), ctx.json({}));
    })
  );
  return API.createTaskRun({ taskName, nodeSelector });
});

it('createTaskRun handles timeout', () => {
  const taskName = 'fake-task';
  const timeout = 'fake-timeout';
  server.use(
    rest.post(/\/taskruns\//, async (req, res, ctx) => {
      const { spec: sentSpec } = await req.json();
      expect(sentSpec.timeout).toEqual(timeout);
      return res(ctx.status(201), ctx.json({}));
    })
  );
  return API.createTaskRun({ taskName, timeout });
});

it('deleteTaskRun', () => {
  const name = 'foo';
  const data = { fake: 'taskRun' };
  server.use(
    rest.delete(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.deleteTaskRun({ name }).then(taskRun => {
    expect(taskRun).toEqual(data);
  });
});

it('getTaskRun', () => {
  const name = 'foo';
  const data = { fake: 'taskRun' };
  server.use(
    rest.get(new RegExp(`/${name}$`), (req, res, ctx) => res(ctx.json(data)))
  );
  return API.getTaskRun({ name }).then(taskRun => {
    expect(taskRun).toEqual(data);
  });
});

it('getTaskRuns', () => {
  const data = {
    items: 'taskRuns'
  };
  server.use(rest.get(/\/taskruns\//, (req, res, ctx) => res(ctx.json(data))));
  return API.getTaskRuns().then(taskRuns => {
    expect(taskRuns).toEqual(data);
  });
});

it('getTaskRuns With Query Params', () => {
  const taskName = 'taskName';
  const data = {
    items: 'taskRuns'
  };
  server.use(rest.get(/\/taskruns\//, (req, res, ctx) => res(ctx.json(data))));
  return API.getTaskRuns({ taskName }).then(taskRuns => {
    expect(taskRuns).toEqual(data);
  });
});

it('useTaskRuns', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useTaskRuns(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getTaskRuns,
      kind: 'TaskRun',
      params
    })
  );
});

it('useTaskRun', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useTaskRun(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getTaskRun,
      kind: 'TaskRun',
      params
    })
  );

  const queryConfig = { fake: 'queryConfig' };
  API.useTaskRun(params, queryConfig);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getTaskRun,
      kind: 'TaskRun',
      params,
      queryConfig
    })
  );
});

it('rerunTaskRun', () => {
  const originalTaskRun = {
    metadata: { name: 'fake_taskRun' },
    spec: { status: 'fake_status' },
    status: 'fake_status'
  };
  const newTaskRun = { metadata: { name: 'fake_taskRun_rerun' } };
  server.use(
    rest.post(/\/taskruns\/$/, async (req, res, ctx) => {
      const { metadata, spec, status } = await req.json();
      expect(metadata.generateName).toMatch(
        new RegExp(originalTaskRun.metadata.name)
      );
      expect(spec.status).toBeUndefined();
      expect(status).toBeUndefined();
      return res(ctx.status(201), ctx.json(newTaskRun));
    })
  );
  return API.rerunTaskRun(originalTaskRun).then(data => {
    expect(data).toEqual(newTaskRun);
  });
});
