/*
Copyright 2025 The Tekton Authors
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
/* istanbul ignore file */

import { useIntl } from 'react-intl';
import {
  Accordion,
  AccordionItem as CarbonAccordionItem,
  TabPanel,
  TabPanels
} from '@carbon/react';
import { Pending as DefaultIcon } from '@carbon/react/icons';
import {
  getStatus,
  getStepDefinition,
  getStepStatusReason
} from '@tektoncd/dashboard-utils';

import TaskRunDetails from '../TaskRunDetails';
import StatusIcon from '../StatusIcon';
import FormattedDuration from '../FormattedDuration';
import StepDefinition from '../StepDefinition';

function getStepData({ reason, selectedStepId, steps }) {
  const step = steps.find(stepToCheck => stepToCheck.name === selectedStepId);
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

function AccordionItem({ children, open, ...rest }) {
  return (
    <CarbonAccordionItem open={open} {...rest}>
      {open ? children : null}
    </CarbonAccordionItem>
  );
}

function Logs({
  expandedSteps,
  getLogContainer,
  onStepSelected,
  selectedRetry,
  selectedTaskId,
  skippedTask,
  task,
  taskRun
}) {
  const intl = useIntl();

  const taskRunStatus = getStatus(taskRun);
  const { reason } = taskRunStatus;
  const { steps } = taskRun.status || {};

  if (!steps) {
    return (
      <span>
        {intl.formatMessage({
          id: 'dashboard.taskRun.logs.unavailable',
          defaultMessage: 'No logs are available. See status for more details.'
        })}
      </span>
    );
  }
  if (skippedTask) {
    return (
      <span>
        {intl.formatMessage({
          id: 'dashboard.taskRun.logs.skipped',
          defaultMessage:
            'This step did not run as the task was skipped. See status for more details.'
        })}
      </span>
    );
  }

  return (
    <Accordion align="end" className="tkn--task-logs" ordered size="md">
      {steps.map(step => {
        let duration;
        if (step.terminated) {
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
          reason,
          selectedStepId: step.name,
          steps
        });

        const { exitCode, stepReason, stepStatus, terminationReason } =
          stepData;

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
              (reason === 'TaskRunCancelled' || reason === 'TaskRunTimeout'))
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
            if (reason === 'Completed') {
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

        return (
          <AccordionItem
            open={expandedSteps[step.name]}
            onHeadingClick={({ isOpen }) => {
              onStepSelected({
                isOpen,
                selectedRetry,
                selectedStepId: step.name,
                selectedTaskId,
                taskRunName: taskRun.metadata?.name
              });
            }}
            title={
              <>
                <StatusIcon
                  DefaultIcon={props => <DefaultIcon size={20} {...props} />}
                  hasWarning={exitCode !== 0}
                  reason={stepReason}
                  status={stepStatus}
                  terminationReason={terminationReason}
                  title={statusLabel}
                  type="inverse"
                />
                <span className="tkn--step-name">{step.name}</span>
                <span className="tkn--step-duration">{duration}</span>
              </>
            }
          >
            <details className="tkn--step-definition">
              <summary>
                {intl.formatMessage({
                  id: 'dashboard.step.definition',
                  defaultMessage: 'Definition'
                })}
              </summary>

              <StepDefinition
                definition={getStepDefinition({
                  selectedStepId: step.name,
                  task,
                  taskRun
                })}
              />
            </details>
            {getLogContainer({
              disableLogsToolbar: true,
              stepName: step.name,
              stepStatus: step,
              taskRun
            })}
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

const TaskRunTabPanels = ({
  expandedSteps,
  getLogContainer,
  getLogsToolbar,
  onRetryChange,
  onStepSelected,
  onViewChange,
  pod,
  preTaskRun,
  selectedIndex,
  selectedRetry,
  selectedStepId,
  selectedTaskId,
  skippedTask,
  task,
  taskRun: taskRunToUse,
  taskRuns,
  view
}) => {
  return (
    <TabPanels>
      {/* only render panel content when active */}
      {preTaskRun ? (
        <TabPanel>{selectedIndex === 0 ? preTaskRun.content : null}</TabPanel>
      ) : null}
      {taskRuns.map((taskRun, index) => (
        <TabPanel key={taskRun.metadata?.uid || index}>
          {selectedIndex === index + 1 ? (
            // taskRunToUse may include additional matrix / retry data
            <TaskRunDetails
              fullTaskRun={taskRun}
              getLogsToolbar={view === 'logs' && getLogsToolbar}
              logs={props => (
                <Logs
                  {...props}
                  expandedSteps={expandedSteps}
                  getLogContainer={getLogContainer}
                  onStepSelected={onStepSelected}
                  selectedRetry={selectedRetry}
                  selectedTaskId={selectedTaskId}
                  task={task}
                />
              )}
              onRetryChange={onRetryChange}
              onViewChange={onViewChange}
              pod={pod}
              selectedRetry={selectedRetry}
              selectedStepId={selectedStepId}
              skippedTask={skippedTask}
              task={task}
              taskRun={taskRunToUse}
              view={view}
            />
          ) : null}
        </TabPanel>
      ))}
    </TabPanels>
  );
};

export default TaskRunTabPanels;
