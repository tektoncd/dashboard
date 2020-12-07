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

import { combineReducers } from 'redux';
import { labels as labelConstants } from '@tektoncd/dashboard-utils';

import clusterTasks, * as clusterTaskSelectors from './clusterTasks';
import conditions, * as conditionSelectors from './conditions';
import eventListeners, * as eventListenersSelectors from './eventListeners';
import extensions, * as extensionSelectors from './extensions';
import locale, * as localeSelectors from './locale';
import namespaces, * as namespaceSelectors from './namespaces';
import notifications, * as notificationSelectors from './notifications';
import pipelines, * as pipelineSelectors from './pipelines';
import pipelineResources, * as pipelineResourcesSelectors from './pipelineResources';
import pipelineRuns, * as pipelineRunsSelectors from './pipelineRuns';
import properties, * as propertiesSelectors from './properties';
import secrets, * as secretSelectors from './secrets';
import triggerTemplates, * as triggerTemplatesSelectors from './triggerTemplates';
import triggerBindings, * as triggerBindingsSelectors from './triggerBindings';
import clusterTriggerBindings, * as clusterTriggerBindingsSelectors from './clusterTriggerBindings';
import serviceAccounts, * as serviceAccountSelectors from './serviceAccounts';
import tasks, * as taskSelectors from './tasks';
import taskRuns, * as taskRunsSelectors from './taskRuns';

export default combineReducers({
  clusterTasks,
  conditions: conditions(),
  eventListeners: eventListeners(),
  extensions,
  locale,
  namespaces,
  notifications,
  pipelines: pipelines(),
  pipelineResources: pipelineResources(),
  pipelineRuns: pipelineRuns(),
  properties,
  secrets,
  serviceAccounts: serviceAccounts(),
  tasks: tasks(),
  taskRuns: taskRuns(),
  triggerBindings: triggerBindings(),
  clusterTriggerBindings: clusterTriggerBindings(),
  triggerTemplates: triggerTemplates()
});

function filterResources({ filters, resources }) {
  return resources.filter(resource =>
    filters.every(filter => {
      const [filterKey, filterValue] = filter.split('=');
      const { labels } = resource.metadata || resource;
      return (
        labels && filterKey && filterValue && labels[filterKey] === filterValue
      );
    })
  );
}

export function getSelectedNamespace(state) {
  return namespaceSelectors.getSelectedNamespace(state.namespaces);
}

export function getNamespaces(state) {
  return namespaceSelectors.getNamespaces(state.namespaces);
}

export function getServiceAccount(
  state,
  { name, namespace = getSelectedNamespace(state) }
) {
  return serviceAccountSelectors.getServiceAccount(
    state.serviceAccounts,
    name,
    namespace
  );
}

export function getServiceAccounts(
  state,
  { filters = [], namespace = getSelectedNamespace(state) } = {}
) {
  const resources = serviceAccountSelectors.getServiceAccounts(
    state.serviceAccounts,
    namespace
  );
  return filterResources({ filters, resources });
}

export function isFetchingServiceAccounts(state) {
  return serviceAccountSelectors.isFetchingServiceAccounts(
    state.serviceAccounts
  );
}

export function getServiceAccountsErrorMessage(state) {
  return serviceAccountSelectors.getServiceAccountsErrorMessage(
    state.serviceAccounts
  );
}

export function isFetchingNamespaces(state) {
  return namespaceSelectors.isFetchingNamespaces(state.namespaces);
}

export function getExtensions(state) {
  return extensionSelectors
    .getExtensions(state.extensions)
    .filter(({ displayName }) => !!displayName);
}

export function getExtensionsErrorMessage(state) {
  return extensionSelectors.getExtensionsErrorMessage(state.extensions);
}

export function isFetchingExtensions(state) {
  return extensionSelectors.isFetchingExtensions(state.extensions);
}

