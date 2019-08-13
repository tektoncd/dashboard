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
import CheckmarkFilled from '@carbon/icons-react/lib/checkmark--filled/16';
import ChevronRight from '@carbon/icons-react/lib/chevron--right/16';
import CloseFilled from '@carbon/icons-react/lib/close--filled/16';
import { Spinner, Step } from '@tektoncd/dashboard-components';

import './Task.scss';

class Task extends Component {
  state = { selectedStepId: null };

  handleClick = event => {
    if (event) {
      event.preventDefault();
    }

    const { id } = this.props;
    const { selectedStepId } = this.state;
    this.props.onSelect(id, selectedStepId);
  };

  handleStepSelected = selectedStepId => {
    this.setState({ selectedStepId }, () => {
      this.handleClick();
    });
  };

  icon() {
    const { reason, succeeded } = this.props;

    if (succeeded === 'Unknown' && reason === 'Pending') {
      return <Spinner className="task-icon" />;
    }

    let Icon = ChevronRight;
    if (succeeded === 'True') {
      Icon = CheckmarkFilled;
    } else if (succeeded === 'False') {
      Icon = CloseFilled;
    }

    return <Icon className="task-icon" />;
  }

  render() {
    const { expanded, reason, succeeded, steps, pipelineTaskName } = this.props;
    const { selectedStepId } = this.state;
    const icon = this.icon();
    return (
      <li className="task" data-succeeded={succeeded} data-reason={reason}>
        <a href="#" title={pipelineTaskName} onClick={this.handleClick}>
          {icon}
          {pipelineTaskName}
        </a>
        {expanded && (
          <ol className="step-list">
            {steps.map(({ id, reason: stepReason, status, stepName }) => {
              const selected = selectedStepId === id;
              return (
                <Step
                  id={id}
                  key={id}
                  onSelect={this.handleStepSelected}
                  reason={stepReason}
                  selected={selected}
                  status={status}
                  stepName={stepName}
                />
              );
            })}
          </ol>
        )}
      </li>
    );
  }
}

Task.defaultProps = {
  steps: []
};

export default Task;
