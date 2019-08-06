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
  getClusterTask,
  getClusterTasks,
  getClusterTasksErrorMessage,
  getExtensions,
  getExtensionsErrorMessage,
  getLocale,
  getNamespaces,
  getPipelineResource,
  getPipelineResources,
  getPipelineResourcesErrorMessage,
  getPipelineRun,
  getPipelineRuns,
  getPipelineRunsByPipelineName,
  getPipelineRunsErrorMessage,
  getPipelines,
  getPipelinesErrorMessage,
  getSecrets,
  getSecretsErrorMessage,
  getSelectedNamespace,
  getServiceAccountsErrorMessage,
  getTaskByType,
  getTaskRun,
  getTaskRuns,
  getTaskRunsByTaskName,
  getTaskRunsErrorMessage,
  getTasks,
  getTasksErrorMessage,
  isFetchingClusterTasks,
  isFetchingExtensions,
  isFetchingPipelineResources,
  isFetchingPipelineRuns,
  isFetchingPipelines,
  isFetchingSecrets,
  isFetchingTaskRuns,
  isFetchingTasks
} from '.';
import * as clusterTaskSelectors from './clusterTasks';
import * as extensionSelectors from './extensions';
import * as localeSelectors from './locale';
import * as namespaceSelectors from './namespaces';
import * as pipelineResourcesSelectors from './pipelineResources';
import * as pipelineSelectors from './pipelines';
import * as pipelineRunsSelectors from './pipelineRuns';
import * as secretSelectors from './secrets';
import * as serviceAccountSelectors from './serviceAccounts';
import * as taskSelectors from './tasks';
import * as taskRunsSelectors from './taskRuns';

const locale = 'it';
const namespace = 'default';
const extension = { displayName: 'extension' };
const pipelineResources = [{ fake: 'pipelineResource' }];
const pipelines = [{ fake: 'pipeline' }];
const pipelineRuns = [{ fake: 'pipelineRun' }];
const secrets = [{ fake: 'secrets' }];
const serviceAccounts = [{ fake: 'account' }];
const task = { fake: 'task' };
const tasks = [task];
const clusterTask = { fake: 'clusterTask' };
const clusterTasks = [clusterTask];
const taskName = 'myTask';
const taskRun = { fake: 'taskRun', spec: { taskRef: { name: taskName } } };
const inlineTaskRun = { fake: 'taskRun', spec: {} };
const taskRuns = [taskRun, inlineTaskRun];
const state = {
  extensions: {
    byName: {
      foo: extension
    }
  },
  namespaces: {
    selected: namespace
  },
  pipelineResources,
  pipelines,
  secrets,
  serviceAccounts,
  tasks,
  clusterTasks,
  locale: { selected: locale }
};

it('getLocale', () => {
  jest.spyOn(localeSelectors, 'getLocale').mockImplementation(() => locale);
  expect(getLocale(state)).toEqual(locale);
  expect(localeSelectors.getLocale).toHaveBeenCalledWith(state.locale);
});

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
    .mockImplementation(() => [extension]);
  expect(getExtensions(state)).toEqual([extension]);
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

it('getPipelineResources', () => {
  jest
    .spyOn(pipelineResourcesSelectors, 'getPipelineResources')
    .mockImplementation(() => pipelineResources);
  expect(getPipelineResources(state)).toEqual(pipelineResources);
  expect(pipelineResourcesSelectors.getPipelineResources).toHaveBeenCalledWith(
    state.pipelineResources,
    namespace
  );
});

it('getPipelineResource', () => {
  const name = 'pipelineResourceName';
  const pipelineResource = { fake: 'pipelineResource' };
  jest
    .spyOn(pipelineResourcesSelectors, 'getPipelineResource')
    .mockImplementation(() => pipelineResource);
  expect(getPipelineResource(state, { name })).toEqual(pipelineResource);
  expect(pipelineResourcesSelectors.getPipelineResource).toHaveBeenCalledWith(
    state.pipelineResources,
    name,
    namespace
  );
});

it('getPipelineResourcesErrorMessage', () => {
  const errorMessage = 'fake error message';
  jest
    .spyOn(pipelineResourcesSelectors, 'getPipelineResourcesErrorMessage')
    .mockImplementation(() => errorMessage);
  expect(getPipelineResourcesErrorMessage(state)).toEqual(errorMessage);
  expect(
    pipelineResourcesSelectors.getPipelineResourcesErrorMessage
  ).toHaveBeenCalledWith(state.pipelineResources);
});

