/*
Copyright 2019-2025 The Tekton Authors
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

import yaml from 'js-yaml';
import { http, HttpResponse } from 'msw';

import * as API from './taskRuns';
import * as utils from './utils';
import * as comms from './comms';
import { server } from '../../config_frontend/msw';

it('cancelTaskRun', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const payload = [
    { op: 'replace', path: '/spec/status', value: 'TaskRunCancelled' }
  ];
  vi.spyOn(comms, 'patch').mockImplementation((uri, body) =>
    Promise.resolve(body)
  );
  return API.cancelTaskRun({ name, namespace }).then(() => {
    expect(comms.patch).toHaveBeenCalled();
    expect(comms.patch.mock.lastCall[1]).toEqual(payload);
  });
});

describe('createTaskRun', () => {
  it('uses correct kubernetes information', () => {
    vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
      Promise.resolve(body)
    );

    return API.createTaskRun({}).then(() => {
      expect(comms.post).toHaveBeenCalled();
      const sentBody = comms.post.mock.lastCall[1];
      expect(sentBody.apiVersion).toEqual('tekton.dev/v1');
      expect(sentBody.kind).toEqual('TaskRun');
      expect(sentBody).toHaveProperty('metadata');
      expect(sentBody).toHaveProperty('spec');
    });
  });

  it('has correct metadata', () => {
    const mockDateNow = vi
      .spyOn(Date, 'now')
      .mockImplementation(() => 'fake-timestamp');
    const namespace = 'fake-namespace';
    const taskName = 'fake-task';
    const labels = { app: 'fake-app' };
    vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
      Promise.resolve(body)
    );

    return API.createTaskRun({ namespace, taskName, labels }).then(() => {
      expect(comms.post).toHaveBeenCalled();
      const sentBody = comms.post.mock.lastCall[1];
      const { metadata: sentMetadata } = sentBody;
      expect(sentMetadata.name).toMatch(taskName);
      expect(sentMetadata.name).toMatch('fake-timestamp');
      expect(sentMetadata.namespace).toEqual(namespace);
      expect(sentMetadata.labels.app).toEqual('fake-app');

      mockDateNow.mockRestore();
    });
  });

  it('handles taskRef', () => {
    const taskName = 'fake-task';
    vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
      Promise.resolve(body)
    );
    return API.createTaskRun({ taskName }).then(() => {
      expect(comms.post).toHaveBeenCalled();
      const sentBody = comms.post.mock.lastCall[1];
      const { spec: sentSpec } = sentBody;
      expect(sentSpec.taskRef.name).toEqual(taskName);
      expect(sentSpec.taskRef.kind).toEqual('Task');
    });
  });

  it('handles parameters', () => {
    const taskName = 'fake-task';
    const params = { 'fake-param-name': 'fake-param-value' };
    vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
      Promise.resolve(body)
    );
    return API.createTaskRun({ taskName, params }).then(() => {
      expect(comms.post).toHaveBeenCalled();
      const sentBody = comms.post.mock.lastCall[1];
      const { spec: sentSpec } = sentBody;
      expect(sentSpec.params).toContainEqual({
        name: 'fake-param-name',
        value: 'fake-param-value'
      });
    });
  });

  it('handles serviceAccount', () => {
    const taskName = 'fake-task';
    const serviceAccount = 'fake-service-account';
    vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
      Promise.resolve(body)
    );
    return API.createTaskRun({ taskName, serviceAccount }).then(() => {
      expect(comms.post).toHaveBeenCalled();
      const sentBody = comms.post.mock.lastCall[1];
      const { spec: sentSpec } = sentBody;
      expect(sentSpec.serviceAccountName).toEqual(serviceAccount);
    });
  });

  it('handles nodeSelector', () => {
    const taskName = 'fake-task';
    const nodeSelector = { disk: 'ssd' };
    vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
      Promise.resolve(body)
    );
    return API.createTaskRun({ taskName, nodeSelector }).then(() => {
      expect(comms.post).toHaveBeenCalled();
      const sentBody = comms.post.mock.lastCall[1];
      const { spec: sentSpec } = sentBody;
      expect(sentSpec.podTemplate).toEqual({ nodeSelector });
    });
  });

  it('handles timeout', () => {
    const taskName = 'fake-task';
    const timeout = 'fake-timeout';
    vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
      Promise.resolve(body)
    );
    return API.createTaskRun({ taskName, timeout }).then(() => {
      expect(comms.post).toHaveBeenCalled();
      const sentBody = comms.post.mock.lastCall[1];
      const { spec: sentSpec } = sentBody;
      expect(sentSpec.timeout).toEqual(timeout);
    });
  });
});

it('createTaskRunRaw', () => {
  const taskRunRaw = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'TaskRun',
    metadata: { name: 'test-task-run-name', namespace: 'test-namespace' },
    spec: {
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
  };
  vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
    Promise.resolve(body)
  );

  return API.createTaskRunRaw({
    namespace: 'test-namespace',
    payload: taskRunRaw
  }).then(() => {
    expect(comms.post).toHaveBeenCalled();
    expect(comms.post.mock.lastCall[1]).toEqual(taskRunRaw);
  });
});

it('deleteTaskRun', () => {
  const name = 'foo';
  const data = { fake: 'taskRun' };
  server.use(
    http.delete(new RegExp(`/${name}$`), () => HttpResponse.json(data))
  );
  return API.deleteTaskRun({ name }).then(taskRun => {
    expect(taskRun).toEqual(data);
  });
});

it('useTaskRuns', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  vi.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useTaskRuns(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      group: utils.tektonAPIGroup,
      kind: 'taskruns',
      params,
      version: 'v1'
    })
  );
});

it('useTaskRun', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  vi.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useTaskRun(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      group: utils.tektonAPIGroup,
      kind: 'taskruns',
      params,
      version: 'v1'
    })
  );

  const queryConfig = { fake: 'queryConfig' };
  API.useTaskRun(params, queryConfig);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      group: utils.tektonAPIGroup,
      kind: 'taskruns',
      params,
      queryConfig,
      version: 'v1'
    })
  );
});

it('rerunTaskRun', () => {
  const originalTaskRun = {
    metadata: { name: 'fake_taskRun', namespace: 'fake_namespace' },
    spec: { status: 'fake_status' },
    status: 'fake_status'
  };
  vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
    Promise.resolve(body)
  );

  const rerun = {
    apiVersion: 'tekton.dev/v1',
    kind: 'TaskRun',
    metadata: {
      annotations: {},
      generateName: `${originalTaskRun.metadata.name}-r-`,
      labels: {
        'dashboard.tekton.dev/rerunOf': originalTaskRun.metadata.name
      },
      namespace: originalTaskRun.metadata.namespace
    },
    spec: {}
  };

  return API.rerunTaskRun(originalTaskRun).then(() => {
    expect(comms.post).toHaveBeenCalled();
    expect(comms.post.mock.lastCall[1]).toEqual(rerun);
  });
});

describe('generateNewTaskRunPayload', () => {
  it('rerun with minimum possible fields', () => {
    const taskRun = {
      apiVersion: 'tekton.dev/v1beta1',
      kind: 'TaskRun',
      metadata: {
        name: 'test',
        namespace: 'test-namespace'
      },
      spec: {
        taskRef: {
          name: 'simple'
        }
      }
    };
    const { namespace, payload } = API.generateNewTaskRunPayload({
      taskRun,
      rerun: true
    });
    const expected = `apiVersion: tekton.dev/v1beta1
kind: TaskRun
metadata:
  annotations: {}
  generateName: test-r-
  labels:
    dashboard.tekton.dev/rerunOf: test
  namespace: test-namespace
spec:
  taskRef:
    name: simple
`;
    expect(namespace).toEqual('test-namespace');
    expect(yaml.dump(payload)).toEqual(expected);
  });

  it('rerun with all processed fields', () => {
    const taskRun = {
      apiVersion: 'tekton.dev/v1beta1',
      kind: 'TaskRun',
      metadata: {
        name: 'test',
        namespace: 'test-namespace',
        annotations: {
          keya: 'valuea',
          'kubectl.kubernetes.io/last-applied-configuration':
            '{"apiVersion": "tekton.dev/v1beta1", "keya": "valuea"}'
        },
        labels: {
          key1: 'valuel',
          key2: 'value2',
          'tekton.dev/task': 'foo'
        },
        uid: '111-233-33',
        resourceVersion: 'aaaa'
      },
      spec: {
        taskRef: {
          name: 'simple'
        },
        params: [{ name: 'param-1' }, { name: 'param-2' }]
      },
      status: { startTime: '0' }
    };
    const { namespace, payload } = API.generateNewTaskRunPayload({
      taskRun,
      rerun: true
    });
    const expected = `apiVersion: tekton.dev/v1beta1
kind: TaskRun
metadata:
  annotations:
    keya: valuea
  generateName: test-r-
  labels:
    key1: valuel
    key2: value2
    dashboard.tekton.dev/rerunOf: test
  namespace: test-namespace
spec:
  taskRef:
    name: simple
  params:
    - name: param-1
    - name: param-2
`;
    expect(namespace).toEqual('test-namespace');
    expect(yaml.dump(payload)).toEqual(expected);
  });

  it('edit with minimum possible fields', () => {
    const taskRun = {
      apiVersion: 'tekton.dev/v1beta1',
      kind: 'TaskRun',
      metadata: {
        name: 'test',
        namespace: 'test-namespace'
      },
      spec: {
        taskRef: {
          name: 'simple'
        }
      }
    };
    const { namespace, payload } = API.generateNewTaskRunPayload({
      taskRun,
      rerun: false
    });
    const expected = `apiVersion: tekton.dev/v1beta1
kind: TaskRun
metadata:
  annotations: {}
  generateName: test-
  labels: {}
  namespace: test-namespace
spec:
  taskRef:
    name: simple
`;
    expect(namespace).toEqual('test-namespace');
    expect(yaml.dump(payload)).toEqual(expected);
  });

  it('edit with all processed fields', () => {
    const taskRun = {
      apiVersion: 'tekton.dev/v1beta1',
      kind: 'TaskRun',
      metadata: {
        annotations: {
          keya: 'valuea',
          'kubectl.kubernetes.io/last-applied-configuration':
            '{"apiVersion": "tekton.dev/v1beta1", "keya": "valuea"}'
        },
        labels: {
          key1: 'valuel',
          key2: 'value2',
          'tekton.dev/task': 'foo',
          'tekton.dev/run': 'bar'
        },
        name: 'test',
        namespace: 'test-namespace',
        uid: '111-233-33',
        resourceVersion: 'aaaa'
      },
      spec: {
        taskRef: {
          name: 'simple'
        },
        params: [{ name: 'param-1' }, { name: 'param-2' }]
      },
      status: { startTime: '0' }
    };
    const { namespace, payload } = API.generateNewTaskRunPayload({
      taskRun,
      rerun: false
    });
    const expected = `apiVersion: tekton.dev/v1beta1
kind: TaskRun
metadata:
  annotations:
    keya: valuea
  generateName: test-
  labels:
    key1: valuel
    key2: value2
  namespace: test-namespace
spec:
  taskRef:
    name: simple
  params:
    - name: param-1
    - name: param-2
`;
    expect(namespace).toEqual('test-namespace');
    expect(yaml.dump(payload)).toEqual(expected);
  });
});
