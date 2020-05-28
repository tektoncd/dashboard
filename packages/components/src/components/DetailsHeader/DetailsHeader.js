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

import React, { Component } from 'react';
import {
  CheckmarkFilled24 as CheckmarkFilled,
  ChevronRight24 as ChevronRight,
  CloseFilled16 as CloseFilled
} from '@carbon/icons-react';
import { injectIntl } from 'react-intl';
import { getStatus } from '@tektoncd/dashboard-utils';

import { Spinner, StatusIcon } from '..';

import './DetailsHeader.scss';

class DetailsHeader extends Component {
  icon() {
    const { reason, status } = this.props;

    if (status === 'cancelled') {
      return <CloseFilled className="tkn--status-icon" />;
    }

    if (status === 'running') {
      return <Spinner className="tkn--status-icon" />;
    }

    let Icon = ChevronRight;
    if (status === 'terminated') {
      if (reason === 'Completed') {
        Icon = CheckmarkFilled;
      } else {
        Icon = CloseFilled;
      }
    }

    return <Icon className="tkn--status-icon" />;
  }

  statusLabel() {
    const { intl, reason, status, taskRun } = this.props;
    const { reason: taskReason, status: taskStatus } = getStatus(taskRun);

    if (status === 'cancelled') {
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
        return intl.formatMessage({
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

  render() {
    const { stepName, taskRun, type = 'step', intl } = this.props;
    let { reason, status } = this.props;
    let icon;
    let statusLabel;

    if (type === 'taskRun') {
      ({ reason, succeeded: status } = taskRun);
      icon = <StatusIcon reason={reason} status={status} />;
      statusLabel =
        reason ||
        intl.formatMessage({
          id: 'dashboard.taskRuns.status.pending',
          defaultMessage: 'Pending'
        });
    } else {
      icon = this.icon();
      statusLabel = this.statusLabel();
    }
    return (
      <header
        className="tkn--step-details-header"
        data-status={status}
        data-reason={reason}
      >
        <h2>
          {icon}
          <span className="tkn--run-details-name" title={stepName}>
            {stepName}
          </span>
          <span className="tkn--status-label">{statusLabel}</span>
        </h2>
      </header>
    );
  }
}

DetailsHeader.defaultProps = {
  taskRun: {}
};

export default injectIntl(DetailsHeader);
