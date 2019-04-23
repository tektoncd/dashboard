/*
Copyright 2019 The Tekton Authors
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

import { getStatus, taskRunStep, selectedTask, stepsStatus } from '.';

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

it('selectedTask find not exists', () => {
  const taskName = 'testName';
  const foundTask = selectedTask(taskName, []);
  expect(foundTask).toEqual(undefined);
});

it('selectedTask find exists', () => {
  const taskName = 'testName';
  const expectedTask = { metadata: { name: taskName } };
  const foundTask = selectedTask(taskName, [expectedTask]);
  expect(foundTask.metadata.name).toEqual(taskName);
});

it('stepsStatus no steps', () => {
  const taskSteps = [];
  const taskRunStepsStatus = [];
  const steps = stepsStatus(taskSteps, taskRunStepsStatus);
  expect(steps).toEqual([]);
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

it('stepsStatus step is waiting', () => {
  const stepName = 'testStep';
  const taskSteps = [{ name: stepName, image: 'test' }];
  const taskRunStepsStatus = [{ name: stepName, waiting: {} }];
  const steps = stepsStatus(taskSteps, taskRunStepsStatus);
  const returnedStep = steps[0];
  expect(returnedStep.status).toEqual('waiting');
});
