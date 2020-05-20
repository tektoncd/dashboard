/*
Copyright 2019-2020 The Tekton Authors
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

import {
  formatLabels,
  generateId,
  getAddFilterHandler,
  getDeleteFilterHandler,
  getErrorMessage,
  getFilters,
  getParams,
  getResources,
  getStatus,
  getTitle,
  isRunning,
  reorderSteps,
  selectedTask,
  selectedTaskRun,
  sortStepsByTimestamp,
  stepsStatus,
  taskRunStep,
  updateUnexecutedSteps
} from '.';

it('taskRunSteps with no taskRun', () => {
  const taskRun = null;
  const step = taskRunStep('selected run', taskRun);
  expect(step).toEqual({});
});

it('taskRunStep with no taskRun', () => {
  const taskRun = null;
  const step = taskRunStep('selected run', taskRun);
  expect(step).toEqual({});
});

it('taskRunStep with no steps', () => {
  const taskRun = {};
  const step = taskRunStep('selected run', taskRun);
  expect(step).toEqual({});
});

it('taskRunStep with no steps', () => {
  const stepName = 'testName';
  const id = 'id';
  const targetStep = { id, stepName };
  const taskRun = { steps: [targetStep] };
  const step = taskRunStep(id, taskRun);
  expect(step.stepName).toEqual(stepName);
});

it('taskRunStep does not contain selected step', () => {
  const stepName = 'testName';
  const id = 'id';
  const targetStep = { id, stepName };
  const taskRun = { steps: [targetStep] };
  const step = taskRunStep('wrong id', taskRun);
  expect(step).toEqual({});
});

it('taskRunStep with step finds step', () => {
  const stepName = 'testName';
  const id = 'id';
  const targetStep = { id, stepName };
  const taskRun = { steps: [targetStep] };
  const step = taskRunStep(id, taskRun);
  expect(step.stepName).toEqual(stepName);
});

describe('selectedTask', () => {
  it('should return undefined if the task is not found', () => {
    const taskName = 'testName';
    const foundTask = selectedTask(taskName, []);
    expect(foundTask).toEqual(undefined);
  });

  it('should return the selected task if found', () => {
    const taskName = 'testName';
    const expectedTask = { metadata: { name: taskName } };
    const foundTask = selectedTask(taskName, [expectedTask]);
    expect(foundTask.metadata.name).toEqual(taskName);
  });

  it('should return an empty object if tasks is falsy', () => {
    const taskName = 'testName';
    const tasks = null;
    const foundTask = selectedTask(taskName, tasks);
    expect(foundTask).toEqual({});
  });
});

describe('selectedTaskRun', () => {
  it('should return undefined if the taskRun is not found', () => {
    const taskRunName = 'testName';
    const foundTaskRun = selectedTaskRun(taskRunName, undefined);
    expect(foundTaskRun).toEqual(undefined);
  });

  it('should return the selected taskRun if found', () => {
    const taskRunName = 'testName';
    const expectedTaskRun = { metadata: { name: taskRunName } };
    const foundTaskRun = selectedTask(taskRunName, [expectedTaskRun]);
    expect(foundTaskRun.metadata.name).toEqual(taskRunName);
  });
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
  expect(isRunning('?', 'Unknown')).toBe(false);
  expect(isRunning('Running', '?')).toBe(false);
});

it('stepsStatus step is waiting', () => {
  const stepName = 'testStep';
  const taskSteps = [{ name: stepName, image: 'test' }];
  const taskRunStepsStatus = [{ name: stepName, waiting: {} }];
  const steps = stepsStatus(taskSteps, taskRunStepsStatus);
  const returnedStep = steps[0];
  expect(returnedStep.status).toEqual('waiting');
});

it('stepsStatus init error', () => {
  const stepName = 'git-source';
  const taskRunStepsStatus = [{ name: stepName, terminated: { exitCode: 1 } }];
  const steps = stepsStatus([], taskRunStepsStatus);
  const returnedStep = steps[0];
  expect(returnedStep.status).toEqual('terminated');
});

it('stepsStatus no status', () => {
  const taskSteps = [];
  const taskRunStepsStatus = undefined;
  const steps = stepsStatus(taskSteps, taskRunStepsStatus);
  expect(steps).toEqual([]);
});

it('stepsStatus step is running', () => {
  const stepName = 'testStep';
  const taskSteps = [{ name: stepName, image: 'test' }];
  const taskRunStepsStatus = [
    {
      name: stepName,
      running: { startedAt: '2019' }
    }
  ];
  const steps = stepsStatus(taskSteps, taskRunStepsStatus);
  const returnedStep = steps[0];
  expect(returnedStep.status).toEqual('running');
  expect(returnedStep.stepName).toEqual(stepName);
});

it('stepsStatus step is completed', () => {
  const reason = 'completed';
  const stepName = 'testStep';
  const taskSteps = [{ name: stepName, image: 'test' }];
  const taskRunStepsStatus = [
    {
      name: stepName,
      terminated: {
        exitCode: 0,
        reason,
        startedAt: '2019',
        finishedAt: '2019',
        containerID: 'containerd://testid'
      }
    }
  ];
  const steps = stepsStatus(taskSteps, taskRunStepsStatus);
  const returnedStep = steps[0];
  expect(returnedStep.status).toEqual('terminated');
  expect(returnedStep.stepName).toEqual(stepName);
  expect(returnedStep.reason).toEqual(reason);
});

it('stepsStatus no steps', () => {
  const taskSteps = [];
  const taskRunStepsStatus = [];
  const steps = stepsStatus(taskSteps, taskRunStepsStatus);
  expect(steps).toEqual([]);
});

it('stepsStatus step is terminated with error', () => {
  const reason = 'Error';
  const stepName = 'testStep';
  const taskSteps = [{ name: stepName, image: 'test' }];
  const taskRunStepsStatus = [
    {
      name: stepName,
      terminated: {
        exitCode: 1,
        reason,
        startedAt: '2019',
        finishedAt: '2019',
        containerID: 'containerd://testid'
      }
    }
  ];
  const steps = stepsStatus(taskSteps, taskRunStepsStatus);
  const returnedStep = steps[0];
  expect(returnedStep.status).toEqual('terminated');
  expect(returnedStep.stepName).toEqual(stepName);
  expect(returnedStep.reason).toEqual(reason);
});

describe('reorderSteps', () => {
  it('returns empty array for undefined unorderedSteps', () => {
    const unorderedSteps = undefined;
    const orderedSteps = [{ name: 'a' }];
    const want = [];
    const got = reorderSteps(unorderedSteps, orderedSteps);
    expect(got).toEqual(want);
  });

  it('returns empty array for undefined ordered', () => {
    const unorderedSteps = [{ name: 'a' }];
    const orderedSteps = undefined;
    const want = [];
    const got = reorderSteps(unorderedSteps, orderedSteps);
    expect(got).toEqual(want);
  });

  it('works on empty steps', () => {
    const unorderedSteps = [];
    const orderedSteps = [];
    const want = [];
    const got = reorderSteps(unorderedSteps, orderedSteps);
    expect(got).toEqual(want);
  });

  it('works on ordered steps', () => {
    const unorderedSteps = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
    const orderedSteps = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
    const want = [...unorderedSteps];
    const got = reorderSteps(unorderedSteps, orderedSteps);
    expect(got).toEqual(want);
  });

  it('properly reorders unnamed steps', () => {
    const unorderedSteps = [
      { name: 'unnamed-1' },
      { name: 'unnamed-2' },
      { name: 'unnamed-0' }
    ];
    const orderedSteps = [{ name: '' }, { name: '' }, { name: '' }];
    const want = [
      { name: 'unnamed-0' },
      { name: 'unnamed-1' },
      { name: 'unnamed-2' }
    ];
    const got = reorderSteps(unorderedSteps, orderedSteps);
    expect(got).toEqual(want);
  });

  it('properly reorders unnamed and named steps', () => {
    const unorderedSteps = [
      { name: 'c' },
      { name: 'unnamed-4' },
      { name: 'a' },
      { name: 'unnamed-0' },
      { name: 'b' },
      { name: 'unnamed-5' }
    ];
    const orderedSteps = [
      { name: '' },
      { name: 'a' },
      { name: 'b' },
      { name: 'c' },
      { name: '' },
      { name: '' }
    ];
    const want = [
      { name: 'unnamed-0' },
      { name: 'a' },
      { name: 'b' },
      { name: 'c' },
      { name: 'unnamed-4' },
      { name: 'unnamed-5' }
    ];
    const got = reorderSteps(unorderedSteps, orderedSteps);
    expect(got).toEqual(want);
  });

  it('handles pipeline resource init steps and unnamed steps', () => {
    const unorderedSteps = [{ name: 'some-init-step' }, { name: 'unnamed-1' }];
    const orderedSteps = [{ name: '' }];
    const want = [{ name: 'unnamed-1' }];
    const got = reorderSteps(unorderedSteps, orderedSteps);
    expect(got).toEqual(want);
  });
});

it('generateId', () => {
  const prefix = 'prefix';
  const id = generateId(prefix);
  expect(id).toContain(prefix);
});

it('formatLabels', () => {
  const labels = {
    app: 'tekton-app',
    gitOrg: 'foo',
    gitRepo: 'bar.git',
    gitServer: 'github.com',
    'tekton.dev/pipeline': 'pipeline0'
  };

  const returnedLabels = formatLabels(labels);

  expect(returnedLabels).toStrictEqual([
    'app: tekton-app',
    'gitOrg: foo',
    'gitRepo: bar.git',
    'gitServer: github.com',
    'tekton.dev/pipeline: pipeline0'
  ]);
});

it('sortStepsByTimestamp preserves order if no timestamps present', () => {
  const steps = ['t', 'e', 's', 't'];
  const want = ['t', 'e', 's', 't'];
  const got = sortStepsByTimestamp(steps);
  expect(got).toEqual(want);
});

it('sortStepsByTimestamp sorts by finishedAt', () => {
  const step1 = {
    id: 'step1',
    stepStatus: {
      terminated: {
        finishedAt: '2020-01-01T15:30:00Z'
      }
    }
  };
  const step2 = {
    id: 'step2',
    stepStatus: {
      terminated: {
        finishedAt: '2020-01-01T15:25:00Z'
      }
    }
  };
  const step3 = {
    id: 'step3',
    stepStatus: {
      terminated: {
        finishedAt: '2020-01-01T15:35:00Z'
      }
    }
  };
  const steps = [step1, step2, step3];
  const want = [step2, step1, step3];
  const got = sortStepsByTimestamp(steps);
  expect(got).toEqual(want);
});

it('sortStepsByTimestamp sorts by startedAt in a tie', () => {
  const step1 = {
    id: 'step1',
    stepStatus: {
      terminated: {
        finishedAt: '2020-01-01T15:30:00Z',
        startedAt: '2020-01-01T15:25:00Z'
      }
    }
  };
  const step2 = {
    id: 'step2',
    stepStatus: {
      terminated: {
        finishedAt: '2020-01-01T15:25:00Z',
        startedAt: '2020-01-01T15:20:00Z'
      }
    }
  };
  const step3 = {
    id: 'step3',
    stepStatus: {
      terminated: {
        finishedAt: '2020-01-01T15:30:00Z',
        startedAt: '2020-01-01T15:30:00Z'
      }
    }
  };
  const steps = [step1, step2, step3];
  const want = [step2, step1, step3];
  const got = sortStepsByTimestamp(steps);
  expect(got).toEqual(want);
});

it('sortStepsByTimestamp preserves order if invalid startedAt timestamp present', () => {
  const step1 = {
    id: 'step1',
    stepStatus: {
      terminated: {
        finishedAt: '2020-01-01T15:30:00Z',
        startedAt: '2020-01-01T15:25:00Z'
      }
    }
  };
  const step2 = {
    id: 'step2',
    stepStatus: {
      terminated: {
        finishedAt: '2020-01-01T15:30:00Z',
        startedAt: 'NOTATIMESTAMP'
      }
    }
  };
  const steps = [step1, step2];
  const want = [step1, step2];
  const got = sortStepsByTimestamp(steps);
  expect(got).toEqual(want);
});

it('sortStepsByTimestamp preserves order if startedAt timestamps equal', () => {
  const step1 = {
    id: 'step-b',
    stepStatus: {
      terminated: {
        finishedAt: '2020-01-01T15:30:00Z',
        startedAt: '2020-01-01T15:25:00Z'
      }
    }
  };
  const step2 = {
    id: 'step-a',
    stepStatus: {
      terminated: {
        finishedAt: '2020-01-01T15:30:00Z',
        startedAt: '2020-01-01T15:25:00Z'
      }
    }
  };
  const steps = [step1, step2];
  const want = [step1, step2];
  const got = sortStepsByTimestamp(steps);
  expect(got).toEqual(want);
});

it('updateUnexecutedSteps no steps', () => {
  const steps = [];
  const wantUpdatedSteps = [];
  const gotUpdatedSteps = updateUnexecutedSteps(steps);
  expect(gotUpdatedSteps).toEqual(wantUpdatedSteps);
});

it('updateUnexecutedSteps undefined steps', () => {
  let steps;
  let wantUpdatedSteps;
  const gotUpdatedSteps = updateUnexecutedSteps(steps);
  expect(gotUpdatedSteps).toEqual(wantUpdatedSteps);
});

it('updateUnexecutedSteps no error steps', () => {
  const steps = [
    { reason: 'Completed', status: 'Terminated' },
    {
      reason: 'Running',
      status: 'Unknown',
      stepStatus: {}
    }
  ];
  const wantUpdatedSteps = [...steps];
  const gotUpdatedSteps = updateUnexecutedSteps(steps);
  expect(gotUpdatedSteps).toEqual(wantUpdatedSteps);
});

it('updateUnexecutedSteps error step', () => {
  const steps = [
    {
      reason: 'Completed',
      status: 'Terminated',
      stepStatus: { terminated: { reason: 'Completed' } }
    },
    {
      reason: 'Error',
      status: 'Error',
      stepStatus: { terminated: { reason: 'Error' } }
    },
    {
      reason: 'Completed',
      status: 'Terminated',
      stepStatus: { terminated: { reason: 'Completed' } }
    }
  ];
  const wantUpdatedSteps = [
    {
      reason: 'Completed',
      status: 'Terminated',
      stepStatus: { terminated: { reason: 'Completed' } }
    },
    {
      reason: 'Error',
      status: 'Error',
      stepStatus: { terminated: { reason: 'Error' } }
    },
    {
      reason: '',
      status: '',
      stepStatus: { terminated: { reason: '' } }
    }
  ];

  const gotUpdatedSteps = updateUnexecutedSteps(steps);
  expect(gotUpdatedSteps).toEqual(wantUpdatedSteps);
});

it('getFilters', () => {
  const search = 'labelSelector=tekton.dev%2Fpipeline%3Ddemo-pipeline';
  const filters = getFilters({ search });
  expect(filters.length).toEqual(1);
  expect(filters[0]).toEqual('tekton.dev/pipeline=demo-pipeline');
});

it('getAddFilterHandler', () => {
  const url = 'someURL';
  const history = { push: jest.fn() };
  const location = { search: '?nonFilterQueryParam=someValue' };
  const match = { url };
  const handleAddFilter = getAddFilterHandler({ history, location, match });
  const labelFilters = ['foo1=bar1', 'foo2=bar2'];
  handleAddFilter(labelFilters);
  expect(history.push).toHaveBeenCalledWith(
    `${url}?nonFilterQueryParam=someValue&labelSelector=${encodeURIComponent(
      'foo1=bar1,foo2=bar2'
    )}`
  );
});

describe('getDeleteFilterHandler', () => {
  it('should redirect to unfiltered URL if no filters remain', () => {
    const search = `?labelSelector=${encodeURIComponent('foo=bar')}`;
    const url = 'someURL';
    const history = { push: jest.fn() };
    const location = { search };
    const match = { url };
    const handleDeleteFilter = getDeleteFilterHandler({
      history,
      location,
      match
    });
    handleDeleteFilter('foo=bar');
    expect(history.push).toHaveBeenCalledWith(url);
  });

  it('should correctly remove a filter from the URL', () => {
    const search = `?labelSelector=${encodeURIComponent(
      'foo1=bar1,foo2=bar2'
    )}`;
    const url = 'someURL';
    const history = { push: jest.fn() };
    const location = { search };
    const match = { url };
    const handleDeleteFilter = getDeleteFilterHandler({
      history,
      location,
      match
    });
    handleDeleteFilter('foo1=bar1');
    expect(history.push).toHaveBeenCalledWith(
      `${url}?labelSelector=${encodeURIComponent('foo2=bar2')}`
    );
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

describe('getResources', () => {
  it('supports v1alpha1 structure', () => {
    const fakeInputResources = { fake: 'inputResources' };
    const fakeOutputResources = { fake: 'outputResources' };
    const { inputResources, outputResources } = getResources({
      inputs: { resources: fakeInputResources },
      outputs: { resources: fakeOutputResources }
    });
    expect(inputResources).toEqual(fakeInputResources);
    expect(outputResources).toEqual(fakeOutputResources);
  });

  it('supports v1beta1 structure', () => {
    const fakeInputResources = { fake: 'inputResources' };
    const fakeOutputResources = { fake: 'outputResources' };
    const { inputResources, outputResources } = getResources({
      resources: { inputs: fakeInputResources, outputs: fakeOutputResources }
    });
    expect(inputResources).toEqual(fakeInputResources);
    expect(outputResources).toEqual(fakeOutputResources);
  });
});

it('getTitle', () => {
  let title = getTitle({ page: 'SomePage' });
  expect(title).toEqual('Tekton Dashboard | SomePage');

  title = getTitle({ page: 'SomePage', resourceName: 'someResource' });
  expect(title).toEqual('Tekton Dashboard | SomePage - someResource');
});
