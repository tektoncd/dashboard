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

import {
  getExtensions,
  getExtensionsErrorMessage,
  getNamespaces,
  getPipelines,
  getPipelinesErrorMessage,
  getSelectedNamespace,
  getPipelineRuns,
  getPipelineRunsErrorMessage,
  getTasks,
  getTasksErrorMessage,
  getTaskRun,
  getTaskRuns,
  getTaskRunsErrorMessage,
  isFetchingExtensions,
  isFetchingPipelines,
  isFetchingPipelineRuns,
  isFetchingTasks,
  isFetchingTaskRuns
} from '.';
import * as extensionSelectors from './extensions';
import * as namespaceSelectors from './namespaces';
import * as pipelineSelectors from './pipelines';
import * as pipelineRunsSelectors from './pipelineRuns';
import * as taskSelectors from './tasks';
import * as taskRunsSelectors from './taskRuns';

const namespace = 'default';
const extensions = { fake: 'extensions' };
const pipelines = { fake: 'pipelines' };
const pipelineRuns = { fake: 'pipelineRuns' };
const tasks = { fake: 'tasks' };
const taskRun = { fake: 'taskRun' };
const taskRuns = { fake: 'taskRuns' };
const state = {
  extensions,
  namespaces: {
    selected: namespace
  },
  pipelines,
  tasks
};

