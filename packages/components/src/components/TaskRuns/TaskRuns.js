/*
Copyright 2019-2022 The Tekton Authors
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
  Calendar16 as CalendarIcon,
  Time16 as TimeIcon,
  Lightning16 as TriggersIcon
} from '@carbon/icons-react';
import { getStatus, taskRunHasWarning, urls } from '@tektoncd/dashboard-utils';

import {
  Actions,
  Link as CustomLink,
  FormattedDate,
  FormattedDuration,
  StatusIcon,
  Table
} from '..';

const TaskRuns = ({
  batchActionButtons = [],
  filters,
  getRunActions = () => [],
  getTaskRunsDisplayName = ({ taskRunMetadata }) => taskRunMetadata.name,
  getTaskRunsURL = ({ kind, namespace, taskName }) =>
    kind === 'ClusterTask'
      ? urls.taskRuns.byClusterTask({ taskName })
      : urls.taskRuns.byTask({ namespace, taskName }),
  getTaskRunStatus = (taskRun, intl) => {
    const { reason } = getStatus(taskRun);
    return (
      reason ||
      intl.formatMessage({
        id: 'dashboard.taskRun.status.pending',
        defaultMessage: 'Pending'
      })
    );
  },
  getTaskRunStatusIcon = taskRun => {
    const { reason, status } = getStatus(taskRun);
    return (
      <StatusIcon
        hasWarning={taskRunHasWarning(taskRun)}
        reason={reason}
        status={status}
      />
    );
  },
  getTaskRunStatusTooltip = (taskRun, intl) => {
    const { message } = getStatus(taskRun);
    const reason = getTaskRunStatus(taskRun, intl);
    if (!message) {
      return reason;
    }
    return `${reason}: ${message}`;
  },
  getTaskRunTriggerInfo = taskRun => {
    const { labels = {} } = taskRun.metadata;
    const eventListener = labels['triggers.tekton.dev/eventlistener'];
    const trigger = labels['triggers.tekton.dev/trigger'];
    const pipelineRun = labels['tekton.dev/pipelineRun'];
    if (!eventListener && !trigger && !pipelineRun) {
      return null;
    }

    if (pipelineRun) {
      return <span title={`PipelineRun: ${pipelineRun}`}>{pipelineRun}</span>;
    }

    return (
      <span
        title={`EventListener: ${eventListener || '-'}\nTrigger: ${
          trigger || '-'
        }`}
      >
        <TriggersIcon />
        {eventListener}
        {eventListener && trigger ? ' | ' : ''}
        {trigger}
      </span>
    );
  },
  getTaskRunURL = urls.taskRuns.byName,
  intl,
  loading,
  selectedNamespace,
  taskRuns,
  toolbarButtons
}) => {
  let hasRunActions = false;
  const headers = [
    {
      key: 'run',
      header: 'Run'
    },
    {
      key: 'status',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.status',
        defaultMessage: 'Status'
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
      key: 'time',
      header: ''
    }
  ];

  const taskRunsFormatted = taskRuns.map(taskRun => {
    const { creationTimestamp, namespace } = taskRun.metadata;
    const taskRunName = getTaskRunsDisplayName({
      taskRunMetadata: taskRun.metadata
    });
    const taskRefName = taskRun.spec.taskRef?.name;
    const taskRefKind = taskRun.spec.taskRef?.kind;
    const {
      lastTransitionTime,
      reason,
      status,
      message: statusMessage
    } = getStatus(taskRun);
    const statusIcon = getTaskRunStatusIcon(taskRun);
    const taskRunURL = getTaskRunURL({
      namespace,
      taskRunName
    });

    const taskRunsURL =
      taskRefName &&
      getTaskRunsURL({
        kind: taskRefKind,
        namespace,
        taskName: taskRefName
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

    const taskRunActions = getRunActions(taskRun);
    if (taskRunActions.length) {
      hasRunActions = true;
    }

    return {
      id: taskRun.metadata.uid,
      run: (
        <div>
          <span>
            {taskRunURL ? (
              <Link component={CustomLink} to={taskRunURL} title={taskRunName}>
                {taskRunName}
              </Link>
            ) : (
              taskRunName
            )}
          </span>
          <span className="tkn--table--sub">
            {getTaskRunTriggerInfo(taskRun)}&nbsp;
          </span>
        </div>
      ),
      task: (
        <div>
          <span>
            {taskRefName ? (
              <Link component={CustomLink} to={taskRunsURL} title={taskRefName}>
                {taskRefName}
              </Link>
            ) : (
              '-'
            )}
          </span>
          <span className="tkn--table--sub" title={`Namespace: ${namespace}`}>
            {namespace}
          </span>
        </div>
      ),
      status: (
        <div>
          <div className="tkn--definition">
            <div
              className="tkn--status"
              data-reason={reason}
              data-status={status}
              title={getTaskRunStatusTooltip(taskRun, intl)}
            >
              {statusIcon}
              {getTaskRunStatus(taskRun, intl)}
            </div>
          </div>
          {status === 'False' ? (
            <span className="tkn--table--sub" title={statusMessage}>
              {statusMessage}&nbsp;
            </span>
          ) : (
            <span className="tkn--table--sub">&nbsp;</span>
          )}
        </div>
      ),
      time: (
        <div>
          <span>
            <CalendarIcon />
            <FormattedDate
              date={taskRun.metadata.creationTimestamp}
              formatTooltip={formattedDate =>
                intl.formatMessage(
                  {
                    id: 'dashboard.resource.createdTime',
                    defaultMessage: 'Created: {created}'
                  },
                  {
                    created: formattedDate
                  }
                )
              }
            />
          </span>
          <div className="tkn--table--sub">
            <TimeIcon />
            {duration}
          </div>
        </div>
      ),
      actions: <Actions items={taskRunActions} resource={taskRun} />
    };
  });

  if (hasRunActions) {
    headers.push({ key: 'actions', header: '' });
  }

  return (
    <Table
      batchActionButtons={batchActionButtons}
      filters={filters}
      hasDetails
      headers={headers}
      loading={loading}
      rows={taskRunsFormatted}
      emptyTextAllNamespaces={intl.formatMessage(
        {
          id: 'dashboard.emptyState.allNamespaces',
          defaultMessage: 'No matching {kind} found'
        },
        { kind: 'TaskRuns' }
      )}
      emptyTextSelectedNamespace={intl.formatMessage(
        {
          id: 'dashboard.emptyState.selectedNamespace',
          defaultMessage:
            'No matching {kind} found in namespace {selectedNamespace}'
        },
        { kind: 'TaskRuns', selectedNamespace }
      )}
      selectedNamespace={selectedNamespace}
      toolbarButtons={toolbarButtons}
    />
  );
};

export default injectIntl(TaskRuns);
