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

import snakeCase from 'lodash.snakecase';

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

export function selectedTask(selectedTaskName, tasks) {
  return tasks.find(t => t.metadata.name === selectedTaskName);
}

export function selectedTaskRun(selectedTaskId, taskRuns = []) {
  return taskRuns.find(run => run.id === selectedTaskId);
}

export function sortRunsByStartTime(runs) {
  runs.sort((a, b) => {
    const aTime = a.status.startTime;
    const bTime = b.status.startTime;
    if (!aTime) {
      return -1;
    }
    if (!bTime) {
      return 1;
    }
    return -1 * aTime.localeCompare(bTime);
  });
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
  taskRunStepsStatus.forEach(stepStatus => {
    const { name: stepName, terminated } = stepStatus;
    const step = taskSteps.find(taskStep => taskStep.name === stepName);
    if (!step && terminated && terminated.exitCode !== 0) {
      steps.push({
        reason: terminated.reason,
        status: 'terminated',
        stepStatus,
        stepName,
        id: stepName
      });
    }
  });

  return steps;
}

export function typeToPlural(type) {
  return `${snakeCase(type).toUpperCase()}S`;
}
