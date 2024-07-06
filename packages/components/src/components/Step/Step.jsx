/*
Copyright 2019-2024 The Tekton Authors
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

import { Component } from 'react';
import { injectIntl } from 'react-intl';
import { Pending as DefaultIcon } from '@carbon/react/icons';

import StatusIcon from '../StatusIcon';

class Step extends Component {
  handleClick = event => {
    event.preventDefault();

    const { id } = this.props;
    this.props.onSelect(id);
  };

  statusLabel() {
    const { exitCode, intl, reason, status } = this.props;

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
        return exitCode !== 0
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
    const { exitCode, reason, selected, status, stepName } = this.props;
    const statusLabel = this.statusLabel();

    return (
      <li
        className="tkn--step"
        data-status={status}
        data-reason={reason}
        data-selected={selected || undefined}
      >
        <span // eslint-disable-line jsx-a11y/no-static-element-interactions
          className="tkn--step-link"
          tabIndex="0" // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
          onClick={this.handleClick}
          onKeyUp={e => e.key === 'Enter' && this.handleClick(e)}
          role="button"
        >
          <StatusIcon
            DefaultIcon={props => <DefaultIcon size={20} {...props} />}
            hasWarning={exitCode !== 0}
            reason={reason}
            status={status}
            title={statusLabel}
            type="inverse"
          />
          <span className="tkn--step-name" title={stepName}>
            {stepName}
          </span>
        </span>
      </li>
    );
  }
}

Step.defaultProps = {
  stepName: 'unknown'
};

export default injectIntl(Step);
