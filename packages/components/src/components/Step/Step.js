/*
Copyright 2019-2021 The Tekton Authors
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
import { Pending20 as DefaultIcon } from '@carbon/icons-react';

import StatusIcon from '../StatusIcon';

class Step extends Component {
  handleClick = event => {
    event.preventDefault();

    const { id } = this.props;
    this.props.onSelect(id);
  };

  statusLabel() {
    const { intl, reason, status } = this.props;

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

    if (status === 'waiting') {
      return intl.formatMessage({
        id: 'dashboard.taskRun.status.waiting',
        defaultMessage: 'Waiting'
      });
    }

    return intl.formatMessage({
      id: 'dashboard.taskRun.status.notRun',
      defaultMessage: 'Not run'
    });
  }

  render() {
    const { reason, selected, status, stepName } = this.props;
    const statusLabel = this.statusLabel();

    return (
      <li
        className="tkn--step"
        data-status={status}
        data-reason={reason}
        data-selected={selected || undefined}
      >
        <a
          className="tkn--step-link"
          href="#"
          tabIndex="0"
          onClick={this.handleClick}
        >
          <StatusIcon
            DefaultIcon={DefaultIcon}
            type="inverse"
            reason={reason}
            status={status}
            title={statusLabel}
          />
          <span className="tkn--step-name" title={stepName}>
            {stepName}
          </span>
        </a>
      </li>
    );
  }
}

Step.defaultProps = {
  stepName: 'unknown'
};

export default injectIntl(Step);