export function getPipeline(
  state,
  { name, namespace = getSelectedNamespace(state) }
) {
  return pipelineSelectors.getPipeline(state.pipelines, name, namespace);
}

export function getPipelines(
  state,
  { filters = [], namespace = getSelectedNamespace(state) } = {}
) {
  const resources = pipelineSelectors.getPipelines(state.pipelines, namespace);
  return filterResources({ filters, resources });
}

export function getPipelinesErrorMessage(state) {
  return pipelineSelectors.getPipelinesErrorMessage(state.pipelines);
}

export function isFetchingPipelines(state) {
  return pipelineSelectors.isFetchingPipelines(state.pipelines);
}

export function getPipelineResources(
  state,
  { filters = [], namespace = getSelectedNamespace(state) } = {}
) {
  const resources = pipelineResourcesSelectors.getPipelineResources(
    state.pipelineResources,
    namespace
  );
  return filterResources({ filters, resources });
}

export function getPipelineResource(
  state,
  { name, namespace = getSelectedNamespace(state) }
) {
  return pipelineResourcesSelectors.getPipelineResource(
    state.pipelineResources,
    name,
    namespace
  );
}

export function getPipelineResourcesErrorMessage(state) {
  return pipelineResourcesSelectors.getPipelineResourcesErrorMessage(
    state.pipelineResources
  );
}

export function isFetchingPipelineResources(state) {
  return pipelineResourcesSelectors.isFetchingPipelineResources(
    state.pipelineResources
  );
}

export function getPipelineRuns(
  state,
  { filters, namespace = getSelectedNamespace(state) } = {}
) {
  const resources = pipelineRunsSelectors.getPipelineRuns(
    state.pipelineRuns,
    namespace
  );
  return filterResources({ filters, resources });
}

export function getPipelineRun(
  state,
  { name, namespace = getSelectedNamespace(state) }
) {
  return pipelineRunsSelectors.getPipelineRun(
    state.pipelineRuns,
    name,
    namespace
  );
}

export function getPipelineRunsErrorMessage(state) {
  return pipelineRunsSelectors.getPipelineRunsErrorMessage(state.pipelineRuns);
}

export function isFetchingPipelineRuns(state) {
  return pipelineRunsSelectors.isFetchingPipelineRuns(state.pipelineRuns);
}

export function getTaskRun(
  state,
  { name, namespace = getSelectedNamespace(state) }
) {
  return taskRunsSelectors.getTaskRun(state.taskRuns, name, namespace);
}

export function getTaskRunsByPipelineRunName(
  state,
  pipelineRunName,
  { namespace = getSelectedNamespace(state) } = {}
) {
  const resources = taskRunsSelectors.getTaskRuns(state.taskRuns, namespace);
  return filterResources({
    filters: [`${labelConstants.PIPELINE_RUN}=${pipelineRunName}`],
    resources
  });
}

export function getTaskRuns(
  state,
  { filters, namespace = getSelectedNamespace(state) } = {}
) {
  const resources = taskRunsSelectors.getTaskRuns(state.taskRuns, namespace);
  return filterResources({ filters, resources });
}

export function getTaskRunsErrorMessage(state) {
  return taskRunsSelectors.getTaskRunsErrorMessage(state.taskRuns);
}

export function isFetchingTaskRuns(state) {
  return taskRunsSelectors.isFetchingTaskRuns(state.taskRuns);
}

export function getTasks(
  state,
  { filters = [], namespace = getSelectedNamespace(state) } = {}
) {
  const resources = taskSelectors.getTasks(state.tasks, namespace);
  return filterResources({ filters, resources });
}

export function getTask(
  state,
  { name, namespace = getSelectedNamespace(state) }
) {
  return taskSelectors.getTask(state.tasks, name, namespace);
}

export function getTasksErrorMessage(state) {
  return taskSelectors.getTasksErrorMessage(state.tasks);
}

export function isFetchingTasks(state) {
  return taskSelectors.isFetchingTasks(state.tasks);
}

