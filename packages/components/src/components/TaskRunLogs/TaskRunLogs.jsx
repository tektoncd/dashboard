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
import { Accordion } from '@carbon/react';
import { getStatus } from '@tektoncd/dashboard-utils';

import TaskRunStep from '../TaskRunStep';

function TaskRunLogs({
  expandedSteps,
  getLogContainer,
  ignoredSidecars,
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
  const { sidecars, steps } = taskRun.status || {};
  const sidecarsToRender =
    sidecars?.filter(sidecar => !ignoredSidecars[sidecar.name]) || [];

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
      <span className="tkn--task-skipped">
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
      {steps.map(step => (
        <TaskRunStep
          expandedSteps={{
            ...expandedSteps,
            // automatically expand the step when there's only one
            ...(steps.length === 1 ? { [step.name]: true } : null)
          }}
          getLogContainer={getLogContainer}
          key={step.name}
          onStepSelected={onStepSelected}
          selectedRetry={selectedRetry}
          selectedTaskId={selectedTaskId}
          taskRunReason={reason}
          step={step}
          steps={steps}
          task={task}
          taskRun={taskRun}
        />
      ))}
      {sidecarsToRender.map(sidecar => (
        <TaskRunStep
          expandedSteps={expandedSteps}
          getLogContainer={getLogContainer}
          isSidecar
          key={sidecar.name}
          onStepSelected={onStepSelected}
          selectedRetry={selectedRetry}
          selectedTaskId={selectedTaskId}
          taskRunReason={reason}
          step={sidecar}
          steps={sidecars}
          task={task}
          taskRun={taskRun}
        />
      ))}
    </Accordion>
  );
}

export default TaskRunLogs;
