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

import { labels } from '@tektoncd/dashboard-utils';

import {
  applyStepTemplate,
  classNames,
  formatLabels,
  generateId,
  getAddFilterHandler,
  getDeleteFilterHandler,
  getErrorMessage,
  getFilters,
  getGenerateNamePrefixForRerun,
  getParams,
  getPlaceholderTaskRun,
  getStatus,
  getStatusFilter,
  getStatusFilterHandler,
  getStepDefinition,
  getStepStatus,
  getStepStatusReason,
  getTaskRunsWithPlaceholders,
  getTaskSpecFromTaskRef,
  isRunning,
  taskRunHasWarning,
  updateUnexecutedSteps
} from '.';

it('classNames', () => {
  expect(classNames('foo', 'bar')).toEqual('foo bar');
  expect(classNames('foo', null, 'bar')).toEqual('foo bar');
  expect(classNames('foo', { bar: true })).toEqual('foo bar');
  expect(classNames({ foo: true })).toEqual('foo');
  expect(classNames({ foo: false })).toEqual('');
  expect(classNames({ foo: false, bar: true })).toEqual('bar');
  expect(classNames({ foo: 1 }, { bar: false }, 'three')).toEqual('foo three');
  expect(classNames(1, 2, 3)).toEqual(''); // numbers are not valid class names
});

it('getErrorMessage falsy', () => {
  expect(getErrorMessage()).toBeUndefined();
});

it('getErrorMessage string', () => {
  const error = 'this is an error message';
  expect(getErrorMessage(error)).toEqual(error);
});

it('getErrorMessage error object', () => {
  const message = 'this is an error message';
  const error = new Error(message);
  expect(getErrorMessage(error)).toEqual(message);
});

it('getErrorMessage custom object', () => {
  const message = 'this is an error message';
  const error = { custom: message };
  expect(getErrorMessage(error)).toContain(`"custom":"${message}"`);
});

it('getStatus', () => {
  const taskRun = {
    status: {
      conditions: [
        {
          type: 'Succeeded',
          foo: 'bar'
        }
      ]
    }
  };

  const status = getStatus(taskRun);
  expect(status).toMatchObject({
    foo: 'bar'
  });
});

it('getStatus with no conditions', () => {
  const taskRun = { status: {} };
  const status = getStatus(taskRun);
  expect(status).toEqual({});
});

it('getStatus with no status', () => {
  const taskRun = {};
  const status = getStatus(taskRun);
  expect(status).toEqual({});
});

it('isRunning', () => {
  expect(isRunning('Running', 'Unknown')).toBe(true);
  expect(isRunning('PipelineRunStopping', 'Unknown')).toBe(true);
  expect(isRunning('CancelledRunningFinally', 'Unknown')).toBe(true);
  expect(isRunning('StoppedRunningFinally', 'Unknown')).toBe(true);
  expect(isRunning('?', 'Unknown')).toBe(false);
  expect(isRunning('Running', '?')).toBe(false);
});

it('generateId', () => {
  const prefix = 'prefix';
  const id = generateId(prefix);
  expect(id).toContain(prefix);
});

it('formatLabels', () => {
  const inputLabels = {
    app: 'tekton-app',
    gitOrg: 'foo',
    gitRepo: 'bar.git',
    gitServer: 'github.com',
    [labels.PIPELINE]: 'pipeline0'
  };

  const returnedLabels = formatLabels(inputLabels);

  expect(returnedLabels).toStrictEqual([
    'app: tekton-app',
    'gitOrg: foo',
    'gitRepo: bar.git',
    'gitServer: github.com',
    'tekton.dev/pipeline: pipeline0'
  ]);
});

