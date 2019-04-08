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
import { Icon } from 'carbon-components-react';

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

    let icon = 'icon--header--chevron';
    if (status === 'terminated') {
      if (reason === 'Completed') {
        icon = 'icon--checkmark--solid';
      } else {
        icon = 'icon--close--solid';
      }
    }

    return <Icon name={icon} className="step-icon" />;
  }

  statusLabel() {
    const { labels, reason, status } = this.props;
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
    if (status === 'waiting') {
      return waiting;
    }
    // task is done, step did not run
    return notRun;
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
          {stepName}
          <span className="status-label">{statusLabel}</span>
        </a>
      </li>
    );
  }
}

Step.defaultProps = {
  labels: {
    failed: 'Failed',
    notRun: 'Not run',
    running: 'Running',
    succeeded: 'OK',
    waiting: 'Waiting'
  },
  stepName: 'unknown'
};

export default Step;
