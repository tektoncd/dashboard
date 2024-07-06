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
import { OverflowMenu, OverflowMenuItem } from '@carbon/react';
import {
  PendingFilled as DefaultIcon,
  ChevronDown as ExpandIcon
} from "@carbon/react/icons";
import {
  getStepStatusReason,
  updateUnexecutedSteps
} from '@tektoncd/dashboard-utils';

import StatusIcon from '../StatusIcon';
import Step from '../Step';

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
      const {
        exitCode,
        status,
        reason: stepReason
      } = getStepStatusReason(step);

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
    const { id, selectedRetry, taskRun } = this.props;
    const { selectedStepId } = this.state;
    this.props.onSelect({
      selectedRetry,
      selectedStepId,
      selectedTaskId: id,
      taskRunName: taskRun.metadata?.name
    });
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
      displayName,
      expanded,
      intl,
      onRetryChange,
      reason,
      selectedRetry,
      selectedStepId,
      succeeded,
      taskRun
    } = this.props;
    const { hasWarning } = this.state;

    const expandIcon = expanded ? null : (
      <ExpandIcon size={20} className="tkn--task--expand-icon" />
    );

    let retryName;
    let retryMenuTitle;
    if (selectedRetry || taskRun.status?.retriesStatus) {
      retryMenuTitle = intl.formatMessage({
        id: 'dashboard.pipelineRun.retries.view',
        defaultMessage: 'View retries'
      });

      if (selectedRetry === '0') {
        retryName = intl.formatMessage(
          {
            id: 'dashboard.pipelineRun.pipelineTaskName.firstAttempt',
            defaultMessage: '{pipelineTaskName} (first attempt)'
          },
          { pipelineTaskName: displayName }
        );
      } else {
        retryName = intl.formatMessage(
          {
            id: 'dashboard.pipelineRun.pipelineTaskName.retry',
            defaultMessage: '{pipelineTaskName} (retry {retryNumber, number})'
          },
          {
            pipelineTaskName: displayName,
            retryNumber: selectedRetry || taskRun.status.retriesStatus.length
          }
        );
      }
    }

    return (
      <li
        className="tkn--task"
        data-active={expanded || undefined}
        data-has-warning={hasWarning}
        data-reason={reason}
        data-succeeded={succeeded}
        data-selected={(expanded && !selectedStepId) || undefined}
      >
        <span // eslint-disable-line jsx-a11y/no-static-element-interactions
          className="tkn--task-link"
          tabIndex={0} // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
          title={retryName || displayName}
          onClick={this.handleTaskSelected}
          onKeyUp={e => e.key === 'Enter' && this.handleTaskSelected(e)}
          role="button"
        >
          <StatusIcon
            DefaultIcon={props => <DefaultIcon size={20} {...props} />}
            hasWarning={hasWarning}
            reason={reason}
            status={succeeded}
          />
          <span className="tkn--task-link--name">
            {retryName || displayName}
          </span>
          {expanded && taskRun.status?.retriesStatus ? (
            <OverflowMenu
              ariaLabel={retryMenuTitle}
              iconDescription={retryMenuTitle}
              menuOptionsClass="tkn--task--retries-menu-options"
              selectorPrimaryFocus="button:not([disabled])"
              size="sm"
              title={retryMenuTitle}
            >
              {taskRun.status.retriesStatus
                .map((_retryStatus, index) => {
                  return {
                    id: index,
                    text:
                      index === 0
                        ? intl.formatMessage({
                            id: 'dashboard.pipelineRun.retries.viewFirstAttempt',
                            defaultMessage: 'View first attempt'
                          })
                        : intl.formatMessage(
                            {
                              id: 'dashboard.pipelineRun.retries.viewRetry',
                              defaultMessage: 'View retry {retryNumber, number}'
                            },
                            { retryNumber: index }
                          )
                  };
                })
                .concat([
                  {
                    id: '',
                    text: intl.formatMessage({
                      id: 'dashboard.pipelineRun.retries.viewLatestRetry',
                      defaultMessage: 'View latest retry'
                    })
                  }
                ])
                .map(item => (
                  <OverflowMenuItem
                    disabled={`${item.id}` === selectedRetry}
                    itemText={item.text}
                    key={item.text}
                    onClick={() => onRetryChange(item.id)}
                    requireTitle
                  />
                ))}
            </OverflowMenu>
          ) : null}
          {expandIcon}
        </span>
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

export default injectIntl(Task);