describe('updateUnexecutedSteps', () => {
  it('no steps', () => {
    const steps = [];
    const wantUpdatedSteps = [];
    const gotUpdatedSteps = updateUnexecutedSteps(steps);
    expect(gotUpdatedSteps).toEqual(wantUpdatedSteps);
  });

  it('undefined steps', () => {
    let steps;
    let wantUpdatedSteps;
    const gotUpdatedSteps = updateUnexecutedSteps(steps);
    expect(gotUpdatedSteps).toEqual(wantUpdatedSteps);
  });

  it('no error steps', () => {
    const steps = [{ terminated: { reason: 'Completed' } }, { running: {} }];
    const wantUpdatedSteps = [...steps];
    const gotUpdatedSteps = updateUnexecutedSteps(steps);
    expect(gotUpdatedSteps).toEqual(wantUpdatedSteps);
  });

  it('error step', () => {
    const steps = [
      {
        terminated: { reason: 'Completed' }
      },
      {
        terminated: { reason: 'Error' }
      },
      {
        terminated: { reason: 'Completed' }
      }
    ];
    const wantUpdatedSteps = [
      {
        terminated: { reason: 'Completed' }
      },
      {
        terminated: { reason: 'Error' }
      },
      {}
    ];

    const gotUpdatedSteps = updateUnexecutedSteps(steps);
    expect(gotUpdatedSteps).toEqual(wantUpdatedSteps);
  });

  it('running step', () => {
    const steps = [
      {
        terminated: { reason: 'Completed' }
      },
      {
        running: {}
      },
      {
        running: {}
      }
    ];
    const wantUpdatedSteps = [
      {
        terminated: { reason: 'Completed' }
      },
      {
        running: {}
      },
      {}
    ];

    const gotUpdatedSteps = updateUnexecutedSteps(steps);
    expect(gotUpdatedSteps).toEqual(wantUpdatedSteps);
  });
});

it('getFilters', () => {
  const search = 'labelSelector=tekton.dev%2Fpipeline%3Ddemo-pipeline';
  const filters = getFilters({ search });
  expect(filters.length).toEqual(1);
  expect(filters[0]).toEqual('tekton.dev/pipeline=demo-pipeline');
});

it('getAddFilterHandler', () => {
  const url = 'someURL';
  const navigate = vi.fn();
  const location = { pathname: url, search: '?nonFilterQueryParam=someValue' };
  const handleAddFilter = getAddFilterHandler({ location, navigate });
  const labelFilters = ['foo1=bar1', 'foo2=bar2'];
  handleAddFilter(labelFilters);
  expect(navigate).toHaveBeenCalledWith(
    `${url}?nonFilterQueryParam=someValue&labelSelector=${encodeURIComponent(
      'foo1=bar1,foo2=bar2'
    )}`
  );
});

describe('getDeleteFilterHandler', () => {
  it('should redirect to unfiltered URL if no filters remain', () => {
    const search = `?labelSelector=${encodeURIComponent('foo=bar')}`;
    const url = 'someURL';
    const navigate = vi.fn();
    const location = { pathname: url, search };
    const handleDeleteFilter = getDeleteFilterHandler({
      location,
      navigate
    });
    handleDeleteFilter('foo=bar');
    expect(navigate).toHaveBeenCalledWith(url);
  });

  it('should correctly remove a filter from the URL', () => {
    const search = `?labelSelector=${encodeURIComponent(
      'foo1=bar1,foo2=bar2'
    )}`;
    const url = 'someURL';
    const navigate = vi.fn();
    const location = { pathname: url, search };
    const handleDeleteFilter = getDeleteFilterHandler({
      location,
      navigate
    });
    handleDeleteFilter('foo1=bar1');
    expect(navigate).toHaveBeenCalledWith(
      `${url}?labelSelector=${encodeURIComponent('foo2=bar2')}`
    );
  });
});

describe('getGenerateNamePrefixForRerun', () => {
  it('replaces generated suffix for rerun', () => {
    expect(getGenerateNamePrefixForRerun('some-name-r-abcde')).toEqual(
      'some-name-r-'
    );
  });

  it('adds suffix for original run', () => {
    expect(getGenerateNamePrefixForRerun('some-name')).toEqual('some-name-r-');
  });
});

