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

import React from 'react';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { StatusIcon } from '@tektoncd/dashboard-components';
import { getStatus, urls } from '@tektoncd/dashboard-utils';

import { FormattedDate, FormattedDuration, RunDropdown, Table } from '..';

const TaskRuns = ({
  createTaskRunURL = urls.taskRuns.byName,
  createTaskRunsDisplayName = ({ taskRunMetadata }) => taskRunMetadata.name,
  createTaskRunsByTaskURL = urls.taskRuns.byTask,
  getTaskRunStatus = (taskRun, intl) => {
    const { reason } = getStatus(taskRun);
    return (
      reason ||
      intl.formatMessage({
        id: 'dashboard.taskRuns.status.pending',
        defaultMessage: 'Pending'
      })
    );
  },
  getTaskRunStatusIcon = taskRun => {
    const { reason, status } = getStatus(taskRun);
    return <StatusIcon reason={reason} status={status} />;
  },
  getTaskRunStatusTooltip = (taskRun, intl) => {
    const { message } = getStatus(taskRun);
    const reason = getTaskRunStatus(taskRun, intl);
    if (!message) {
      return reason;
    }
    return `${reason}: ${message}`;
  },
  intl,
  loading,
  selectedNamespace,
  taskRuns,
  taskRunActions = []
}) => {
  const headers = [
    {
      key: 'status',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.status',
        defaultMessage: 'Status'
      })
    },
    {
      key: 'name',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.name',
        defaultMessage: 'Name'
      })
    },
    {
      key: 'task',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.task',
        defaultMessage: 'Task'
      })
    },
    {
      key: 'namespace',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.namespace',
        defaultMessage: 'Namespace'
      })
    },
    {
      key: 'createdTime',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.createdTime',
        defaultMessage: 'Created'
      })
    },
    {
      key: 'duration',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.duration',
        defaultMessage: 'Duration'
      })
    }
  ];

  if (taskRunActions.length) {
    headers.push({ key: 'actions', header: '' });
  }

  const taskRunsFormatted = taskRuns.map(taskRun => {
    const { creationTimestamp, namespace } = taskRun.metadata;
    const taskRunName = createTaskRunsDisplayName({
      taskRunMetadata: taskRun.metadata
    });
    const taskRefName = taskRun.spec.taskRef && taskRun.spec.taskRef.name;
    const { lastTransitionTime, reason, status } = getStatus(taskRun);
    const statusIcon = getTaskRunStatusIcon(taskRun);
    const url = createTaskRunURL({
      namespace,
      taskRunName
    });

    let endTime = Date.now();
    if (status === 'False' || status === 'True') {
      endTime = new Date(lastTransitionTime).getTime();
    }

    const duration = (
      <FormattedDuration
        milliseconds={endTime - new Date(creationTimestamp).getTime()}
      />
    );

    return {
      id: taskRun.metadata.uid,
      name: url ? (
        <Link to={url} title={taskRunName}>
          {taskRunName}
        </Link>
      ) : (
        taskRunName
      ),
      task: taskRefName ? (
        <Link
          to={createTaskRunsByTaskURL({
            namespace,
            taskName: taskRefName
          })}
          title={taskRefName}
        >
          {taskRefName}
        </Link>
      ) : (
        ''
      ),
      namespace: taskRun.metadata.namespace,
      status: (
        <div className="definition">
          <div
            className="status"
            data-reason={reason}
            data-status={status}
            title={getTaskRunStatusTooltip(taskRun, intl)}
          >
            {statusIcon}
          </div>
        </div>
      ),
      createdTime: (
        <FormattedDate date={taskRun.metadata.creationTimestamp} relative />
      ),
      duration,
      actions: <RunDropdown items={taskRunActions} resource={taskRun} />
    };
  });

  return (
    <Table
      headers={headers}
      rows={taskRunsFormatted}
      loading={loading}
      emptyTextAllNamespaces={intl.formatMessage(
        {
          id: 'dashboard.emptyState.allNamespaces',
          defaultMessage: 'No {kind} in any namespace.'
        },
        { kind: 'TaskRuns' }
      )}
      emptyTextSelectedNamespace={intl.formatMessage(
        {
          id: 'dashboard.emptyState.selectedNamespace',
          defaultMessage: 'No {kind} in namespace {selectedNamespace}'
        },
        { kind: 'TaskRuns', selectedNamespace }
      )}
      selectedNamespace={selectedNamespace}
    />
  );
};

export default injectIntl(TaskRuns);