it('isFetchingPipelineResources', () => {
  jest
    .spyOn(pipelineResourcesSelectors, 'isFetchingPipelineResources')
    .mockImplementation(() => true);
  expect(isFetchingPipelineResources(state)).toBe(true);
  expect(
    pipelineResourcesSelectors.isFetchingPipelineResources
  ).toHaveBeenCalledWith(state.pipelineResources);
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

it('getPipelineRunsByPipelineName', () => {
  const id = 'pipelineId';
  const name = 'pipelineName';
  const pipeline = {
    spec: {
      pipelineRef: {
        name
      }
    }
  };
  const pipelineRunsToFilter = [
    pipeline,
    { spec: { pipelineRef: { name: 'another pipeline' } } }
  ];

  const pipelineRunsState = {
    pipelineRuns: {
      byId: { [id]: pipeline },
      byNamespace: { [namespace]: { [name]: id } }
    }
  };

  jest
    .spyOn(pipelineRunsSelectors, 'getPipelineRuns')
    .mockImplementation(() => pipelineRunsToFilter);
  expect(getPipelineRunsByPipelineName(pipelineRunsState, { name })).toEqual([
    pipeline
  ]);
  expect(pipelineRunsSelectors.getPipelineRuns).toHaveBeenCalledWith(
    pipelineRunsState.pipelineRuns,
    namespace
  );
});

it('getPipelineRun', () => {
  const name = 'pipelineRunName';
  const pipelineRun = { fake: 'pipelineRun' };
  jest
    .spyOn(pipelineRunsSelectors, 'getPipelineRun')
    .mockImplementation(() => pipelineRun);
  expect(getPipelineRun(state, { name })).toEqual(pipelineRun);
  expect(pipelineRunsSelectors.getPipelineRun).toHaveBeenCalledWith(
    state.pipelineRuns,
    name,
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

it('getSecrets', () => {
  jest.spyOn(secretSelectors, 'getSecrets').mockImplementation(() => secrets);
  expect(getSecrets(state)).toEqual(secrets);
  expect(secretSelectors.getSecrets).toHaveBeenCalledWith(
    state.secrets,
    namespace
  );
});

it('getSecretsErrorMessage', () => {
  const errorMessage = 'fake error message';
  jest
    .spyOn(secretSelectors, 'getSecretsErrorMessage')
    .mockImplementation(() => errorMessage);
  expect(getSecretsErrorMessage(state)).toEqual(errorMessage);
  expect(secretSelectors.getSecretsErrorMessage).toHaveBeenCalledWith(
    state.secrets
  );
});

it('isFetchingSecrets', () => {
  jest
    .spyOn(secretSelectors, 'isFetchingSecrets')
    .mockImplementation(() => true);
  expect(isFetchingSecrets(state)).toBe(true);
  expect(secretSelectors.isFetchingSecrets).toHaveBeenCalledWith(state.secrets);
});

it('getServiceAccountsErrorMessage', () => {
  const errorMessage = 'fake error message';
  jest
    .spyOn(serviceAccountSelectors, 'getServiceAccountsErrorMessage')
    .mockImplementation(() => errorMessage);
  expect(getServiceAccountsErrorMessage(state)).toEqual(errorMessage);
  expect(
    serviceAccountSelectors.getServiceAccountsErrorMessage
  ).toHaveBeenCalledWith(state.serviceAccounts);
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

it('getClusterTask', () => {
  jest
    .spyOn(clusterTaskSelectors, 'getClusterTask')
    .mockImplementation(() => clusterTask);
  expect(getClusterTask(state, taskName)).toEqual(clusterTask);
  expect(clusterTaskSelectors.getClusterTask).toHaveBeenCalledWith(
    state.clusterTasks,
    taskName
  );
});

it('getClusterTasks', () => {
  jest
    .spyOn(clusterTaskSelectors, 'getClusterTasks')
    .mockImplementation(() => clusterTasks);
  expect(getClusterTasks(state)).toEqual(clusterTasks);
  expect(clusterTaskSelectors.getClusterTasks).toHaveBeenCalledWith(
    state.clusterTasks
  );
});

it('getClusterTasksErrorMessage', () => {
  const errorMessage = 'fake error message';
  jest
    .spyOn(clusterTaskSelectors, 'getClusterTasksErrorMessage')
    .mockImplementation(() => errorMessage);
  expect(getClusterTasksErrorMessage(state)).toEqual(errorMessage);
  expect(clusterTaskSelectors.getClusterTasksErrorMessage).toHaveBeenCalledWith(
    state.clusterTasks
  );
});

it('isFetchingClusterTasks', () => {
  jest
    .spyOn(clusterTaskSelectors, 'isFetchingClusterTasks')
    .mockImplementation(() => true);
  expect(isFetchingClusterTasks(state)).toBe(true);
  expect(clusterTaskSelectors.isFetchingClusterTasks).toHaveBeenCalledWith(
    state.clusterTasks
  );
});

it('getTaskByType', () => {
  jest.spyOn(taskSelectors, 'getTask').mockImplementation(() => task);
  expect(getTaskByType(state, { name: taskName, namespace })).toEqual(task);
  expect(taskSelectors.getTask).toHaveBeenCalledWith(
    state.tasks,
    taskName,
    namespace
  );
});

it('getTaskByType clustertasks', () => {
  jest
    .spyOn(clusterTaskSelectors, 'getClusterTask')
    .mockImplementation(() => clusterTask);
  expect(
    getTaskByType(state, { type: 'clustertasks', name: taskName })
  ).toEqual(clusterTask);
  expect(clusterTaskSelectors.getClusterTask).toHaveBeenCalledWith(
    state.clusterTasks,
    taskName
  );
});

it('getTaskRun', () => {
  const name = 'test';
  jest.spyOn(taskRunsSelectors, 'getTaskRun').mockImplementation(() => taskRun);
  expect(getTaskRun(state, { name: 'test' })).toEqual(taskRun);
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

it('getTaskRunsByTaskName', () => {
  jest
    .spyOn(taskRunsSelectors, 'getTaskRuns')
    .mockImplementation(() => taskRuns);
  expect(getTaskRunsByTaskName(state, { name: taskName })).toEqual([taskRun]);
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