describe('getParams', () => {
  it('supports v1alpha1 structure', () => {
    const fakeParams = { fake: 'params' };
    const params = getParams({ inputs: { params: fakeParams } });
    expect(params).toEqual(fakeParams);
  });

  it('supports v1beta1 structure', () => {
    const fakeParams = { fake: 'params' };
    const params = getParams({ params: fakeParams });
    expect(params).toEqual(fakeParams);
  });
});

describe('applyStepTemplate', () => {
  it('merges fields from the step with the stepTemplate according to the Kubernetes strategic merge patch rules', () => {
    const stepTemplate = {
      args: ['some_args'],
      command: ['sh'],
      env: [
        { name: 'env1', value: 'value1' },
        { name: 'env2', value: 'value2' }
      ],
      image: 'alpine',
      ports: [{ containerPort: 8888 }, { containerPort: 7777, name: 'my-port' }]
    };

    const step = {
      args: ['step_args'],
      env: [
        { name: 'env1', value: 'step_value1' },
        { name: 'env3', value: 'step_value3' }
      ],
      image: 'ubuntu',
      ports: [{ containerPort: 7777, name: 'my-step-port' }]
    };

    expect(applyStepTemplate({ step, stepTemplate })).toEqual({
      args: step.args,
      command: stepTemplate.command,
      env: [step.env[0], stepTemplate.env[1], step.env[1]],
      image: step.image,
      ports: [stepTemplate.ports[0], step.ports[0]]
    });
  });

  it('handles volumeMounts without modifying the stepTemplate', () => {
    const templateVolumeMounts = [
      {
        mountPath: '/tmp/template-mount-path',
        name: 'template-mount-name'
      }
    ];
    const stepTemplate = {
      volumeMounts: [...templateVolumeMounts]
    };

    const step1 = {
      image: 'ubuntu',
      script: 'fake_script',
      volumeMounts: [
        {
          mountPath: '/tmp/step-mount-path',
          name: 'step-mount-name'
        }
      ]
    };

    expect(applyStepTemplate({ step: step1, stepTemplate })).toEqual({
      image: 'ubuntu',
      script: 'fake_script',
      volumeMounts: [
        {
          mountPath: '/tmp/template-mount-path',
          name: 'template-mount-name'
        },
        {
          mountPath: '/tmp/step-mount-path',
          name: 'step-mount-name'
        }
      ]
    });
    expect(stepTemplate.volumeMounts).toEqual(templateVolumeMounts);
  });
});

