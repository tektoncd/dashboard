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
import { injectIntl } from 'react-intl';
import CheckmarkFilled from '@carbon/icons-react/lib/checkmark--filled/16';
import ChevronRight from '@carbon/icons-react/lib/chevron--right/16';
import CloseFilled from '@carbon/icons-react/lib/close--filled/16';

import Spinner from '../Spinner';

import './Step.scss';

class Step extends Component {
  handleClick = event => {
    event.preventDefault();

    const { id } = this.props;
    this.props.onSelect(id);
  };

  icon() {
    const { reason, status } = this.props;

    if (status === 'running') {
      return <Spinner className="step-icon" />;
    }

    let Icon = ChevronRight;
    if (status === 'terminated') {
      if (reason === 'Completed') {
        Icon = CheckmarkFilled;
      } else {
        Icon = CloseFilled;
      }
    }

    return <Icon className="step-icon" />;
  }

  statusLabel() {
    const { intl, labels, reason, status } = this.props;
    const { running, succeeded, failed, waiting, notRun } = labels;

    if (status === 'running') {
      return intl.formatMessage(running);
    }

    if (status === 'terminated') {
      if (reason === 'Completed') {
        return intl.formatMessage(succeeded);
      }
      return intl.formatMessage(failed);
    }
    if (status === 'waiting') {
      return intl.formatMessage(waiting);
    }
    // task is done, step did not run
    return intl.formatMessage(notRun);
  }

  render() {
    const { reason, selected, status, stepName } = this.props;
    const icon = this.icon();
    const statusLabel = this.statusLabel();

    return (
      <li
        className="step"
        data-status={status}
        data-reason={reason}
        data-selected={selected || undefined}
      >
        <a href="#" tabIndex="0" onClick={this.handleClick}>
          {icon}
          <span className="step-name" title={stepName}>
            {stepName}
          </span>
          <span className="status-label">{statusLabel}</span>
        </a>
      </li>
    );
  }
}

Step.defaultProps = {
  labels: {
    failed: { id: 'dashboard.taskRun.status.failed', defaultMessage: 'Failed' },
    notRun: {
      id: 'dashboard.taskRun.status.notRun',
      defaultMessage: 'Not run'
    },
    running: {
      id: 'dashboard.taskRun.status.running',
      defaultMessage: 'Running'
    },
    succeeded: {
      id: 'dashboard.taskRun.status.succeeded',
      defaultMessage: 'Completed'
    },
    waiting: {
      id: 'dashboard.taskRun.status.waiting',
      defaultMessage: 'Waiting'
    }
  },
  stepName: 'unknown'
};

export default injectIntl(Step);
