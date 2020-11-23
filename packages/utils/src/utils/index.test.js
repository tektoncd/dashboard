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

import { labels } from '@tektoncd/dashboard-utils';

import {
  formatLabels,
  generateId,
  getAddFilterHandler,
  getDeleteFilterHandler,
  getErrorMessage,
  getFilters,
  getGenerateNamePrefixForRerun,
  getParams,
  getResources,
  getStatus,
  getStepDefinition,
  getStepStatus,
  getStepStatusReason,
  getTitle,
  isRunning,
  updateUnexecutedSteps
} from '.';

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