describe('getStepDefinition', () => {
  it('handles falsy selectedStepId', () => {
    const definition = getStepDefinition({ selectedStepId: null });
    expect(definition).toBeNull();
  });

  it('handles inline taskSpec', () => {
    const selectedStepId = 'a-step';
    const step = { name: selectedStepId };
    const taskRun = {
      spec: {
        taskSpec: {
          steps: [step]
        }
      }
    };
    const definition = getStepDefinition({ selectedStepId, taskRun });
    expect(definition).toEqual(step);
  });

  it('handles task ref', () => {
    const selectedStepId = 'a-step';
    const step = { name: selectedStepId };
    const task = {
      spec: {
        steps: [step]
      }
    };
    const definition = getStepDefinition({ selectedStepId, task, taskRun: {} });
    expect(definition).toEqual(step);
  });

  it('handles unnamed steps', () => {
    const selectedStepId = 'unnamed-1';
    const step = { name: '' };
    const task = {
      spec: {
        steps: [{ name: 'a-step' }, step]
      }
    };
    const taskRun = {
      status: {
        steps: [{ name: 'a-step' }, { name: 'unnamed-1' }]
      }
    };
    const definition = getStepDefinition({ selectedStepId, task, taskRun });
    expect(definition).toEqual(step);
  });

  it('handles unnamed steps when steps not yet available', () => {
    const selectedStepId = 'unnamed-1';
    const step = { name: '' };
    const task = {
      spec: {
        steps: [{ name: 'a-step' }, step]
      }
    };
    const taskRun = {
      status: {}
    };
    const definition = getStepDefinition({ selectedStepId, task, taskRun });
    expect(definition).toBeUndefined();
  });

  it('handles deleted Task spec', () => {
    const selectedStepId = 'unnamed-1';
    const task = {};
    const taskRun = {
      status: {
        steps: [{ name: 'a-step' }, { name: 'unnamed-1' }]
      }
    };
    const definition = getStepDefinition({ selectedStepId, task, taskRun });
    expect(definition).toBeUndefined();
  });

  it('handles empty TaskRun', () => {
    const selectedStepId = 'unnamed-1';
    const step = { name: '' };
    const task = {
      spec: {
        steps: [{ name: 'a-step' }, step]
      }
    };
    const taskRun = {};
    const definition = getStepDefinition({ selectedStepId, task, taskRun });
    expect(definition).toBeNull();
  });

  it('handles TaskRun with spec in status.taskSpec', () => {
    const selectedStepId = 'a-step';
    const step = { name: selectedStepId };
    const task = {};
    const taskRun = {
      spec: {
        taskRef: {
          name: 'dummy-task'
        }
      },
      status: {
        taskSpec: {
          steps: [step]
        }
      }
    };
    const definition = getStepDefinition({ selectedStepId, task, taskRun });
    expect(definition).toEqual(step);
  });
});

it('getStepStatus', () => {
  const selectedStepId = 'a-step';
  const step = { name: selectedStepId };
  const taskRun = {
    status: {
      steps: [{ name: 'another-step' }, step]
    }
  };
  const stepStatus = getStepStatus({ selectedStepId, taskRun });
  expect(stepStatus).toEqual(step);
});

it('getStepStatusReason', () => {
  const reason = 'fake-reason';
  expect(getStepStatusReason({ terminated: { reason } })).toEqual({
    reason,
    status: 'terminated'
  });
  expect(getStepStatusReason({ running: { reason } })).toEqual({
    reason: undefined,
    status: 'running'
  });
  expect(getStepStatusReason({ waiting: { reason } })).toEqual({
    reason: undefined,
    status: 'waiting'
  });
  expect(getStepStatusReason({ unknown: { reason } })).toEqual({
    reason: undefined,
    status: undefined
  });
  expect(getStepStatusReason()).toEqual({});
});

describe('getStatusFilter', () => {
  it('should return null for an unsupported status', () => {
    const search = '?status=invalidStatus';
    const statusFilter = getStatusFilter({ search });
    expect(statusFilter).toBeNull();
  });

  it('should return a supported status', () => {
    const status = 'cancelled';
    const search = `?status=${status}`;
    const statusFilter = getStatusFilter({ search });
    expect(statusFilter).toEqual(status);
  });

  it('should correctly remove a filter from the URL', () => {
    const search = `?labelSelector=${encodeURIComponent(
      'foo1=bar1,foo2=bar2'
    )}`;
    const url = 'someURL';
    const navigate = vi.fn();
    const location = { pathname: url, search };
    const handleDeleteFilter = getDeleteFilterHandler({
      location,
      navigate
    });
    handleDeleteFilter('foo1=bar1');
    expect(navigate).toHaveBeenCalledWith(
      `${url}?labelSelector=${encodeURIComponent('foo2=bar2')}`
    );
  });
});

