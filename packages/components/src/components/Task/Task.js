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
import {
  PendingFilled20 as DefaultIcon,
  ChevronDown20 as ExpandIcon
} from '@carbon/icons-react';
import { StatusIcon, Step } from '@tektoncd/dashboard-components';
import {
  getStepStatusReason,
  updateUnexecutedSteps
} from '@tektoncd/dashboard-utils';

class Task extends Component {
  state = { hasWarning: false, selectedStepId: null };

  componentDidMount() {
    this.selectDefaultStep();
    this.getStepData({ propagateWarning: true });
  }

  componentDidUpdate(prevProps) {
    const { reason } = this.props;
    if (prevProps.reason !== reason && reason === 'Succeeded') {
      this.getStepData({ propagateWarning: true });
    }
  }

  getStepData({ propagateWarning = false } = {}) {
    const { reason, selectedStepId, steps } = this.props;
    let hasWarning = false;
    const stepData = updateUnexecutedSteps(steps).map(step => {
      const { name } = step;
      const { exitCode, status, reason: stepReason } = getStepStatusReason(
        step
      );

      if (stepReason === 'Completed') {
        hasWarning = hasWarning || exitCode !== 0;
      }

      const selected = selectedStepId === name;
      const stepStatus =
        reason === 'TaskRunCancelled' && status !== 'terminated'
          ? 'cancelled'
          : status;

      return { exitCode, name, selected, stepReason, stepStatus };
    });

    if (propagateWarning) {
      this.setState({ hasWarning });
    }

    return stepData;
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
    event?.preventDefault();
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
        step => step.terminated?.reason === 'Error' || !step.terminated
      );
      const { name } = erroredStep || steps[0] || {};
      this.handleStepSelected(name);
    }
  }

  render() {
    const {
      expanded,
      displayName,
      reason,
      selectedStepId,
      succeeded
    } = this.props;
    const { hasWarning } = this.state;

    const expandIcon = expanded ? null : (
      <ExpandIcon className="tkn--task--expand-icon" />
    );

    return (
      <li
        className="tkn--task"
        data-active={expanded || undefined}
        data-has-warning={hasWarning}
        data-reason={reason}
        data-succeeded={succeeded}
        data-selected={(expanded && !selectedStepId) || undefined}
      >
        <a
          className="tkn--task-link"
          href="#"
          title={displayName}
          onClick={this.handleTaskSelected}
        >
          <StatusIcon
            DefaultIcon={DefaultIcon}
            hasWarning={hasWarning}
            reason={reason}
            status={succeeded}
          />
          <span className="tkn--task-link--name">{displayName}</span>
          {expandIcon}
        </a>
        {expanded && (
          <ol className="tkn--step-list">
            {this.getStepData().map(step => {
              const { exitCode, name, selected, stepReason, stepStatus } = step;
              return (
                <Step
                  exitCode={exitCode}
                  id={name}
                  key={name}
                  onSelect={this.handleStepSelected}
                  reason={stepReason}
                  selected={selected}
                  status={stepStatus}
                  stepName={name}
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
