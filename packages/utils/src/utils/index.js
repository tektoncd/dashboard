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

export { default as buildGraphData } from './buildGraphData';
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

export function getTitle({ page, resourceName }) {
  const pageTitle = page + (resourceName ? ` - ${resourceName}` : '');
  return `Tekton Dashboard | ${pageTitle}`;
}

export function selectedTask(selectedTaskName, tasks) {
  if (tasks) {
    return tasks.find(t => t.metadata.name === selectedTaskName);
  }
  return {};
}

export function selectedTaskRun(selectedTaskId, taskRuns = []) {
  return taskRuns.find(run => run.id === selectedTaskId);
}

export function taskRunStep(selectedStepId, taskRun) {
  if (!taskRun || !taskRun.steps) {
    return {};
  }
  const step = taskRun.steps.find(s => s.id === selectedStepId);
  if (!step) {
    return {};
  }

  const { stepName, stepStatus, status, reason, ...definition } = step;

  return {
    definition,
    reason,
    stepName,
    stepStatus,
    status
  };
}

export function stepsStatus(taskSteps, taskRunStepsStatus = []) {
  const steps = taskSteps.map(step => {
    const stepStatus =
      taskRunStepsStatus.find(status => status.name === step.name) || {};

    let status;
    let reason;
    if (stepStatus.terminated) {
      status = 'terminated';
      ({ reason } = stepStatus.terminated);
    } else if (stepStatus.running) {
      status = 'running';
    } else if (stepStatus.waiting) {
      status = 'waiting';
    }

    return {
      ...step,
      reason,
      status,
      stepStatus,
      stepName: step.name,
      id: step.name
    };
  });

  /*
    In case of failure in an init step (git-source, init-creds, etc.),
    include that step in the displayed list so we can surface status
    and logs to aid the user in debugging.
   */
  const failedInitSteps = [];
  taskRunStepsStatus.forEach(stepStatus => {
    const { name: stepName, terminated } = stepStatus;
    const step = taskSteps.find(taskStep => taskStep.name === stepName);
    if (!step && terminated && terminated.exitCode !== 0) {
      failedInitSteps.push({
        reason: terminated.reason,
        status: 'terminated',
        stepStatus,
        stepName,
        id: stepName
      });
    }
  });

  return failedInitSteps.concat(steps);
}

/*
  When steps are retreived from a TaskRun's status, their order is not guaranteed.
  This function reorders the given unorderedSteps to match the order specified by the given orderedSteps.
  Each step in unorderedSteps must have the same name as a step in the orderedSteps.
  Unnamed steps are automatically given the name 'unnamed-NUM' where NUM is the step number starting from 0.
    ex: 'unnamed-2' is the 3rd step
  None of the unorderedSteps will have an empty name, but some of the orderedSteps may have empty names.
*/
export function reorderSteps(unorderedSteps, orderedSteps) {
  if (!unorderedSteps || !orderedSteps) {
    return [];
  }

  const unnamedSteps = unorderedSteps
    .filter(({ name }) => name.startsWith('unnamed-'))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  return orderedSteps.map(({ name, ...rest }) => {
    const stepStatus = name
      ? unorderedSteps.find(step => step.name === name)
      : unnamedSteps.shift();
    return {
      name,
      ...rest,
      ...stepStatus
    };
  });
}

export function isRunning(reason, status) {
  return status === 'Unknown' && reason === 'Running';
}

// Generates a unique id
export function generateId(prefix) {
  return `${prefix}${Math.random()
    .toString(36)
    .substr(2, 9)}`;
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

// Sorts the steps by finishedAt and startedAt timestamps
export function sortStepsByTimestamp(steps) {
  return steps.sort((i, j) => {
    const iFinishAt = new Date(i.stepStatus?.terminated?.finishedAt).getTime();
    const jFinishAt = new Date(j.stepStatus?.terminated?.finishedAt).getTime();
    const iStartedAt = new Date(i.stepStatus?.terminated?.startedAt).getTime();
    const jStartedAt = new Date(j.stepStatus?.terminated?.startedAt).getTime();

    if (!iFinishAt || !jFinishAt) {
      return 0;
    }
    if (iFinishAt !== jFinishAt) {
      return iFinishAt - jFinishAt;
    }
    if (!iStartedAt || !jStartedAt) {
      return 0;
    }
    return iStartedAt - jStartedAt;
  });
}

// Update the status of steps that follow a step with an error
export function updateUnexecutedSteps(steps) {
  if (!steps) {
    return steps;
  }
  let errorIndex = steps.length - 1;
  return sortStepsByTimestamp(steps).map((step, index) => {
    // Update errorIndex
    if (step.reason !== 'Completed') {
      errorIndex = Math.min(index, errorIndex);
    }
    // Update step
    if (index > errorIndex) {
      const s = {
        ...step,
        reason: '',
        status: ''
      };
      if (step.stepStatus && step.stepStatus.terminated) {
        s.stepStatus = {
          ...step.stepStatus,
          terminated: { ...step.stepStatus.terminated, reason: '' }
        };
      }
      return s;
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