describe('getStatusFilterHandler', () => {
  it('should redirect to unfiltered URL if no status specified', () => {
    const search = '?nonFilterQueryParam=someValue&status=cancelled';
    const url = 'someURL';
    const navigate = vi.fn();
    const location = { pathname: url, search };
    const setStatusFilter = getStatusFilterHandler({
      location,
      navigate
    });
    setStatusFilter('');
    expect(navigate).toHaveBeenCalledWith(
      `${url}?nonFilterQueryParam=someValue`
    );
  });

  it('should set a valid status filter in the URL', () => {
    const url = 'someURL';
    const navigate = vi.fn();
    const location = {
      pathname: url,
      search: '?nonFilterQueryParam=someValue'
    };
    const setStatusFilter = getStatusFilterHandler({
      location,
      navigate
    });
    const statusFilter = 'cancelled';
    setStatusFilter(statusFilter);
    expect(navigate).toHaveBeenCalledWith(
      `${url}?nonFilterQueryParam=someValue&status=${statusFilter}`
    );
  });

  it('should update the status filter in the URL', () => {
    const url = 'someURL';
    const navigate = vi.fn();
    const location = { pathname: url, search: '?status=cancelled' };
    const setStatusFilter = getStatusFilterHandler({
      location,
      navigate
    });
    const statusFilter = 'completed';
    setStatusFilter(statusFilter);
    expect(navigate).toHaveBeenCalledWith(`${url}?status=${statusFilter}`);
  });
});

describe('getTaskSpecFromTaskRef', () => {
  it('handles missing taskRef', () => {
    const taskSpec = getTaskSpecFromTaskRef({ pipelineTask: {} });
    expect(taskSpec).toEqual({});
  });

  it('handles missing definitions', () => {
    const taskSpec = getTaskSpecFromTaskRef({
      pipelineTask: { taskRef: { name: 'someTaskRef' } }
    });
    expect(taskSpec).toEqual({});
  });

  it('handles Tasks', () => {
    const name = 'fakeTaskName';
    const task = { metadata: { name }, spec: { fake: 'taskSpec' } };
    const taskSpec = getTaskSpecFromTaskRef({
      pipelineTask: { taskRef: { kind: 'Task', name } },
      tasks: [task]
    });
    expect(taskSpec).toEqual(task.spec);
  });
});

describe('getPlaceholderTaskRun', () => {
  it('handles inline taskSpec', () => {
    const pipelineTask = {
      name: 'somePipelineTask',
      taskSpec: {
        fake: 'taskSpec'
      }
    };
    const taskRun = getPlaceholderTaskRun({ pipelineTask });
    expect(taskRun.spec.taskSpec).toEqual(pipelineTask.taskSpec);
    expect(taskRun.status.steps).toEqual([]);
    expect(taskRun.metadata.labels[labels.PIPELINE_TASK]).toEqual(
      pipelineTask.name
    );
  });

  it('handles steps', () => {
    const step1Name = 'step1Name';
    const step2Name = 'step2Name';
    const pipelineTask = {
      name: 'somePipelineTask',
      taskSpec: {
        fake: 'taskSpec',
        steps: [
          { name: step1Name, other: 'dummyValue' },
          { name: step2Name, other: 'dummyValue' }
        ]
      }
    };
    const taskRun = getPlaceholderTaskRun({ pipelineTask });
    expect(taskRun.spec.taskSpec).toEqual(pipelineTask.taskSpec);
    expect(taskRun.status.steps).toEqual([
      { name: step1Name },
      { name: step2Name }
    ]);
  });

  it('handles taskRef', () => {
    const name = 'someTaskName';
    const task = {
      metadata: {
        name
      },
      spec: {
        fake: 'spec'
      }
    };
    const pipelineTask = {
      name: 'somePipelineTask',
      taskRef: {
        name
      }
    };
    const taskRun = getPlaceholderTaskRun({ pipelineTask, tasks: [task] });
    expect(taskRun.spec.taskSpec).toEqual(task.spec);
    expect(taskRun.metadata.labels[labels.PIPELINE_TASK]).toEqual(
      pipelineTask.name
    );
  });
});

