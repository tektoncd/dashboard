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

import React, { Component } from 'react';
import CheckmarkFilled from '@carbon/icons-react/lib/checkmark--filled/24';
import ChevronRight from '@carbon/icons-react/lib/chevron--right/24';
import CloseFilled from '@carbon/icons-react/lib/close--filled/16';

import Spinner from '../Spinner';
import { getStatus } from '../../utils';

import './StepDetailsHeader.scss';

class StepDetailsHeader extends Component {
  icon() {
    const { reason, status } = this.props;

    if (status === 'running') {
      return <Spinner className="status-icon" />;
    }

    let Icon = ChevronRight;
    if (status === 'terminated') {
      if (reason === 'Completed') {
        Icon = CheckmarkFilled;
      } else {
        Icon = CloseFilled;
      }
    }

    return <Icon className="status-icon" />;
  }

  statusLabel() {
    const { labels, reason, status, taskRun } = this.props;
    const { running, succeeded, failed, waiting, notRun } = labels;

    if (status === 'running') {
      return running;
    }
    if (status === 'terminated') {
      if (reason === 'Completed') {
        return succeeded;
      }
      return failed;
    }
    // no status, task still running means waiting
    const { reason: taskReason, status: taskStatus } = getStatus(taskRun);
    if (taskStatus === 'Unknown' && taskReason === 'Pending') {
      return waiting;
    }
    // task is done, step did not run
    return notRun;
  }

  render() {
    const { reason, status, stepName } = this.props;
    const icon = this.icon();
    const statusLabel = this.statusLabel();

    return (
      <header
        className="step-details-header"
        data-status={status}
        data-reason={reason}
      >
        <h2>
          {icon}
          {stepName}
          <span className="status-label">{statusLabel}</span>
        </h2>
      </header>
    );
  }
}

StepDetailsHeader.defaultProps = {
  labels: {
    failed: 'Failed',
    notRun: 'Not run',
    running: 'Running',
    succeeded: 'Completed',
    waiting: 'Waiting'
  },
  taskRun: {}
};

export default StepDetailsHeader;