it('getSelectedNamespace', () => {
  jest
    .spyOn(namespaceSelectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  expect(getSelectedNamespace(state)).toEqual(namespace);
  expect(namespaceSelectors.getSelectedNamespace).toHaveBeenCalledWith(
    state.namespaces
  );
});

it('getNamespaces', () => {
  const namespaces = [namespace];
  jest
    .spyOn(namespaceSelectors, 'getNamespaces')
    .mockImplementation(() => namespaces);
  expect(getNamespaces(state)).toEqual(namespaces);
  expect(namespaceSelectors.getNamespaces).toHaveBeenCalledWith(
    state.namespaces
  );
});

it('getExtensions', () => {
  jest
    .spyOn(extensionSelectors, 'getExtensions')
    .mockImplementation(() => extensions);
  expect(getExtensions(state)).toEqual(extensions);
  expect(extensionSelectors.getExtensions).toHaveBeenCalledWith(
    state.extensions
  );
});

it('getExtensionsErrorMessage', () => {
  const errorMessage = 'fake error message';
  jest
    .spyOn(extensionSelectors, 'getExtensionsErrorMessage')
    .mockImplementation(() => errorMessage);
  expect(getExtensionsErrorMessage(state)).toEqual(errorMessage);
  expect(extensionSelectors.getExtensionsErrorMessage).toHaveBeenCalledWith(
    state.extensions
  );
});

it('isFetchingExtensions', () => {
  jest
    .spyOn(extensionSelectors, 'isFetchingExtensions')
    .mockImplementation(() => true);
  expect(isFetchingExtensions(state)).toBe(true);
  expect(extensionSelectors.isFetchingExtensions).toHaveBeenCalledWith(
    state.extensions
  );
});

it('getPipelines', () => {
  jest
    .spyOn(pipelineSelectors, 'getPipelines')
    .mockImplementation(() => pipelines);
  expect(getPipelines(state)).toEqual(pipelines);
  expect(pipelineSelectors.getPipelines).toHaveBeenCalledWith(
    state.pipelines,
    namespace
  );
});

it('getPipelinesErrorMessage', () => {
  const errorMessage = 'fake error message';
  jest
    .spyOn(pipelineSelectors, 'getPipelinesErrorMessage')
    .mockImplementation(() => errorMessage);
  expect(getPipelinesErrorMessage(state)).toEqual(errorMessage);
  expect(pipelineSelectors.getPipelinesErrorMessage).toHaveBeenCalledWith(
    state.pipelines
  );
});

it('isFetchingPipelines', () => {
  jest
    .spyOn(pipelineSelectors, 'isFetchingPipelines')
    .mockImplementation(() => true);
  expect(isFetchingPipelines(state)).toBe(true);
  expect(pipelineSelectors.isFetchingPipelines).toHaveBeenCalledWith(
    state.pipelines
  );
});

it('getPipelineRuns', () => {
  jest
    .spyOn(pipelineRunsSelectors, 'getPipelineRuns')
    .mockImplementation(() => pipelineRuns);
  expect(getPipelineRuns(state)).toEqual(pipelineRuns);
  expect(pipelineRunsSelectors.getPipelineRuns).toHaveBeenCalledWith(
    state.pipelineRuns,
    namespace
  );
});

it('getPipelineRunsErrorMessage', () => {
  const errorMessage = 'fake error message';
  jest
    .spyOn(pipelineRunsSelectors, 'getPipelineRunsErrorMessage')
    .mockImplementation(() => errorMessage);
  expect(getPipelineRunsErrorMessage(state)).toEqual(errorMessage);
  expect(
    pipelineRunsSelectors.getPipelineRunsErrorMessage
  ).toHaveBeenCalledWith(state.pipelineRuns);
});

it('isFetchingPipelineRuns', () => {
  jest
    .spyOn(pipelineRunsSelectors, 'isFetchingPipelineRuns')
    .mockImplementation(() => true);
  expect(isFetchingPipelineRuns(state)).toBe(true);
  expect(pipelineRunsSelectors.isFetchingPipelineRuns).toHaveBeenCalledWith(
    state.pipelineRuns
  );
});

it('getTasks', () => {
  jest.spyOn(taskSelectors, 'getTasks').mockImplementation(() => tasks);
  expect(getTasks(state)).toEqual(tasks);
  expect(taskSelectors.getTasks).toHaveBeenCalledWith(state.tasks, namespace);
});

it('getTasksErrorMessage', () => {
  const errorMessage = 'fake error message';
  jest
    .spyOn(taskSelectors, 'getTasksErrorMessage')
    .mockImplementation(() => errorMessage);
  expect(getTasksErrorMessage(state)).toEqual(errorMessage);
  expect(taskSelectors.getTasksErrorMessage).toHaveBeenCalledWith(state.tasks);
});

it('isFetchingTasks', () => {
  jest.spyOn(taskSelectors, 'isFetchingTasks').mockImplementation(() => true);
  expect(isFetchingTasks(state)).toBe(true);
  expect(taskSelectors.isFetchingTasks).toHaveBeenCalledWith(state.tasks);
});

it('getTaskRun', () => {
  const name = 'test';
  jest.spyOn(taskRunsSelectors, 'getTaskRun').mockImplementation(() => taskRun);
  expect(getTaskRun(state, 'test')).toEqual(taskRun);
  expect(taskRunsSelectors.getTaskRun).toHaveBeenCalledWith(
    state.taskRuns,
    name,
    namespace
  );
});

it('getTaskRuns', () => {
  jest
    .spyOn(taskRunsSelectors, 'getTaskRuns')
    .mockImplementation(() => taskRuns);
  expect(getTaskRuns(state)).toEqual(taskRuns);
  expect(taskRunsSelectors.getTaskRuns).toHaveBeenCalledWith(
    state.taskRuns,
    namespace
  );
});

it('getTaskRunsErrorMessage', () => {
  const errorMessage = 'fake error message';
  jest
    .spyOn(taskRunsSelectors, 'getTaskRunsErrorMessage')
    .mockImplementation(() => errorMessage);
  expect(getTaskRunsErrorMessage(state)).toEqual(errorMessage);
  expect(taskRunsSelectors.getTaskRunsErrorMessage).toHaveBeenCalledWith(
    state.taskRuns
  );
});

it('isFetchingTaskRuns', () => {
  jest
    .spyOn(taskRunsSelectors, 'isFetchingTaskRuns')
    .mockImplementation(() => true);
  expect(isFetchingTaskRuns(state)).toBe(true);
  expect(taskRunsSelectors.isFetchingTaskRuns).toHaveBeenCalledWith(
    state.taskRuns
  );
});