describe('getTaskRunsWithPlaceholders', () => {
  it('handles pipeline', () => {
    const finallyTaskName = 'someFinallyTaskName';
    const pipelineTaskName = 'somePipelineTaskName';
    const pipeline = {
      spec: {
        tasks: [
          {
            name: pipelineTaskName
          }
        ],
        finally: [
          {
            name: finallyTaskName
          }
        ]
      }
    };
    const taskRun = {
      metadata: {
        labels: {
          [labels.PIPELINE_TASK]: pipelineTaskName
        },
        name: 'someTaskRun'
      }
    };
    const finallyTaskRun = {
      metadata: {
        labels: {
          [labels.PIPELINE_TASK]: finallyTaskName
        },
        name: 'someFinallyTaskRun'
      }
    };
    const taskRuns = [
      finallyTaskRun,
      { metadata: { labels: {}, name: 'junk' } },
      taskRun
    ];
    const runs = getTaskRunsWithPlaceholders({ pipeline, taskRuns });
    expect(runs).toEqual([taskRun, finallyTaskRun]);
  });

  it('handles inline spec', () => {
    const finallyTaskName = 'someFinallyTaskName';
    const pipelineTaskName = 'somePipelineTaskName';
    const pipelineRun = {
      spec: {
        pipelineSpec: {
          tasks: [
            {
              name: pipelineTaskName
            }
          ],
          finally: [
            {
              name: finallyTaskName
            }
          ]
        }
      }
    };
    const taskRun = {
      metadata: {
        labels: {
          [labels.PIPELINE_TASK]: pipelineTaskName
        },
        name: 'someTaskRun'
      }
    };
    const finallyTaskRun = {
      metadata: {
        labels: {
          [labels.PIPELINE_TASK]: finallyTaskName
        },
        name: 'someFinallyTaskRun'
      }
    };
    const taskRuns = [
      finallyTaskRun,
      { metadata: { labels: {}, name: 'junk' } },
      taskRun
    ];
    const runs = getTaskRunsWithPlaceholders({ pipelineRun, taskRuns });
    expect(runs).toEqual([taskRun, finallyTaskRun]);
  });

  it('handles missing TaskRuns', () => {
    const finallyTaskName = 'someFinallyTaskName';
    const pipelineTaskName = 'somePipelineTaskName';
    const pipeline = {
      spec: {
        tasks: [
          {
            name: pipelineTaskName
          }
        ],
        finally: [
          {
            name: finallyTaskName
          }
        ]
      }
    };
    const [taskRun, finallyTaskRun] = getTaskRunsWithPlaceholders({
      pipeline,
      taskRuns: []
    });
    expect(taskRun.metadata.labels[labels.PIPELINE_TASK]).toEqual(
      pipelineTaskName
    );
    expect(finallyTaskRun.metadata.labels[labels.PIPELINE_TASK]).toEqual(
      finallyTaskName
    );
  });

  it('handles PipelineRuns with spec in status.pipelineSpec', () => {
    const finallyTaskName = 'aFinallyTaskName';
    const pipelineTaskName = 'aPipelineTaskName';

    const pipelineRun = {
      spec: {
        pipelineRef: {
          name: 'dummy-pipeline'
        }
      },
      status: {
        pipelineSpec: {
          tasks: [
            {
              name: pipelineTaskName
            }
          ],
          finally: [
            {
              name: finallyTaskName
            }
          ]
        }
      }
    };
    const taskRun = {
      metadata: {
        labels: {
          [labels.PIPELINE_TASK]: pipelineTaskName
        },
        name: pipelineTaskName
      }
    };
    const finallyTaskRun = {
      metadata: {
        labels: {
          [labels.PIPELINE_TASK]: finallyTaskName
        },
        name: finallyTaskName
      }
    };
    const taskRuns = [
      finallyTaskRun,
      { metadata: { labels: {}, name: 'junk' } },
      taskRun
    ];
    const runs = getTaskRunsWithPlaceholders({ pipelineRun, taskRuns });
    expect(runs).toEqual([taskRun, finallyTaskRun]);
  });

  it('handles displayName in childReferences', () => {
    const displayName = 'aDisplayName';
    const pipelineTaskName = 'aPipelineTaskName';
    const taskRunName = 'aTaskRunName';
    const matrixPipelineTaskName = 'aMatrixPipelineTaskName';
    const matrixTaskRunName1 = 'matrixTaskRun1';
    const matrixTaskRunName2 = 'matrixTaskRun2';
    const matrixTaskRunDisplayName1 = 'matrixRunDisplayName1';
    const matrixTaskRunDisplayName2 = 'matrixRunDisplayName2';

    const pipelineRun = {
      spec: {
        pipelineRef: {
          name: 'dummy-pipeline'
        }
      },
      status: {
        childReferences: [
          {
            displayName: matrixTaskRunDisplayName2,
            name: matrixTaskRunName2,
            pipelineTaskName: matrixPipelineTaskName
          },
          {
            displayName,
            name: taskRunName,
            pipelineTaskName
          },
          {
            displayName: matrixTaskRunDisplayName1,
            name: matrixTaskRunName1,
            pipelineTaskName: matrixPipelineTaskName
          }
        ],
        pipelineSpec: {
          tasks: [
            {
              name: pipelineTaskName
            },
            {
              name: matrixPipelineTaskName
            }
          ]
        }
      }
    };
    const taskRun = {
      metadata: {
        labels: {
          [labels.PIPELINE_TASK]: pipelineTaskName
        },
        name: taskRunName
      }
    };
    const matrixTaskRun1 = {
      metadata: {
        labels: {
          [labels.PIPELINE_TASK]: matrixPipelineTaskName
        },
        name: matrixTaskRunName1
      }
    };
    const matrixTaskRun2 = {
      metadata: {
        labels: {
          [labels.PIPELINE_TASK]: matrixPipelineTaskName
        },
        name: matrixTaskRunName2
      }
    };

    const runs = getTaskRunsWithPlaceholders({
      pipelineRun,
      taskRuns: [matrixTaskRun2, taskRun, matrixTaskRun1]
    });
    // sorts matrix TaskRuns by display name
    expect(runs[0].metadata.labels[labels.DASHBOARD_DISPLAY_NAME]).toEqual(
      displayName
    );
    expect(runs[1].metadata.labels[labels.DASHBOARD_DISPLAY_NAME]).toEqual(
      matrixTaskRunDisplayName1
    );
    expect(runs[2].metadata.labels[labels.DASHBOARD_DISPLAY_NAME]).toEqual(
      matrixTaskRunDisplayName2
    );
  });
});

describe('taskRunHasWarning', () => {
  it('should return false for a TaskRun that has not completed', () => {
    expect(
      taskRunHasWarning({
        status: {
          conditions: [
            { type: 'Succeeded', reason: 'Running', status: 'Unknown' }
          ]
        }
      })
    ).toBe(false);
  });

  it('should return false for a TaskRun with steps that all completed with exit code 0', () => {
    expect(
      taskRunHasWarning({
        status: {
          conditions: [
            { type: 'Succeeded', reason: 'Succeeded', status: 'True' }
          ],
          steps: [{ terminated: { exitCode: 0, reason: 'Completed' } }]
        }
      })
    ).toBe(false);
  });

  it('should return true for a successful TaskRun with at least one step that completed with non-zero exit code', () => {
    expect(
      taskRunHasWarning({
        status: {
          conditions: [
            { type: 'Succeeded', reason: 'Succeeded', status: 'True' }
          ],
          steps: [
            { terminated: { exitCode: 1, reason: 'Completed' } },
            { terminated: { exitCode: 0, reason: 'Completed' } }
          ]
        }
      })
    ).toBe(true);
  });
});
