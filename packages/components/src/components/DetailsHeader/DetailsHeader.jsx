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

import { Pending as DefaultIcon } from '@carbon/react/icons';
import { useIntl } from 'react-intl';
import { dashboardReasonSkipped, getStatus } from '@tektoncd/dashboard-utils';

import FormattedDuration from '../FormattedDuration';
import StatusIcon from '../StatusIcon';

export default function DetailsHeader({
  children,
  displayName,
  exitCode,
  hasWarning,
  reason,
  stepStatus,
  status,
  taskRun = {},
  type = 'step'
}) {
  const intl = useIntl();

  function getDuration() {
    let { completionTime: endTime, startTime } = taskRun.status || {};
    if (stepStatus) {
      ({ finishedAt: endTime, startedAt: startTime } =
        stepStatus.terminated || {});
    }
    if (!endTime) {
      endTime = new Date();
    }

    return (
      <span className="tkn--run-details-time">
        {startTime && new Date(startTime).getTime() !== 0
          ? intl.formatMessage(
              {
                id: 'dashboard.run.duration',
                defaultMessage: 'Duration: {duration}'
              },
              {
                duration: (
                  <FormattedDuration
                    milliseconds={
                      new Date(endTime).getTime() -
                      new Date(startTime).getTime()
                    }
                  />
                )
              }
            )
          : ' '}
      </span>
    );
  }

  function getStatusLabel() {
    const { reason: taskReason, status: taskStatus } = getStatus(taskRun);

    if (stepStatus?.terminationReason === 'Skipped') {
      return intl.formatMessage({
        id: 'dashboard.taskRun.status.skipped',
        defaultMessage: 'Skipped'
      });
    }

    if (
      status === 'cancelled' ||
      (status === 'terminated' &&
        (reason === 'TaskRunCancelled' || reason === 'TaskRunTimeout'))
    ) {
      return intl.formatMessage({
        id: 'dashboard.taskRun.status.cancelled',
        defaultMessage: 'Cancelled'
      });
    }

    if (status === 'running') {
      return intl.formatMessage({
        id: 'dashboard.taskRun.status.running',
        defaultMessage: 'Running'
      });
    }
    if (status === 'terminated') {
      if (reason === 'Completed') {
        return hasWarning
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

    if (taskStatus === 'Unknown' && taskReason === 'Pending') {
      return intl.formatMessage({
        id: 'dashboard.taskRun.status.waiting',
        defaultMessage: 'Waiting'
      });
    }
    // task is done, step did not run
    return intl.formatMessage({
      id: 'dashboard.taskRun.status.notRun',
      defaultMessage: 'Not run'
    });
  }

  let statusLabel;

  const duration = getDuration();

  let reasonToUse = reason;
  let statusToUse = status;

  if (type === 'taskRun') {
    ({ reason: reasonToUse, status: statusToUse } = getStatus(taskRun));
    statusLabel =
      reason === dashboardReasonSkipped
        ? intl.formatMessage({
            id: 'dashboard.taskRun.status.skipped',
            defaultMessage: 'Skipped'
          })
        : reasonToUse ||
          intl.formatMessage({
            id: 'dashboard.taskRun.status.pending',
            defaultMessage: 'Pending'
          });
  } else {
    statusLabel = getStatusLabel();
  }

  return (
    <header
      className="tkn--step-details-header"
      data-status={statusToUse}
      data-reason={reasonToUse}
      data-termination-reason={stepStatus?.terminationReason}
    >
      <h2 className="tkn--details-header--heading">
        <StatusIcon
          DefaultIcon={props => <DefaultIcon size={24} {...props} />}
          hasWarning={hasWarning}
          reason={reason === dashboardReasonSkipped ? reason : reasonToUse}
          status={statusToUse}
          {...(type === 'step'
            ? {
                terminationReason: stepStatus?.terminationReason,
                type: 'inverse'
              }
            : null)}
        />
        <span className="tkn--run-details-name" title={displayName}>
          {displayName}
        </span>
        <span className="tkn--status-label">{statusLabel}</span>
        {children}
      </h2>
      {duration}
    </header>
  );
}