export function getClusterTasks(state, { filters = [] } = {}) {
  const resources = clusterTaskSelectors.getClusterTasks(state.clusterTasks);
  return filterResources({ filters, resources });
}

export function getClusterTask(state, name) {
  return clusterTaskSelectors.getClusterTask(state.clusterTasks, name);
}

export function getClusterTasksErrorMessage(state) {
  return clusterTaskSelectors.getClusterTasksErrorMessage(state.clusterTasks);
}

export function isFetchingClusterTasks(state) {
  return clusterTaskSelectors.isFetchingClusterTasks(state.clusterTasks);
}

export function getTaskByType(
  state,
  { type, name, namespace = getSelectedNamespace(state) }
) {
  return type === 'clustertasks'
    ? getClusterTask(state, name)
    : getTask(state, { name, namespace });
}

export function getCondition(
  state,
  { name, namespace = getSelectedNamespace(state) }
) {
  return conditionSelectors.getCondition(state.conditions, name, namespace);
}

export function getConditions(
  state,
  { filters = [], namespace = getSelectedNamespace(state) } = {}
) {
  const resources = conditionSelectors.getConditions(
    state.conditions,
    namespace
  );
  return filterResources({ filters, resources });
}

export function getConditionsErrorMessage(state) {
  return conditionSelectors.getConditionsErrorMessage(state.conditions);
}

export function isFetchingConditions(state) {
  return conditionSelectors.isFetchingConditions(state.conditions);
}

export function getSecrets(
  state,
  { filters = [], namespace = getSelectedNamespace(state) } = {}
) {
  const allSecrets = secretSelectors.getSecrets(state.secrets, namespace);

  return allSecrets.filter(secret =>
    filters.every(filter => {
      const [filterKey, filterValue] = filter.split('=');
      return (
        secret.metadata.labels &&
        filterKey &&
        filterValue &&
        secret.metadata.labels[filterKey] === filterValue
      );
    })
  );
}

export function getSecret(state, { name, namespace }) {
  return secretSelectors.getSecret(state.secrets, name, namespace);
}

export function getSecretsErrorMessage(state) {
  return secretSelectors.getSecretsErrorMessage(state.secrets);
}

export function getDeleteSecretsErrorMessage(state) {
  return secretSelectors.getDeleteSecretsErrorMessage(state.secrets);
}

export function getPatchSecretsErrorMessage(state) {
  return secretSelectors.getPatchSecretsErrorMessage(state.secrets);
}

export function getCreateSecretsSuccessMessage(state) {
  return secretSelectors.getCreateSecretsSuccessMessage(state.secrets);
}

export function getDeleteSecretsSuccessMessage(state) {
  return secretSelectors.getDeleteSecretsSuccessMessage(state.secrets);
}

export function getPatchSecretsSuccessMessage(state) {
  return secretSelectors.getPatchSecretsSuccessMessage(state.secrets);
}

export function isFetchingSecrets(state) {
  return secretSelectors.isFetchingSecrets(state.secrets);
}

export function getLocale(state) {
  return localeSelectors.getLocale(state.locale);
}

export function isWebSocketConnected(state) {
  return notificationSelectors.isWebSocketConnected(state.notifications);
}

export function getTriggerTemplates(
  state,
  { filters, namespace = getSelectedNamespace(state) } = {}
) {
  const resources = triggerTemplatesSelectors.getTriggerTemplates(
    state.triggerTemplates,
    namespace
  );
  return filterResources({ filters, resources });
}

export function getTriggerTemplate(
  state,
  { name, namespace = getSelectedNamespace(state) }
) {
  return triggerTemplatesSelectors.getTriggerTemplate(
    state.triggerTemplates,
    name,
    namespace
  );
}

export function getTriggerTemplatesErrorMessage(state) {
  return triggerTemplatesSelectors.getTriggerTemplatesErrorMessage(
    state.triggerTemplates
  );
}

