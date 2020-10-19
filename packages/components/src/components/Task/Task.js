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
import { ChevronRight16 as DefaultIcon } from '@carbon/icons-react';
import { StatusIcon, Step } from '@tektoncd/dashboard-components';

import { updateUnexecutedSteps } from '@tektoncd/dashboard-utils';

import './Task.scss';

class Task extends Component {
  state = { selectedStepId: null };

  componentDidMount() {
    this.selectDefaultStep();
  }

  handleClick = () => {
    const { id } = this.props;
    const { selectedStepId } = this.state;
    this.props.onSelect(id, selectedStepId);
  };

  handleStepSelected = selectedStepId => {
    this.setState({ selectedStepId }, () => {
      this.handleClick();
    });
  };

  handleTaskSelected = event => {
    event?.preventDefault(); // eslint-disable-line no-unused-expressions
    this.setState({ selectedStepId: null }, () => {
      this.handleClick();
    });
  };

  selectDefaultStep() {
    const { expanded, selectDefaultStep, selectedStepId, steps } = this.props;
    if (!selectDefaultStep) {
      return;
    }
    if (expanded && !selectedStepId) {
      const erroredStep = steps.find(
        step => step.reason === 'Error' || step.reason === undefined
      );
      const { id } = erroredStep || steps[0] || {};
      this.handleStepSelected(id);
    }
  }

  render() {
    const {
      expanded,
      pipelineTaskName,
      reason,
      selectedStepId,
      steps,
      succeeded
    } = this.props;

    return (
      <li
        className="tkn--task"
        data-succeeded={succeeded}
        data-reason={reason}
        data-selected={(expanded && !selectedStepId) || undefined}
      >
        <a
          className="tkn--task-link"
          href="#"
          title={pipelineTaskName}
          onClick={this.handleTaskSelected}
        >
          <StatusIcon
            DefaultIcon={DefaultIcon}
            inverse={
              succeeded !== 'Unknown' || (reason && reason !== 'Pending')
            }
            reason={reason}
            status={succeeded}
          />
          {pipelineTaskName}
        </a>
        {expanded && (
          <ol className="tkn--step-list">
            {updateUnexecutedSteps(steps).map(
              ({ id, reason: stepReason, status, stepName }) => {
                const selected = selectedStepId === id;
                const stepStatus =
                  reason === 'TaskRunCancelled' && status !== 'terminated'
                    ? 'cancelled'
                    : status;
                return (
                  <Step
                    id={id}
                    key={stepName}
                    onSelect={this.handleStepSelected}
                    reason={stepReason}
                    selected={selected}
                    status={stepStatus}
                    stepName={stepName}
                  />
                );
              }
            )}
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
