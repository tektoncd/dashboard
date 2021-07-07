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

import { labels as labelConstants } from './constants';
import { getStatus } from './status';

export { default as buildGraphData } from './buildGraphData';
export * from './constants';
export * from './hooks';
export { paths, urls } from './router';
export { getStatus } from './status';

export const ALL_NAMESPACES = '*';

/* istanbul ignore next */
export const copyToClipboard = text => {
  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'absolute';
  input.style.top = '-9999px';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
};

export function getErrorMessage(error) {
  if (!error || typeof error === 'string') {
    return error;
  }

  return (
    error.message || JSON.stringify(error, Object.getOwnPropertyNames(error))
  );
}

export function getStepDefinition({ selectedStepId, task, taskRun }) {
  if (!selectedStepId) {
    return null;
  }

  const stepDefinitions =
    (taskRun.spec?.taskSpec ? taskRun.spec.taskSpec.steps : task.spec?.steps) ||
    [];

  const definition = stepDefinitions?.find(
    step => step.name === selectedStepId
  );

  if (definition) {
    return definition;
  }

  if (!taskRun.status) {
    return null;
  }

  // handle unnamed steps
  // unnamed step numbering skips named steps, so we could have for example:
  // ['unnamed-2', 'unnamed-4']
  // but the order will be consistent with unnamed steps in the definition
  const statusSteps = taskRun.status.steps.filter(({ name }) =>
    name.startsWith('unnamed-')
  );
  const unnamedSteps = stepDefinitions.filter(({ name }) => !name);

  const index = statusSteps.findIndex(({ name }) => name === selectedStepId);
  return unnamedSteps[index];
}

export function getStepStatus({ selectedStepId, taskRun }) {
  return taskRun.status?.steps?.find(step => step.name === selectedStepId);
}

export function getStepStatusReason(step) {
  if (!step) {
    return {};
  }

  let status;
  let reason;
  if (step.terminated) {
    status = 'terminated';
    reason = step.terminated.reason;
  } else if (step.running) {
    status = 'running';
  } else if (step.waiting) {
    status = 'waiting';
  }
  return { reason, status };
}

export function isPending(reason, status) {
  return (
    !status ||
    (status === 'Unknown' &&
      (reason === 'Pending' || reason === 'PipelineRunPending'))
  );
}

export function isRunning(reason, status) {
  return (
    status === 'running' ||
    (status === 'Unknown' &&
      (reason === 'Running' || reason === 'PipelineRunStopping'))
  );
}

// Generates a unique id
export function generateId(prefix) {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
}