export function isFetchingTriggerTemplates(state) {
  return triggerTemplatesSelectors.isFetchingTriggerTemplates(
    state.triggerTemplates
  );
}

export function getTriggerBindings(
  state,
  { filters, namespace = getSelectedNamespace(state) } = {}
) {
  const resources = triggerBindingsSelectors.getTriggerBindings(
    state.triggerBindings,
    namespace
  );
  return filterResources({ filters, resources });
}

export function getClusterTriggerBindings(state, { filters } = {}) {
  const resources = clusterTriggerBindingsSelectors.getClusterTriggerBindings(
    state.clusterTriggerBindings
  );
  return filterResources({ filters, resources });
}

export function getTriggerBinding(
  state,
  { name, namespace = getSelectedNamespace(state) }
) {
  return triggerBindingsSelectors.getTriggerBinding(
    state.triggerBindings,
    name,
    namespace
  );
}

export function getClusterTriggerBinding(state, { name }) {
  return clusterTriggerBindingsSelectors.getClusterTriggerBinding(
    state.clusterTriggerBindings,
    name
  );
}

export function getTriggerBindingsErrorMessage(state) {
  return triggerBindingsSelectors.getTriggerBindingsErrorMessage(
    state.triggerBindings
  );
}

export function getClusterTriggerBindingsErrorMessage(state) {
  return clusterTriggerBindingsSelectors.getClusterTriggerBindingsErrorMessage(
    state.clusterTriggerBindings
  );
}

export function isFetchingTriggerBindings(state) {
  return triggerBindingsSelectors.isFetchingTriggerBindings(
    state.triggerBindings
  );
}

export function isFetchingClusterTriggerBindings(state) {
  return clusterTriggerBindingsSelectors.isFetchingClusterTriggerBindings(
    state.clusterTriggerBindings
  );
}

export function getEventListeners(
  state,
  { filters, namespace = getSelectedNamespace(state) } = {}
) {
  const resources = eventListenersSelectors.getEventListeners(
    state.eventListeners,
    namespace
  );
  return filterResources({ filters, resources });
}

export function getEventListener(
  state,
  { name, namespace = getSelectedNamespace(state) }
) {
  return eventListenersSelectors.getEventListener(
    state.eventListeners,
    name,
    namespace
  );
}

export function getEventListenersErrorMessage(state) {
  return eventListenersSelectors.getEventListenersErrorMessage(
    state.eventListeners
  );
}

export function isFetchingEventListeners(state) {
  return eventListenersSelectors.isFetchingEventListeners(state.eventListeners);
}

export function isReadOnly(state) {
  return propertiesSelectors.isReadOnly(state.properties);
}

export function isOpenShift(state) {
  return propertiesSelectors.isOpenShift(state.properties);
}

export function isTriggersInstalled(state) {
  return propertiesSelectors.isTriggersInstalled(state.properties);
}

export function getLogoutURL(state) {
  return propertiesSelectors.getLogoutURL(state.properties);
}

export function getDashboardNamespace(state) {
  return propertiesSelectors.getDashboardNamespace(state.properties);
}

export function getDashboardVersion(state) {
  return propertiesSelectors.getDashboardVersion(state.properties);
}

export function getPipelineNamespace(state) {
  return propertiesSelectors.getPipelineNamespace(state.properties);
}

export function getPipelineVersion(state) {
  return propertiesSelectors.getPipelineVersion(state.properties);
}

export function getTriggersNamespace(state) {
  return propertiesSelectors.getTriggersNamespace(state.properties);
}

export function getTriggersVersion(state) {
  return propertiesSelectors.getTriggersVersion(state.properties);
}

export function getTenantNamespace(state) {
  return propertiesSelectors.getTenantNamespace(state.properties);
}

export function isLogStreamingEnabled(state) {
  return propertiesSelectors.isLogStreamingEnabled(state.properties);
}

export function getExternalLogsURL(state) {
  return propertiesSelectors.getExternalLogsURL(state.properties);
}
