/*
Copyright 2025-2026 The Tekton Authors
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

import { useIntl } from 'react-intl';
import { Pending as DefaultIcon } from '@carbon/react/icons';
import {
  getStepDefinition,
  getStepStatusReason,
  updateUnexecutedSteps
} from '@tektoncd/dashboard-utils';

import AccordionItem from '../AccordionItem';
import StatusIcon from '../StatusIcon';
import FormattedDuration from '../FormattedDuration';
import StepDefinition from '../StepDefinition';

export function getStepData({ isSidecar, reason, selectedStepId, steps }) {
  // sidecars run in parallel to the regular steps, so keep their actual status
  const stepsToUse = isSidecar ? steps : updateUnexecutedSteps(steps);
  const step = stepsToUse.find(
    stepToCheck => stepToCheck.name === selectedStepId
  );
  if (!step) {
    return null;
  }

  let hasWarning = false;
  const { name, terminationReason } = step;
  const { exitCode, status, reason: stepReason } = getStepStatusReason(step);

  if (stepReason === 'Completed') {
    hasWarning = hasWarning || exitCode !== 0;
  }

  const selected = selectedStepId === name;
  const stepStatus =
    reason === 'TaskRunCancelled' && status !== 'terminated'
      ? 'cancelled'
      : status;

  return {
    exitCode,
    hasWarning,
    name,
    selected,
    stepReason,
    stepStatus,
    terminationReason
  };
}

function TaskRunStep({
  expandedSteps,
  getLogContainer,
  isSidecar,
  onStepSelected,
  selectedRetry,
  selectedTaskId,
  step,
  steps,
  task,
  taskRun,
  taskRunReason
}) {
  const intl = useIntl();
  const stepNamePrefix = isSidecar ? 'sidecar:' : '';

  let duration;
  if (step.terminated && step.terminationReason !== 'Skipped') {
    const { finishedAt, startedAt } = step.terminated;

    if (finishedAt && startedAt && new Date(startedAt).getTime() !== 0) {
      duration = (
        <FormattedDuration
          milliseconds={
            new Date(finishedAt).getTime() - new Date(startedAt).getTime()
          }
        />
      );
    }
  }

  const stepData = getStepData({
    isSidecar,
    reason: taskRunReason,
    selectedStepId: step.name,
    steps
  });

  const { exitCode, stepReason, stepStatus, terminationReason } = stepData;

  function getStatusLabel() {
    if (terminationReason === 'Skipped') {
      return intl.formatMessage({
        id: 'dashboard.taskRun.status.skipped',
        defaultMessage: 'Skipped'
      });
    }
    if (
      stepStatus === 'cancelled' ||
      (stepStatus === 'terminated' &&
        (stepReason === 'TaskRunCancelled' || stepReason === 'TaskRunTimeout'))
    ) {
      return intl.formatMessage({
        id: 'dashboard.taskRun.status.cancelled',
        defaultMessage: 'Cancelled'
      });
    }

    if (stepStatus === 'running') {
      return intl.formatMessage({
        id: 'dashboard.taskRun.status.running',
        defaultMessage: 'Running'
      });
    }

    if (stepStatus === 'terminated') {
      if (stepReason === 'Completed') {
        return exitCode !== 0
          ? intl.formatMessage(
              {
                id: 'dashboard.taskRun.status.succeeded.warning',
                defaultMessage: 'Completed with exit code {exitCode}'
              },
              { exitCode }
            )
          : intl.formatMessage({
              id: 'dashboard.taskRun.status.succeeded',
              defaultMessage: 'Completed'
            });
      }
      return intl.formatMessage({
        id: 'dashboard.taskRun.status.failed',
        defaultMessage: 'Failed'
      });
    }

    if (stepStatus === 'waiting') {
      return intl.formatMessage({
        id: 'dashboard.taskRun.status.waiting',
        defaultMessage: 'Waiting'
      });
    }

    return intl.formatMessage({
      id: 'dashboard.taskRun.status.notRun',
      defaultMessage: 'Not run'
    });
  }

  const statusLabel = getStatusLabel();
  const stepDefinition = getStepDefinition({
    isSidecar,
    selectedStepId: step.name,
    task,
    taskRun
  });
  const stepDisplayName = stepDefinition?.displayName || step.name;
  const displayName = isSidecar
    ? intl.formatMessage(
        {
          id: 'dashboard.taskRun.sidecar',
          defaultMessage: 'Sidecar: {name}'
        },
        { name: stepDisplayName }
      )
    : stepDisplayName;

  return (
    <AccordionItem
      className="tkn--step"
      data-status={stepStatus}
      data-reason={stepReason}
      data-termination-reason={terminationReason}
      open={expandedSteps[`${stepNamePrefix}${step.name}`]}
      onHeadingClick={({ isOpen }) => {
        onStepSelected({
          isOpen,
          selectedRetry,
          selectedStepId: `${stepNamePrefix}${step.name}`,
          selectedTaskId,
          taskRunName: taskRun.metadata?.name
        });
      }}
      title={
        <>
          <StatusIcon
            DefaultIcon={props => <DefaultIcon {...props} />}
            hasWarning={exitCode !== 0}
            reason={stepReason}
            status={stepStatus}
            terminationReason={terminationReason}
            title={statusLabel}
            type="inverse"
          />
          <span className="tkn--step-name" title={displayName}>
            {displayName}
          </span>
          {!isSidecar ? (
            <span className="tkn--step-duration">{duration}</span>
          ) : null}
        </>
      }
    >
      {expandedSteps[`${stepNamePrefix}${step.name}`] ? (
        <>
          <details className="tkn--step-definition">
            <summary>
              {intl.formatMessage({
                id: 'dashboard.step.definition',
                defaultMessage: 'Definition'
              })}
            </summary>

            <StepDefinition definition={stepDefinition} />
          </details>
          {getLogContainer({
            disableLogsToolbar: true,
            isSidecar,
            stepName: step.name,
            stepStatus: step,
            taskRun
          })}
        </>
      ) : null}
    </AccordionItem>
  );
}

export default TaskRunStep;
