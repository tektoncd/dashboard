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

import { getStatus, taskRunStep, selectedTask } from '.';

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
