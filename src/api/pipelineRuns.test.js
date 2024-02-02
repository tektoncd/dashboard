/*
Copyright 2019-2024 The Tekton Authors
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

import * as API from './pipelineRuns';
import * as utils from './utils';
import * as comms from './comms';
import { server } from '../../config_frontend/msw';
import { generateNewPipelineRunPayload } from './pipelineRuns';

describe('cancelPipelineRun', () => {
  it('default', () => {
    const name = 'foo';
    const namespace = 'foospace';
    vi.spyOn(comms, 'patch').mockImplementation((uri, payload) => {
      expect(payload).toEqual([
        { op: 'replace', path: '/spec/status', value: 'Cancelled' }
      ]);
    });
    return API.cancelPipelineRun({ name, namespace });
  });

  it('with non-default status', () => {
    const name = 'foo';
    const namespace = 'foospace';
    const status = 'StoppedRunFinally';
    vi.spyOn(comms, 'patch').mockImplementation((uri, payload) => {
      expect(payload).toEqual([
        { op: 'replace', path: '/spec/status', value: status }
      ]);
    });
    return API.cancelPipelineRun({ name, namespace, status });
  });
});

describe('createPipelineRun', () => {
  it('basic', () => {
    const mockDateNow = vi
      .spyOn(Date, 'now')
      .mockImplementation(() => 'fake-timestamp');
    const pipelineName = 'fake-pipelineName';
    const params = { 'fake-param-name': 'fake-param-value' };
    const serviceAccount = 'fake-serviceAccount';
    const timeout = 'fake-timeout';
    const payload = {
      pipelineName,
      params,
      serviceAccount,
      timeoutsPipeline: timeout
    };
    const data = {
      apiVersion: 'tekton.dev/v1',
      kind: 'PipelineRun',
      metadata: {
        name: `${pipelineName}-run-${Date.now()}`
      },
      spec: {
        pipelineRef: {
          name: pipelineName
        },
        params: Object.keys(params).map(name => ({
          name,
          value: params[name]
        })),
        taskRunTemplate: {
          serviceAccountName: serviceAccount
        },
        timeouts: {
          pipeline: timeout
        }
      }
    };

    vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
      Promise.resolve(body)
    );

    return API.createPipelineRun(payload).then(() => {
      expect(comms.post).toHaveBeenCalled();
      expect(comms.post.mock.lastCall[1]).toMatchObject(data);
      mockDateNow.mockRestore();
    });
  });

  it('with nodeSelector', () => {
    const mockDateNow = vi
      .spyOn(Date, 'now')
      .mockImplementation(() => 'fake-timestamp');
    const pipelineName = 'fake-pipelineName';
    const params = { 'fake-param-name': 'fake-param-value' };
    const serviceAccount = 'fake-serviceAccount';
    const timeout = 'fake-timeout';
    const payload = {
      pipelineName,
      params,
      serviceAccount,
      timeoutsPipeline: timeout,
      nodeSelector: {
        disk: 'ssd'
      }
    };
    const data = {
      apiVersion: 'tekton.dev/v1',
      kind: 'PipelineRun',
      metadata: {
        name: `${pipelineName}-run-${Date.now()}`
      },
      spec: {
        pipelineRef: {
          name: pipelineName
        },
        params: Object.keys(params).map(name => ({
          name,
          value: params[name]
        })),
        podTemplate: {
          nodeSelector: {
            disk: 'ssd'
          }
        },
        taskRunTemplate: {
          serviceAccountName: serviceAccount
        },
        timeouts: {
          pipeline: timeout
        }
      }
    };
    vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
      Promise.resolve(body)
    );

    return API.createPipelineRun(payload).then(() => {
      expect(comms.post).toHaveBeenCalled();
      expect(comms.post.mock.lastCall[1]).toMatchObject(data);
      mockDateNow.mockRestore();
    });
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
  vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
    Promise.resolve(body)
  );

  return API.createPipelineRunRaw({
    namespace: 'test-namespace',
    payload: pipelineRunRaw
  }).then(() => {
    expect(comms.post).toHaveBeenCalled();
    expect(comms.post.mock.lastCall[1]).toEqual(pipelineRunRaw);
  });
});

it('deletePipelineRun', () => {
  const name = 'foo';
  const data = { fake: 'pipelineRun' };
  server.use(
    http.delete(new RegExp(`/${name}$`), () => HttpResponse.json(data))
  );
  return API.deletePipelineRun({ name }).then(pipelineRun => {
    expect(pipelineRun).toEqual(data);
  });
});

it('getPipelineRun', () => {
  const name = 'foo';
  const data = { fake: 'pipelineRun' };
  server.use(http.get(new RegExp(`/${name}$`), () => HttpResponse.json(data)));
  return API.getPipelineRun({ name }).then(pipelineRun => {
    expect(pipelineRun).toEqual(data);
  });
});

it('getPipelineRuns', () => {
  const data = {
    items: 'pipelineRuns'
  };
  server.use(http.get(/\/pipelineruns\//, () => HttpResponse.json(data)));
  return API.getPipelineRuns({ filters: [] }).then(pipelineRuns => {
    expect(pipelineRuns).toEqual(data);
  });
});

it('getPipelineRuns With Query Params', () => {
  const pipelineName = 'pipelineName';
  const data = {
    items: 'pipelineRuns'
  };
  server.use(http.get(/\/pipelineruns\//, () => HttpResponse.json(data)));
  return API.getPipelineRuns({ pipelineName, filters: [] }).then(
    pipelineRuns => {
      expect(pipelineRuns).toEqual(data);
    }
  );
});

it('usePipelineRuns', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  vi.spyOn(utils, 'useCollection').mockImplementation(() => query);
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
  vi.spyOn(utils, 'useResource').mockImplementation(() => query);
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
  vi.spyOn(comms, 'post').mockImplementation((uri, body) =>
    Promise.resolve(body)
  );

  const rerun = {
    apiVersion: 'tekton.dev/v1',
    kind: 'PipelineRun',
    metadata: {
      annotations: {},
      generateName: `${originalPipelineRun.metadata.name}-r-`,
      labels: {
        'dashboard.tekton.dev/rerunOf': originalPipelineRun.metadata.name
      }
    },
    spec: {}
  };
  return API.rerunPipelineRun(originalPipelineRun).then(() => {
    expect(comms.post).toHaveBeenCalled();
    expect(comms.post.mock.lastCall[1]).toEqual(rerun);
  });
});

it('startPipelineRun', () => {
  const name = 'foo';
  const namespace = 'foospace';
  const payload = [{ op: 'remove', path: '/spec/status' }];
  vi.spyOn(comms, 'patch').mockImplementation((uri, body) =>
    Promise.resolve(body)
  );
  return API.startPipelineRun({ metadata: { name, namespace } }).then(() => {
    expect(comms.patch).toHaveBeenCalled();
    expect(comms.patch.mock.lastCall[1]).toEqual(payload);
  });
});

describe('generateNewPipelineRunPayload', () => {
  it('rerun with minimum possible fields', () => {
    const pipelineRun = {
      apiVersion: 'tekton.dev/v1beta1',
      kind: 'PipelineRun',
      metadata: {
        name: 'test',
        namespace: 'test-namespace'
      },
      spec: {
        pipelineRef: {
          name: 'simple'
        }
      }
    };
    const { namespace, payload } = generateNewPipelineRunPayload({
      pipelineRun,
      rerun: true
    });
    const expected = `apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  annotations: {}
  generateName: test-r-
  labels:
    dashboard.tekton.dev/rerunOf: test
  namespace: test-namespace
spec:
  pipelineRef:
    name: simple
`;
    expect(namespace).toEqual('test-namespace');
    expect(yaml.dump(payload)).toEqual(expected);
  });

  it('rerun with all processed fields', () => {
    const pipelineRun = {
      apiVersion: 'tekton.dev/v1beta1',
      kind: 'PipelineRun',
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
          'tekton.dev/pipeline': 'foo'
        },
        uid: '111-233-33',
        resourceVersion: 'aaaa'
      },
      spec: {
        pipelineRef: {
          name: 'simple'
        },
        params: [{ name: 'param-1' }, { name: 'param-2' }]
      },
      status: { startTime: '0' }
    };
    const { namespace, payload } = generateNewPipelineRunPayload({
      pipelineRun,
      rerun: true
    });
    const expected = `apiVersion: tekton.dev/v1beta1
kind: PipelineRun
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
  pipelineRef:
    name: simple
  params:
    - name: param-1
    - name: param-2
`;
    expect(namespace).toEqual('test-namespace');
    expect(yaml.dump(payload)).toEqual(expected);
  });

  it('edit with minimum possible fields', () => {
    const pipelineRun = {
      apiVersion: 'tekton.dev/v1beta1',
      kind: 'PipelineRun',
      metadata: {
        name: 'test',
        namespace: 'test-namespace'
      },
      spec: {
        pipelineRef: {
          name: 'simple'
        }
      }
    };
    const { namespace, payload } = generateNewPipelineRunPayload({
      pipelineRun,
      rerun: false
    });
    const expected = `apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  annotations: {}
  generateName: test-
  labels: {}
  namespace: test-namespace
spec:
  pipelineRef:
    name: simple
`;
    expect(namespace).toEqual('test-namespace');
    expect(yaml.dump(payload)).toEqual(expected);
  });

  it('edit with all processed fields', () => {
    const pipelineRun = {
      apiVersion: 'tekton.dev/v1beta1',
      kind: 'PipelineRun',
      metadata: {
        annotations: {
          keya: 'valuea',
          'kubectl.kubernetes.io/last-applied-configuration':
            '{"apiVersion": "tekton.dev/v1beta1", "keya": "valuea"}'
        },
        labels: {
          key1: 'valuel',
          key2: 'value2',
          'tekton.dev/pipeline': 'foo',
          'tekton.dev/run': 'bar'
        },
        name: 'test',
        namespace: 'test-namespace',
        uid: '111-233-33',
        resourceVersion: 'aaaa'
      },
      spec: {
        pipelineRef: {
          name: 'simple'
        },
        params: [{ name: 'param-1' }, { name: 'param-2' }]
      },
      status: { startTime: '0' }
    };
    const { namespace, payload } = generateNewPipelineRunPayload({
      pipelineRun,
      rerun: false
    });
    const expected = `apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  annotations:
    keya: valuea
  generateName: test-
  labels:
    key1: valuel
    key2: value2
  namespace: test-namespace
spec:
  pipelineRef:
    name: simple
  params:
    - name: param-1
    - name: param-2
`;
    expect(namespace).toEqual('test-namespace');
    expect(yaml.dump(payload)).toEqual(expected);
  });
});
