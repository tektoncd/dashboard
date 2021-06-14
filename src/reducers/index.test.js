/*
Copyright 2019-2021 The Tekton Authors
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
  getClusterInterceptor,
  getClusterInterceptors,
  getClusterInterceptorsErrorMessage,
  getClusterTask,
  getClusterTasks,
  getClusterTasksErrorMessage,
  getCondition,
  getConditions,
  getConditionsErrorMessage,
  getExtensions,
  getExtensionsErrorMessage,
  getLocale,
  getNamespaces,
  getPipelineResource,
  getPipelineResources,
  getPipelineResourcesErrorMessage,
  getPipelineRun,
  getPipelineRuns,
  getPipelineRunsErrorMessage,
  getPipelines,
  getPipelinesErrorMessage,
  getSelectedNamespace,
  getServiceAccountsErrorMessage,
  getTaskByType,
  getTaskRun,
  getTaskRuns,
  getTaskRunsByPipelineRunName,
  getTaskRunsErrorMessage,
  getTasks,
  getTasksErrorMessage,
  getTrigger,
  getTriggers,
  getTriggersErrorMessage,
  isFetchingClusterInterceptors,
  isFetchingClusterTasks,
  isFetchingConditions,
  isFetchingExtensions,
  isFetchingPipelineResources,
  isFetchingPipelineRuns,
  isFetchingPipelines,
  isFetchingTaskRuns,
  isFetchingTasks,
  isFetchingTriggers
} from '.';
import * as clusterInterceptorSelectors from './clusterInterceptors';
import * as clusterTaskSelectors from './clusterTasks';
import * as conditionSelectors from './conditions';
import * as extensionSelectors from './extensions';
import * as localeSelectors from './locale';
import * as namespaceSelectors from './namespaces';
import * as pipelineResourcesSelectors from './pipelineResources';
import * as pipelineSelectors from './pipelines';
import * as pipelineRunsSelectors from './pipelineRuns';
import * as serviceAccountSelectors from './serviceAccounts';
import * as taskSelectors from './tasks';
import * as taskRunsSelectors from './taskRuns';
import * as triggersSelectors from './triggers';

const locale = 'it';
const namespace = 'default';
const pipelineRunName = 'pipelineRunName';
const conditions = [{ fake: 'condition' }];
const extension = { displayName: 'extension' };
const pipelineResources = [{ fake: 'pipelineResource' }];
const pipelines = [{ fake: 'pipeline' }];
const pipelineRuns = [{ fake: 'pipelineRun' }];
const serviceAccounts = [{ fake: 'account' }];
const task = { fake: 'task' };
const tasks = [task];
const clusterInterceptor = { fake: 'clusterInterceptor' };
const clusterInterceptorName = 'fake_clusterInterceptorName';
const clusterInterceptors = [clusterInterceptor];
const clusterTask = { fake: 'clusterTask' };
const clusterTasks = [clusterTask];
const trigger = { fake: 'trigger' };
const triggerName = 'fake_triggerName';
const triggers = [trigger];
const taskName = 'myTask';
const taskRun = {
  metadata: {
    labels: { [labels.PIPELINE_RUN]: pipelineRunName }
  },
  fake: 'taskRun',
  spec: { taskRef: { name: taskName } }
};
const inlineTaskRun = { fake: 'taskRun', spec: {} };
const taskRuns = [taskRun, inlineTaskRun];
const state = {
  clusterInterceptors,
  clusterTasks,
  conditions,
  extensions: {
    byName: {
      foo: extension
    }
  },
  locale: { selected: locale },
  namespaces: {
    selected: namespace
  },
  pipelineResources,
  pipelines,
  serviceAccounts,
  tasks,
  triggers
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
  expect(getPipelineRuns(state, { filters: [] })).toEqual(pipelineRuns);
  expect(pipelineRunsSelectors.getPipelineRuns).toHaveBeenCalledWith(
    state.pipelineRuns,
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

it('getConditions', () => {
  jest
    .spyOn(conditionSelectors, 'getConditions')
    .mockImplementation(() => conditions);
  expect(getConditions(state, { filters: [] })).toEqual(conditions);
  expect(conditionSelectors.getConditions).toHaveBeenCalledWith(
    state.conditions,
    namespace
  );
});

it('getPipelineRun', () => {
  const name = 'conditionName';
  const condition = { fake: 'condition' };
  jest
    .spyOn(conditionSelectors, 'getCondition')
    .mockImplementation(() => condition);
  expect(getCondition(state, { name })).toEqual(condition);
  expect(conditionSelectors.getCondition).toHaveBeenCalledWith(
    state.conditions,
    name,
    namespace
  );
});

it('getConditionsErrorMessage', () => {
  const errorMessage = 'fake error message';
  jest
    .spyOn(conditionSelectors, 'getConditionsErrorMessage')
    .mockImplementation(() => errorMessage);
  expect(getConditionsErrorMessage(state)).toEqual(errorMessage);
  expect(conditionSelectors.getConditionsErrorMessage).toHaveBeenCalledWith(
    state.conditions
  );
});

it('isFetchingConditions', () => {
  jest
    .spyOn(conditionSelectors, 'isFetchingConditions')
    .mockImplementation(() => true);
  expect(isFetchingConditions(state)).toBe(true);
  expect(conditionSelectors.isFetchingConditions).toHaveBeenCalledWith(
    state.conditions
  );
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
  expect(getTaskRuns(state, { filters: [] })).toEqual(taskRuns);
  expect(taskRunsSelectors.getTaskRuns).toHaveBeenCalledWith(
    state.taskRuns,
    namespace
  );
});

it('getTaskRunsByPipelineRunName', () => {
  jest
    .spyOn(taskRunsSelectors, 'getTaskRuns')
    .mockImplementation(() => taskRuns);
  expect(getTaskRunsByPipelineRunName(state, pipelineRunName)).toEqual([
    taskRun
  ]);
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

it('getClusterInterceptor', () => {
  jest
    .spyOn(clusterInterceptorSelectors, 'getClusterInterceptor')
    .mockImplementation(() => clusterInterceptor);
  expect(
    getClusterInterceptor(state, { name: clusterInterceptorName })
  ).toEqual(clusterInterceptor);
  expect(
    clusterInterceptorSelectors.getClusterInterceptor
  ).toHaveBeenCalledWith(state.clusterInterceptors, clusterInterceptorName);
});

it('getClusterInterceptors', () => {
  jest
    .spyOn(clusterInterceptorSelectors, 'getClusterInterceptors')
    .mockImplementation(() => clusterInterceptors);
  expect(getClusterInterceptors(state, { filters: [] })).toEqual(
    clusterInterceptors
  );
  expect(
    clusterInterceptorSelectors.getClusterInterceptors
  ).toHaveBeenCalledWith(state.clusterInterceptors);
});

it('getClusterInterceptorsErrorMessage', () => {
  const errorMessage = 'fake error message';
  jest
    .spyOn(clusterInterceptorSelectors, 'getClusterInterceptorsErrorMessage')
    .mockImplementation(() => errorMessage);
  expect(getClusterInterceptorsErrorMessage(state)).toEqual(errorMessage);
  expect(
    clusterInterceptorSelectors.getClusterInterceptorsErrorMessage
  ).toHaveBeenCalledWith(state.clusterInterceptors);
});

it('isFetchingClusterInterceptors', () => {
  jest
    .spyOn(clusterInterceptorSelectors, 'isFetchingClusterInterceptors')
    .mockImplementation(() => true);
  expect(isFetchingClusterInterceptors(state)).toBe(true);
  expect(
    clusterInterceptorSelectors.isFetchingClusterInterceptors
  ).toHaveBeenCalledWith(state.clusterInterceptors);
});

it('getTrigger', () => {
  jest.spyOn(triggersSelectors, 'getTrigger').mockImplementation(() => trigger);
  expect(getTrigger(state, { name: triggerName })).toEqual(trigger);
  expect(triggersSelectors.getTrigger).toHaveBeenCalledWith(
    state.triggers,
    triggerName,
    namespace
  );
});

it('getTriggers', () => {
  jest
    .spyOn(triggersSelectors, 'getTriggers')
    .mockImplementation(() => triggers);
  expect(getTriggers(state, { filters: [], namespace })).toEqual(triggers);
  expect(triggersSelectors.getTriggers).toHaveBeenCalledWith(
    state.triggers,
    namespace
  );
});

it('getTriggersErrorMessage', () => {
  const errorMessage = 'fake error message';
  jest
    .spyOn(triggersSelectors, 'getTriggersErrorMessage')
    .mockImplementation(() => errorMessage);
  expect(getTriggersErrorMessage(state)).toEqual(errorMessage);
  expect(triggersSelectors.getTriggersErrorMessage).toHaveBeenCalledWith(
    state.triggers
  );
});

it('isFetchingTriggers', () => {
  jest
    .spyOn(triggersSelectors, 'isFetchingTriggers')
    .mockImplementation(() => true);
  expect(isFetchingTriggers(state)).toBe(true);
  expect(triggersSelectors.isFetchingTriggers).toHaveBeenCalledWith(
    state.triggers
  );
});
