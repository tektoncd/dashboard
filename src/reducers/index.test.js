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
  getClusterTask,
  getClusterTasks,
  getClusterTasksErrorMessage,
  getCondition,
  getConditions,
  getConditionsErrorMessage,
  getDashboardNamespace,
  getDashboardVersion,
  getDeleteSecretsErrorMessage,
  getExtensions,
  getExtensionsErrorMessage,
  getLocale,
  getLogoutURL,
  getNamespaces,
  getPatchSecretsErrorMessage,
  getPipelineNamespace,
  getPipelineResource,
  getPipelineResources,
  getPipelineResourcesErrorMessage,
  getPipelineRun,
  getPipelineRuns,
  getPipelineRunsErrorMessage,
  getPipelines,
  getPipelinesErrorMessage,
  getPipelineVersion,
  getSecrets,
  getSecretsErrorMessage,
  getSelectedNamespace,
  getServiceAccount,
  getServiceAccountsErrorMessage,
  getTaskByType,
  getTaskRun,
  getTaskRuns,
  getTaskRunsByPipelineRunName,
  getTaskRunsErrorMessage,
  getTasks,
  getTasksErrorMessage,
  getTenantNamespace,
  getTriggersNamespace,
  getTriggersVersion,
  isFetchingClusterTasks,
  isFetchingConditions,
  isFetchingExtensions,
  isFetchingPipelineResources,
  isFetchingPipelineRuns,
  isFetchingPipelines,
  isFetchingSecrets,
  isFetchingTaskRuns,
  isFetchingTasks,
  isLogStreamingEnabled,
  isOpenShift,
  isReadOnly,
  isTriggersInstalled
} from '.';
import * as clusterTaskSelectors from './clusterTasks';
import * as conditionSelectors from './conditions';
import * as extensionSelectors from './extensions';
import * as localeSelectors from './locale';
import * as namespaceSelectors from './namespaces';
import * as pipelineResourcesSelectors from './pipelineResources';
import * as pipelineSelectors from './pipelines';
import * as pipelineRunsSelectors from './pipelineRuns';
import * as propertiesSelectors from './properties';
import * as secretSelectors from './secrets';
import * as serviceAccountSelectors from './serviceAccounts';
import * as taskSelectors from './tasks';
import * as taskRunsSelectors from './taskRuns';

const locale = 'it';
const namespace = 'default';
const pipelineRunName = 'pipelineRunName';
const conditions = [{ fake: 'condition' }];
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
  conditions,
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

it('getDeleteSecretsErrorMessage', () => {
  const errorMessage = 'fake error message';
  jest
    .spyOn(secretSelectors, 'getDeleteSecretsErrorMessage')
    .mockImplementation(() => errorMessage);
  expect(getDeleteSecretsErrorMessage(state)).toEqual(errorMessage);
  expect(secretSelectors.getDeleteSecretsErrorMessage).toHaveBeenCalledWith(
    state.secrets
  );
});

it('getPatchSecretsErrorMessage', () => {
  const errorMessage = 'fake error message';
  jest
    .spyOn(secretSelectors, 'getPatchSecretsErrorMessage')
    .mockImplementation(() => errorMessage);
  expect(getPatchSecretsErrorMessage(state)).toEqual(errorMessage);
  expect(secretSelectors.getPatchSecretsErrorMessage).toHaveBeenCalledWith(
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

it('getServiceAccount', () => {
  jest
    .spyOn(serviceAccountSelectors, 'getServiceAccount')
    .mockImplementation(() => serviceAccounts);
  expect(getServiceAccount(state, 'account', namespace)).toEqual(
    serviceAccounts
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

it('isReadOnly', () => {
  jest.spyOn(propertiesSelectors, 'isReadOnly').mockImplementation(() => true);
  expect(isReadOnly(state)).toBe(true);
  expect(propertiesSelectors.isReadOnly).toHaveBeenCalledWith(state.properties);
});

it('isOpenShift', () => {
  jest.spyOn(propertiesSelectors, 'isOpenShift').mockImplementation(() => true);
  expect(isOpenShift(state)).toBe(true);
  expect(propertiesSelectors.isOpenShift).toHaveBeenCalledWith(
    state.properties
  );
});

it('isTriggersInstalled', () => {
  jest
    .spyOn(propertiesSelectors, 'isTriggersInstalled')
    .mockImplementation(() => true);
  expect(isTriggersInstalled(state)).toBe(true);
  expect(propertiesSelectors.isTriggersInstalled).toHaveBeenCalledWith(
    state.properties
  );
});

it('getLogoutURL', () => {
  jest
    .spyOn(propertiesSelectors, 'getLogoutURL')
    .mockImplementation(() => '/logout');
  expect(getLogoutURL(state)).toBe('/logout');
  expect(propertiesSelectors.getLogoutURL).toHaveBeenCalledWith(
    state.properties
  );
});

it('getDashboardNamespace', () => {
  jest
    .spyOn(propertiesSelectors, 'getDashboardNamespace')
    .mockImplementation(() => 'ns');
  expect(getDashboardNamespace(state)).toBe('ns');
  expect(propertiesSelectors.getDashboardNamespace).toHaveBeenCalledWith(
    state.properties
  );
});

it('getDashboardVersion', () => {
  jest
    .spyOn(propertiesSelectors, 'getDashboardVersion')
    .mockImplementation(() => 'x');
  expect(getDashboardVersion(state)).toBe('x');
  expect(propertiesSelectors.getDashboardVersion).toHaveBeenCalledWith(
    state.properties
  );
});

it('getPipelineNamespace', () => {
  jest
    .spyOn(propertiesSelectors, 'getPipelineNamespace')
    .mockImplementation(() => 'x');
  expect(getPipelineNamespace(state)).toBe('x');
  expect(propertiesSelectors.getPipelineNamespace).toHaveBeenCalledWith(
    state.properties
  );
});

it('getPipelineVersion', () => {
  jest
    .spyOn(propertiesSelectors, 'getPipelineVersion')
    .mockImplementation(() => 'x');
  expect(getPipelineVersion(state)).toBe('x');
  expect(propertiesSelectors.getPipelineVersion).toHaveBeenCalledWith(
    state.properties
  );
});

it('getTriggersNamespace', () => {
  jest
    .spyOn(propertiesSelectors, 'getTriggersNamespace')
    .mockImplementation(() => 'x');
  expect(getTriggersNamespace(state)).toBe('x');
  expect(propertiesSelectors.getTriggersNamespace).toHaveBeenCalledWith(
    state.properties
  );
});

it('getTriggersVersion', () => {
  jest
    .spyOn(propertiesSelectors, 'getTriggersVersion')
    .mockImplementation(() => 'x');
  expect(getTriggersVersion(state)).toBe('x');
  expect(propertiesSelectors.getTriggersVersion).toHaveBeenCalledWith(
    state.properties
  );
});

it('getTenantNamespace', () => {
  jest
    .spyOn(propertiesSelectors, 'getTenantNamespace')
    .mockImplementation(() => 'x');
  expect(getTenantNamespace(state)).toBe('x');
  expect(propertiesSelectors.getTenantNamespace).toHaveBeenCalledWith(
    state.properties
  );
});

it('isLogStreamingEnabled', () => {
  jest
    .spyOn(propertiesSelectors, 'isLogStreamingEnabled')
    .mockImplementation(() => true);
  expect(isLogStreamingEnabled(state)).toBe(true);
  expect(propertiesSelectors.isLogStreamingEnabled).toHaveBeenCalledWith(
    state.properties
  );
});
