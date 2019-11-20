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

import { combineReducers } from 'redux';

import clusterTasks, * as clusterTaskSelectors from './clusterTasks';
import extensions, * as extensionSelectors from './extensions';
import locale, * as localeSelectors from './locale';
import namespaces, * as namespaceSelectors from './namespaces';
import notifications, * as notificationSelectors from './notifications';
import pipelines, * as pipelineSelectors from './pipelines';
import pipelineResources, * as pipelineResourcesSelectors from './pipelineResources';
import pipelineRuns, * as pipelineRunsSelectors from './pipelineRuns';
import secrets, * as secretSelectors from './secrets';
import triggerTemplates, * as triggerTemplatesSelectors from './triggerTemplates';
import triggerBindings, * as triggerBindingsSelectors from './triggerBindings';
import serviceAccounts, * as serviceAccountSelectors from './serviceAccounts';
import tasks, * as taskSelectors from './tasks';
import taskRuns, * as taskRunsSelectors from './taskRuns';

export default combineReducers({
  clusterTasks,
  extensions,
  locale,
  namespaces,
  notifications,
  pipelines: pipelines(),
  pipelineResources: pipelineResources(),
  pipelineRuns: pipelineRuns(),
  secrets,
  serviceAccounts: serviceAccounts(),
  tasks: tasks(),
  taskRuns: taskRuns(),
  triggerBindings: triggerBindings(),
  triggerTemplates: triggerTemplates()
});

export function getSelectedNamespace(state) {
  return namespaceSelectors.getSelectedNamespace(state.namespaces);
}

export function getNamespaces(state) {
  return namespaceSelectors.getNamespaces(state.namespaces);
}

export function getServiceAccounts(
  state,
  { namespace = getSelectedNamespace(state) } = {}
) {
  return serviceAccountSelectors.getServiceAccounts(
    state.serviceAccounts,
    namespace
  );
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
  { namespace = getSelectedNamespace(state) } = {}
) {
  return pipelineSelectors.getPipelines(state.pipelines, namespace);
}

export function getPipelinesErrorMessage(state) {
  return pipelineSelectors.getPipelinesErrorMessage(state.pipelines);
}

export function isFetchingPipelines(state) {
  return pipelineSelectors.isFetchingPipelines(state.pipelines);
}

export function getPipelineResources(
  state,
  { namespace = getSelectedNamespace(state) } = {}
) {
  return pipelineResourcesSelectors.getPipelineResources(
    state.pipelineResources,
    namespace
  );
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
  const runs = pipelineRunsSelectors.getPipelineRuns(
    state.pipelineRuns,
    namespace
  );
  return runs.filter(pipelineRun => {
    return filters.every(filter => {
      const [filterKey, filterValue] = filter.split('=');
      return (
        pipelineRun.metadata.labels &&
        filterKey &&
        filterValue &&
        pipelineRun.metadata.labels[filterKey] === filterValue
      );
    });
  });
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
  const runs = taskRunsSelectors.getTaskRuns(state.taskRuns, namespace);
  return runs.filter(
    taskRun =>
      taskRun.metadata &&
      taskRun.metadata.labels &&
      taskRun.metadata.labels['tekton.dev/pipelineRun'] === pipelineRunName
  );
}

export function getTaskRuns(
  state,
  { filters, namespace = getSelectedNamespace(state) } = {}
) {
  const runs = taskRunsSelectors.getTaskRuns(state.taskRuns, namespace);
  return runs.filter(taskRun => {
    return filters.every(filter => {
      const [filterKey, filterValue] = filter.split('=');
      return (
        taskRun.metadata.labels &&
        filterKey &&
        filterValue &&
        taskRun.metadata.labels[filterKey] === filterValue
      );
    });
  });
}

export function getTaskRunsErrorMessage(state) {
  return taskRunsSelectors.getTaskRunsErrorMessage(state.taskRuns);
}

export function isFetchingTaskRuns(state) {
  return taskRunsSelectors.isFetchingTaskRuns(state.taskRuns);
}

export function getTasks(
  state,
  { namespace = getSelectedNamespace(state) } = {}
) {
  return taskSelectors.getTasks(state.tasks, namespace);
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

export function getClusterTasks(state) {
  return clusterTaskSelectors.getClusterTasks(state.clusterTasks);
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

export function getSecrets(
  state,
  { namespace = getSelectedNamespace(state) } = {}
) {
  return secretSelectors.getSecrets(state.secrets, namespace);
}

export function getSecretsErrorMessage(state) {
  return secretSelectors.getSecretsErrorMessage(state.secrets);
}

export function getCreateSecretsSuccessMessage(state) {
  return secretSelectors.getCreateSecretsSuccessMessage(state.secrets);
}

export function getDeleteSecretsSuccessMessage(state) {
  return secretSelectors.getDeleteSecretsSuccessMessage(state.secrets);
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
  const templates = triggerTemplatesSelectors.getTriggerTemplates(
    state.triggerTemplates,
    namespace
  );
  return templates.filter(trigger => {
    return filters.every(filter => {
      const [filterKey, filterValue] = filter.split('=');
      return (
        trigger.metadata.labels &&
        filterKey &&
        filterValue &&
        trigger.metadata.labels[filterKey] === filterValue
      );
    });
  });
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
  const bindings = triggerBindingsSelectors.getTriggerBindings(
    state.triggerBindings,
    namespace
  );
  return bindings.filter(binding => {
    return filters.every(filter => {
      const [filterKey, filterValue] = filter.split('=');
      return (
        binding.metadata.labels &&
        filterKey &&
        filterValue &&
        binding.metadata.labels[filterKey] === filterValue
      );
    });
  });
}

export function getTriggerBinding(
  state,
  { name, namespace = getSelectedNamespace(state) }
) {
  return triggerBindingsSelectors.getTriggerTemplate(
    state.triggerBindings,
    name,
    namespace
  );
}

export function getTriggerBindingsErrorMessage(state) {
  return triggerBindingsSelectors.getTriggerBindingsErrorMessage(
    state.triggerBindings
  );
}

export function isFetchingTriggerBindings(state) {
  return triggerBindingsSelectors.isFetchingTriggerBindings(
    state.triggerBindings
  );
}
