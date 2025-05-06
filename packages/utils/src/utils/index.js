/*
Copyright 2019-2025 The Tekton Authors
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
/* eslint-disable import/extensions */

// Include .js extension in imports/exports to solve ES Modules and CommonJS
// problem when importing dashboard-utils
import { labels as labelConstants } from './constants.js';
import { getStatus } from './status.js';

export * from './constants.js';
export * from './hooks.js';
export { paths, urls } from './router.js';
export { getStatus } from './status.js';

export const ALL_NAMESPACES = '*';

export function classNames(...args) {
  const classes = [];
  args.forEach(arg => {
    if (!arg) {
      return;
    }

    const argType = typeof arg;

    if (argType === 'string') {
      classes.push(arg);
    } else if (argType === 'object') {
      Object.keys(arg).forEach(key => {
        if (arg[key]) {
          classes.push(key);
        }
      });
    }
  });
  return classes.join(' ');
}

/* istanbul ignore next */
export const copyToClipboard = text => {
  navigator.clipboard?.writeText(text);
};

export function getErrorMessage(error) {
  if (!error || typeof error === 'string') {
    return error;
  }

  return (
    error.message || JSON.stringify(error, Object.getOwnPropertyNames(error))
  );
}

function mergeContainerField({
  definition,
  field,
  mergeKey,
  step,
  stepTemplate
}) {
  let items = stepTemplate[field];
  if (!items) {
    return;
  }
  items = [...items]; // make a copy so we don't modify stepTemplate

  const stepItems = step[field];
  (stepItems || []).forEach(stepItem => {
    const matchIndex = items.findIndex(
      candidate => candidate[mergeKey] === stepItem[mergeKey]
    );
    if (matchIndex !== -1) {
      items[matchIndex] = stepItem;
    } else {
      items.push(stepItem);
    }
  });

  definition[field] = items; // eslint-disable-line no-param-reassign
}

export function applyStepTemplate({ step, stepTemplate }) {
  if (!step || !stepTemplate) {
    return step;
  }

  const definition = {
    ...stepTemplate,
    ...step
  };

  [
    {
      field: 'ports',
      mergeKey: 'containerPort'
    },
    {
      field: 'env',
      mergeKey: 'name'
    },
    {
      field: 'volumeMounts',
      mergeKey: 'mountPath'
    },
    {
      field: 'volumeDevices',
      mergeKey: 'devicePath'
    }
  ].forEach(({ field, mergeKey }) =>
    mergeContainerField({ definition, field, mergeKey, step, stepTemplate })
  );

  return definition;
}

export function getStepDefinition({ selectedStepId, task, taskRun }) {
  if (!selectedStepId) {
    return null;
  }

  const stepTemplate =
    taskRun.status?.taskSpec?.stepTemplate ||
    taskRun.spec?.taskSpec?.stepTemplate ||
    task?.spec?.stepTemplate;

  let stepDefinitions = [];
  if (taskRun.status?.taskSpec?.steps) {
    stepDefinitions = taskRun.status.taskSpec.steps;
  } else if (taskRun.spec?.taskSpec?.steps) {
    stepDefinitions = taskRun.spec.taskSpec.steps;
  } else if (task?.spec?.steps) {
    stepDefinitions = task.spec.steps;
  }

  const definition = stepDefinitions?.find(
    step => step.name === selectedStepId
  );

  if (definition) {
    return applyStepTemplate({ step: definition, stepTemplate });
  }

  if (!taskRun.status) {
    return null;
  }

  // handle unnamed steps
  // unnamed step numbering skips named steps, so we could have for example:
  // ['unnamed-2', 'unnamed-4']
  // but the order will be consistent with unnamed steps in the definition
  const statusSteps =
    taskRun.status.steps?.filter(({ name }) => name.startsWith('unnamed-')) ||
    [];
  const unnamedSteps = stepDefinitions.filter(({ name }) => !name);

  const index = statusSteps.findIndex(({ name }) => name === selectedStepId);
  return applyStepTemplate({ step: unnamedSteps[index], stepTemplate });
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
  const exitCode = step?.terminated?.exitCode;
  if (step.terminated) {
    status = 'terminated';
    reason = step.terminated.reason;
  } else if (step.running) {
    status = 'running';
  } else if (step.waiting) {
    status = 'waiting';
  }
  return { exitCode, reason, status };
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
      (reason === 'Running' ||
        reason === 'PipelineRunStopping' ||
        reason === 'CancelledRunningFinally' ||
        reason === 'StoppedRunningFinally'))
  );
}

// Generates a unique id
export function generateId(prefix) {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
}

export function formatLabels(labels) {
  if (!labels) {
    return [];
  }

  return Object.entries(labels).map(([key, value]) => `${key}: ${value}`);
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

export function getAddFilterHandler({ location, navigate }) {
  return function handleAddFilter(labelFilters) {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('labelSelector', labelFilters);
    const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
    navigate(browserURL);
  };
}

export function getDeleteFilterHandler({ location, navigate }) {
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
    const browserURL = location.pathname.concat(
      queryString ? `?${queryString}` : ''
    );
    navigate(browserURL);
  };
}

