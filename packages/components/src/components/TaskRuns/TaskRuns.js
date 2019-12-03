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

import React from 'react';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import {
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper
} from 'carbon-components-react';
import { getStatus, getStatusIcon, urls } from '@tektoncd/dashboard-utils';

import { FormattedDate, RunDropdown } from '..';

const TaskRuns = ({
  createTaskRunURL = urls.taskRuns.byName,
  createTaskRunsDisplayName = ({ taskRunMetadata }) => taskRunMetadata.name,
  createTaskRunTimestamp = taskRun => getStatus(taskRun).lastTransitionTime,
  createTaskRunsByTaskURL = urls.taskRuns.byTask,
  getTaskRunStatus = (taskRun, intl) =>
    taskRun.status && taskRun.status.conditions
      ? taskRun.status.conditions[0].message
      : intl.formatMessage({
          id: 'dashboard.taskRuns.status.pending',
          defaultMessage: 'Pending'
        }),
  getTaskRunStatusIcon = taskRun => {
    const { reason, status } = getStatus(taskRun);
    return getStatusIcon({ reason, status });
  },
  intl,
  taskRuns,
  taskRunActions
}) => (
  <StructuredListWrapper border selection>
    <StructuredListHead>
      <StructuredListRow head>
        <StructuredListCell head>TaskRun</StructuredListCell>
        <StructuredListCell head>Task</StructuredListCell>
        <StructuredListCell head>Namespace</StructuredListCell>
        <StructuredListCell head>
          {intl.formatMessage({
            id: 'dashboard.taskRuns.status',
            defaultMessage: 'Status'
          })}
        </StructuredListCell>
        <StructuredListCell head>
          {intl.formatMessage({
            id: 'dashboard.taskRuns.transitionTime',
            defaultMessage: 'Last Transition Time'
          })}
        </StructuredListCell>
        {taskRunActions && <StructuredListCell head />}
      </StructuredListRow>
    </StructuredListHead>
    <StructuredListBody>
      {!taskRuns.length && (
        <StructuredListRow>
          <StructuredListCell>
            <span>No TaskRuns</span>
          </StructuredListCell>
        </StructuredListRow>
      )}
      {taskRuns.map((taskRun, index) => {
        const { namespace } = taskRun.metadata;
        const taskRunName = createTaskRunsDisplayName({
          taskRunMetadata: taskRun.metadata
        });
        const taskRefName = taskRun.spec.taskRef.name;
        const { reason, status } = getStatus(taskRun);
        const statusIcon = getTaskRunStatusIcon(taskRun);
        const taskRunStatus = getTaskRunStatus(taskRun, intl);
        const url = createTaskRunURL({
          namespace,
          taskRunName
        });

        return (
          <StructuredListRow
            className="definition"
            key={taskRun.metadata.uid || index}
          >
            <StructuredListCell>
              {url ? <Link to={url}>{taskRunName}</Link> : taskRunName}
            </StructuredListCell>
            <StructuredListCell>
              {taskRefName ? (
                <Link
                  to={createTaskRunsByTaskURL({
                    namespace,
                    taskName: taskRefName
                  })}
                >
                  {taskRefName}
                </Link>
              ) : (
                ''
              )}
            </StructuredListCell>
            <StructuredListCell>{namespace}</StructuredListCell>
            <StructuredListCell
              className="status"
              data-reason={reason}
              data-status={status}
            >
              {statusIcon}
              {taskRunStatus}
            </StructuredListCell>
            <StructuredListCell>
              <FormattedDate date={createTaskRunTimestamp(taskRun)} relative />
            </StructuredListCell>
            {taskRunActions && (
              <StructuredListCell>
                <RunDropdown items={taskRunActions} resource={taskRun} />
              </StructuredListCell>
            )}
          </StructuredListRow>
        );
      })}
    </StructuredListBody>
  </StructuredListWrapper>
);

export default injectIntl(TaskRuns);