export function formatLabels(labelsRaw) {
  const labels = JSON.stringify(labelsRaw)
    .replace('{', '')
    .replace('}', '')
    .replace(/['"]+/g, '')
    .replace('$', '');

  const formattedLabelsToRender = [];
  const labelsSplitOnComma = labels.split(',');
  labelsSplitOnComma.forEach(label => {
    const [key, value] = label.split(':');
    formattedLabelsToRender.push(`${key}: ${value}`);
  });

  return formattedLabelsToRender;
}

// Update the status of steps that follow a step with an error or a running step
export function updateUnexecutedSteps(steps) {
  if (!steps) {
    return steps;
  }
  let errorIndex = steps.length - 1;
  return steps.map((step, index) => {
    if (!step.terminated || step.terminated.reason !== 'Completed') {
      errorIndex = Math.min(index, errorIndex);
    }
    if (index > errorIndex) {
      const { running, terminated, ...rest } = step;
      return { ...rest };
    }
    return step;
  });
}

export function getFilters({ search }) {
  const queryParams = new URLSearchParams(search);
  const filters = queryParams
    .getAll('labelSelector')
    .toString()
    .split(',')
    .filter(Boolean);
  return filters;
}

export function getAddFilterHandler({ history, location, match }) {
  return function handleAddFilter(labelFilters) {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('labelSelector', labelFilters);
    const browserURL = match.url.concat(`?${queryParams.toString()}`);
    history.push(browserURL);
  };
}

export function getDeleteFilterHandler({ history, location, match }) {
  return function handleDeleteFilter(filter) {
    const queryParams = new URLSearchParams(location.search);
    const labelFilters = queryParams.getAll('labelSelector');
    const labelFiltersArray = labelFilters.toString().split(',');
    const index = labelFiltersArray.indexOf(filter);
    labelFiltersArray.splice(index, 1);

    if (labelFiltersArray.length === 0) {
      queryParams.delete('labelSelector');
    } else {
      queryParams.set('labelSelector', labelFiltersArray);
    }
    const queryString = queryParams.toString();
    const browserURL = match.url.concat(queryString ? `?${queryString}` : '');
    history.push(browserURL);
  };
}

export function getClearFiltersHandler({ history, location, match }) {
  return function handleClearFilters() {
    const queryParams = new URLSearchParams(location.search);
    queryParams.delete('labelSelector');
    const browserURL = match.url.concat(`?${queryParams.toString()}`);
    history.push(browserURL);
  };
}

export const statusFilterOrder = [
  'running',
  'pending',
  'failed',
  'cancelled',
  'completed'
];

export function getStatusFilter({ search }) {
  const queryParams = new URLSearchParams(search);
  const status = queryParams.get('status');
  if (!statusFilterOrder.includes(status)) {
    return null;
  }
  return status;
}

export function getStatusFilterHandler({ history, location, match }) {
  return function setStatusFilter(statusFilter) {
    const queryParams = new URLSearchParams(location.search);
    if (!statusFilter) {
      queryParams.delete('status');
    } else {
      queryParams.set('status', statusFilter);
    }
    const browserURL = match.url.concat(`?${queryParams.toString()}`);
    history.push(browserURL);
  };
}

/* istanbul ignore next */
export function runMatchesStatusFilter({ run, statusFilter }) {
  if (!statusFilter) {
    return true;
  }

  const { reason, status } = getStatus(run);

  switch (statusFilter) {
    case 'running':
      return isRunning(reason, status);
    case 'pending':
      return isPending(reason, status);
    case 'failed':
      return (
        (status === 'False' &&
          reason !== 'PipelineRunCancelled' &&
          reason !== 'TaskRunCancelled') ||
        (status === 'Unknown' && reason === 'PipelineRunCouldntCancel')
      );
    case 'cancelled':
      return (
        status === 'False' &&
        (reason === 'PipelineRunCancelled' || reason === 'TaskRunCancelled')
      );
    case 'completed':
      return status === 'True';
    default:
      return true;
  }
}

const rerunIdentifier = '-r-';
export function getGenerateNamePrefixForRerun(name) {
  let root = name;
  if (name.includes(rerunIdentifier)) {
    root = name.substring(0, name.lastIndexOf(rerunIdentifier));
  }
  return `${root}${rerunIdentifier}`;
}

/*
    getParams and getResources below required to support 3rd-party consumers
    of certain dashboard components (e.g. PipelineRun) while they migrate to
    the Tekton beta.

    Support both the Pipelines beta (0.11+) structure
      {
        params: ...,
        resources: {
          inputs: ...,
          outputs: ...
        }
      }
    and the older alpha (<0.11) structure
      {
        inputs: {
          params: ...,
          resources: ...
        },
        outputs: {
          resources: ...
        }
      }
 */
export function getParams({ params, inputs }) {
  return params || (inputs && inputs.params);
}

export function getResources({ resources, inputs, outputs }) {
  if (resources) {
    return {
      inputResources: resources.inputs,
      outputResources: resources.outputs
    };
  }

  return {
    inputResources: inputs && inputs.resources,
    outputResources: outputs && outputs.resources
  };
}

/* istanbul ignore next */
export function getTranslateWithId(intl) {
  return function translateWithId(id) {
    switch (id) {
      case 'close.menu':
        return intl.formatMessage({
          id: 'carbon.listBoxMenuIcon.close.menu',
          defaultMessage: 'Close menu'
        });
      case 'open.menu':
        return intl.formatMessage({
          id: 'carbon.listBoxMenuIcon.open.menu',
          defaultMessage: 'Open menu'
        });
      case 'clear.all':
        return intl.formatMessage({
          id: 'carbon.listBoxSelection.clear.all',
          defaultMessage: 'Clear all selected items'
        });
      case 'clear.selection':
        return intl.formatMessage({
          id: 'carbon.listBoxSelection.clear.selection',
          defaultMessage: 'Clear selected item'
        });
      default:
        return '';
    }
  };
}

export function getTaskSpecFromTaskRef({ clusterTasks, pipelineTask, tasks }) {
  if (!pipelineTask.taskRef) {
    return {};
  }

  const definitions =
    pipelineTask.taskRef.kind === 'ClusterTask' ? clusterTasks : tasks;
  const definition = (definitions || []).find(
    task => task.metadata.name === pipelineTask.taskRef.name
  );

  return definition?.spec || {};
}

export function getPlaceholderTaskRun({
  clusterTasks,
  condition,
  pipelineTask,
  tasks
}) {
  const { name: pipelineTaskName, taskSpec } = pipelineTask;
  const specToDisplay =
    taskSpec || getTaskSpecFromTaskRef({ clusterTasks, pipelineTask, tasks });
  const { steps = [] } = specToDisplay;

  const displayName =
    pipelineTaskName + (condition ? `-${condition.conditionRef}` : '');

  return {
    metadata: {
      name: displayName,
      labels: {
        [labelConstants.PIPELINE_TASK]: pipelineTaskName,
        ...(condition && {
          [labelConstants.CONDITION_CHECK]: displayName,
          [labelConstants.CONDITION_NAME]: condition.conditionRef
        })
      },
      uid: `_placeholder_${displayName}`
    },
    spec: {
      taskSpec: specToDisplay
    },
    status: {
      steps: steps.map(({ name }) => ({ name }))
    }
  };
}

export function getTaskRunsWithPlaceholders({
  clusterTasks,
  pipeline,
  pipelineRun,
  taskRuns,
  tasks
}) {
  const pipelineTasks = []
    .concat(pipeline?.spec?.tasks)
    .concat(pipelineRun?.spec?.pipelineSpec?.tasks)
    .concat(pipeline?.spec?.finally)
    .concat(pipelineRun?.spec?.pipelineSpec?.finally)
    .filter(Boolean);

  const taskRunsToDisplay = [];
  pipelineTasks.forEach(pipelineTask => {
    if (pipelineTask.conditions) {
      pipelineTask.conditions.forEach(condition => {
        const conditionTaskRun = taskRuns.find(
          taskRun =>
            taskRun.metadata.labels?.[labelConstants.PIPELINE_TASK] ===
              pipelineTask.name &&
            taskRun.metadata.labels?.[labelConstants.CONDITION_NAME] ===
              condition.conditionRef
        );
        taskRunsToDisplay.push(
          conditionTaskRun || getPlaceholderTaskRun({ pipelineTask, condition })
        );
      });
    }

    const realTaskRun = taskRuns.find(
      taskRun =>
        taskRun.metadata.labels?.[labelConstants.PIPELINE_TASK] ===
          pipelineTask.name &&
        !taskRun.metadata.labels?.[labelConstants.CONDITION_CHECK]
    );

    taskRunsToDisplay.push(
      realTaskRun ||
        getPlaceholderTaskRun({ clusterTasks, pipelineTask, tasks })
    );
  });

  return taskRunsToDisplay;
}
