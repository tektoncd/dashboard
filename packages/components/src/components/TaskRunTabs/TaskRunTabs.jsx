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

import { Tab, TabListVertical, usePrefix } from '@carbon/react';
import { PendingFilled as DefaultIcon } from '@carbon/react/icons';
import {
  dashboardReasonSkipped,
  getStatus,
  getStepStatusReason,
  labels as labelConstants,
  updateUnexecutedSteps
} from '@tektoncd/dashboard-utils';
import StatusIcon from '../StatusIcon';
import FormattedDuration from '../FormattedDuration';

const defaults = {
  skippedTasks: [],
  taskRuns: []
};

export default function TaskRunTabs({
  preTaskRun,
  skippedTasks = defaults.skippedTasks,
  taskRuns = defaults.taskRuns
}) {
  const prefix = usePrefix();

  return (
    <TabListVertical activation="manual" className="tkn--task-list">
      {preTaskRun ? (
        <Tab id={preTaskRun.id}>
          <div className="tkn--task-title" title={preTaskRun.title}>
            {preTaskRun.icon}
            <span className="tkn--task-title--name">{preTaskRun.title}</span>
          </div>
          <div
            className={`${prefix}--tabs__nav-item-secondary-label tkn--task-duration`}
          >
            {preTaskRun.duration ? (
              <FormattedDuration milliseconds={preTaskRun.duration} />
            ) : (
              '-'
            )}
          </div>
        </Tab>
      ) : null}
      {taskRuns.map(taskRun => {
        const { uid, labels, name } = taskRun.metadata;
        const {
          [labelConstants.DASHBOARD_DISPLAY_NAME]: displayName,
          [labelConstants.PIPELINE_TASK]: pipelineTaskName
        } = labels;

        const title = displayName || pipelineTaskName || name;
        let duration;
        if (taskRun.status) {
          const createdTime = new Date(
            // use the resource creation to include total time for all retries
            taskRun.metadata.creationTimestamp
          ).getTime();
          const endTime = new Date(taskRun.status.completionTime).getTime();
          duration = endTime - createdTime;
        }

        const taskRunStatus = getStatus(taskRun);
        let { reason } = taskRunStatus;
        const { status } = taskRunStatus;
        const { steps } = taskRun.status || {};

        if (
          !reason &&
          skippedTasks.find(
            skippedTask => skippedTask.name === pipelineTaskName
          )
        ) {
          reason = dashboardReasonSkipped;
        }

        const hasWarning = updateUnexecutedSteps(steps)?.some(step => {
          const { exitCode, reason: stepReason } = getStepStatusReason(step);
          return stepReason === 'Completed' && exitCode !== 0;
        });

        return (
          <Tab
            className="tkn--task"
            data-has-warning={hasWarning}
            data-reason={reason}
            data-succeeded={status}
            id={pipelineTaskName}
            key={uid}
            title={title}
          >
            <div className="tkn--task-title" title={title}>
              <StatusIcon
                DefaultIcon={props => <DefaultIcon size={20} {...props} />}
                hasWarning={hasWarning}
                reason={reason}
                status={status}
              />
              <span className="tkn--task-title--name">{title}</span>
            </div>
            <div
              className={`${prefix}--tabs__nav-item-secondary-label tkn--task-duration`}
            >
              {duration ? <FormattedDuration milliseconds={duration} /> : '-'}
            </div>
          </Tab>
        );
      })}
    </TabListVertical>
  );
}