export function getClearFiltersHandler({ location, navigate }) {
  return function handleClearFilters() {
    const queryParams = new URLSearchParams(location.search);
    queryParams.delete('labelSelector');
    const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
    navigate(browserURL);
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

export function getStatusFilterHandler({ location, navigate }) {
  return function setStatusFilter(statusFilter) {
    const queryParams = new URLSearchParams(location.search);
    if (!statusFilter) {
      queryParams.delete('status');
    } else {
      queryParams.set('status', statusFilter);
    }
    const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
    navigate(browserURL);
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
          reason !== 'Cancelled' &&
          reason !== 'TaskRunCancelled') ||
        (status === 'Unknown' && reason === 'PipelineRunCouldntCancel')
      );
    case 'cancelled':
      return (
        status === 'False' &&
        (reason === 'PipelineRunCancelled' ||
          reason === 'Cancelled' ||
          reason === 'TaskRunCancelled')
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
    getParams required to support 3rd-party consumers of certain dashboard
    components (e.g. PipelineRun) while they migrate to the Tekton beta

    Support both the Pipelines beta (0.11+) structure
      {
        params: ...
      }
    and the older alpha (<0.11) structure
      {
        inputs: {
          params: ...,
        }
      }
 */
export function getParams({ params, inputs }) {
  return params || (inputs && inputs.params);
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

export function getTaskSpecFromTaskRef({ pipelineTask, tasks }) {
  if (!pipelineTask.taskRef) {
    return {};
  }

  const definition = (tasks || []).find(
    task => task.metadata.name === pipelineTask.taskRef.name
  );

  return definition?.spec || {};
}

export function getPlaceholderTaskRun({ pipelineTask, tasks }) {
  const { name: pipelineTaskName, taskSpec } = pipelineTask;
  const specToDisplay =
    taskSpec || getTaskSpecFromTaskRef({ pipelineTask, tasks });
  const { steps = [] } = specToDisplay;

  return {
    metadata: {
      name: pipelineTaskName,
      labels: {
        [labelConstants.PIPELINE_TASK]: pipelineTaskName
      },
      uid: `_placeholder_${pipelineTaskName}`
    },
    spec: {
      taskSpec: specToDisplay
    },
    status: {
      steps: steps.map(({ name }) => ({ name }))
    }
  };
}

function addDashboardLabels({ displayName, pipelineTask, taskRun }) {
  const { description, displayName: pipelineTaskDisplayName } = pipelineTask;
  const displayNameToUse = displayName || pipelineTaskDisplayName;
  // eslint-disable-next-line no-param-reassign
  taskRun.metadata.labels = {
    ...taskRun.metadata.labels,
    ...(description
      ? {
          [labelConstants.DASHBOARD_DESCRIPTION]: description
        }
      : null),
    ...(displayNameToUse
      ? {
          [labelConstants.DASHBOARD_DISPLAY_NAME]: displayNameToUse
        }
      : null)
  };
  return taskRun;
}

export function getTaskRunsWithPlaceholders({
  pipeline,
  pipelineRun,
  taskRuns,
  tasks
}) {
  let pipelineTasks = [];
  const childReferences = pipelineRun?.status?.childReferences || [];

  if (pipelineRun?.status?.pipelineSpec?.tasks) {
    pipelineTasks = pipelineTasks.concat(pipelineRun.status.pipelineSpec.tasks);
  } else {
    pipelineTasks = pipelineTasks
      .concat(pipeline?.spec?.tasks)
      .concat(pipelineRun?.spec?.pipelineSpec?.tasks);
  }
  if (pipelineRun?.status?.pipelineSpec?.finally) {
    pipelineTasks = pipelineTasks.concat(
      pipelineRun.status.pipelineSpec.finally
    );
  } else {
    pipelineTasks = pipelineTasks
      .concat(pipeline?.spec?.finally)
      .concat(pipelineRun?.spec?.pipelineSpec?.finally);
  }
  pipelineTasks = pipelineTasks.filter(Boolean);

  const taskRunsToDisplay = [];
  pipelineTasks.forEach(pipelineTask => {
    const realTaskRuns = taskRuns.filter(
      taskRun =>
        taskRun.metadata.labels?.[labelConstants.PIPELINE_TASK] ===
        pipelineTask.name
    );

    const displayNames = childReferences.reduce((acc, childReference) => {
      if (
        childReference.displayName &&
        childReference.pipelineTaskName === pipelineTask.name
      ) {
        acc[childReference.name] = childReference.displayName;
      }
      return acc;
    }, {});
    const taskRunsToSort = [];
    realTaskRuns.forEach(taskRun => {
      taskRunsToSort.push(
        addDashboardLabels({
          displayName: displayNames[taskRun.metadata.name],
          pipelineTask,
          taskRun
        })
      );
    });
    if (taskRunsToSort.length) {
      // sort by display name to provide a stable order in the UI
      // if there's no display name stick with the source order
      if (
        taskRunsToSort[0].metadata.labels[labelConstants.DASHBOARD_DISPLAY_NAME]
      ) {
        // sort only if at least one of the TaskRuns has a display name,
        // it's likely they all do in that case (e.g. matrix TaskRuns)
        taskRunsToSort.sort((taskRunA, taskRunB) => {
          const displayNameA =
            taskRunA.metadata.labels[labelConstants.DASHBOARD_DISPLAY_NAME];
          const displayNameB =
            taskRunB.metadata.labels[labelConstants.DASHBOARD_DISPLAY_NAME];
          return displayNameA.localeCompare(displayNameB);
        });
      }
      taskRunsToDisplay.push(...taskRunsToSort);
    } else {
      taskRunsToDisplay.push(
        addDashboardLabels({
          pipelineTask,
          taskRun: getPlaceholderTaskRun({ pipelineTask, tasks })
        })
      );
    }
  });

  return taskRunsToDisplay;
}

export function taskRunHasWarning(taskRun) {
  const { reason, status } = getStatus(taskRun);
  if (status !== 'True' || reason !== 'Succeeded') {
    return false;
  }

  const onErrorContinueStep = taskRun.status?.steps?.find(
    step =>
      step.terminated?.reason === 'Completed' && step.terminated?.exitCode !== 0
  );
  return !!onErrorContinueStep;
}
