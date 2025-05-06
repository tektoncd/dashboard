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

import { useIntl } from 'react-intl';
import {
  Calendar as CalendarIcon,
  Time as TimeIcon,
  Lightning as TriggersIcon
} from '@carbon/react/icons';
import { getStatus, taskRunHasWarning, urls } from '@tektoncd/dashboard-utils';

import Actions from '../Actions';
import FormattedDate from '../FormattedDate';
import FormattedDuration from '../FormattedDuration';
import Link from '../Link';
import StatusIcon from '../StatusIcon';
import Table from '../Table';

const TaskRuns = ({
  batchActionButtons = [],
  filters,
  getRunActions = () => [],
  getTaskRunsDisplayName = ({ taskRunMetadata }) => taskRunMetadata.name,
  getTaskRunsURL = ({ namespace, taskName }) =>
    urls.taskRuns.byTask({ namespace, taskName }),
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
  loading,
  selectedNamespace,
  taskRuns,
  toolbarButtons
}) => {
  const intl = useIntl();
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
    const {
      lastTransitionTime,
      reason,
      status,
      message: statusMessage
    } = getStatus(taskRun);
    const statusIcon = getTaskRunStatusIcon(taskRun);
    const taskRunURL = getTaskRunURL({
      name: taskRunName,
      namespace
    });

    const taskRunsURL =
      taskRefName &&
      getTaskRunsURL({
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
              <Link to={taskRunURL} title={taskRunName}>
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
              <Link to={taskRunsURL} title={taskRefName}>
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

export default TaskRuns;
