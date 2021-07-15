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
import PropTypes from 'prop-types';
import { InlineNotification, SkeletonText } from 'carbon-components-react';
import { injectIntl } from 'react-intl';
import {
  getErrorMessage,
  getStatus,
  getStepDefinition,
  getStepStatus,
  labels as labelConstants
} from '@tektoncd/dashboard-utils';

import {
  Log,
  Portal,
  RunHeader,
  StepDetails,
  TaskRunDetails,
  TaskTree
} from '..';

export /* istanbul ignore next */ class PipelineRunContainer extends Component {
  state = {
    isLogsMaximized: false
  };

  getPipelineRunError = () => {
    const { pipelineRun } = this.props;

    if (!(pipelineRun.status && pipelineRun.status.taskRuns)) {
      return null;
    }

    const {
      status: { taskRuns: taskRunsStatus }
    } = pipelineRun;
    const { message, status, reason } = getStatus(pipelineRun);

    return status === 'False' && !taskRunsStatus && { message, reason };
  };

  getLogContainer({ stepName, stepStatus, taskRun }) {
    const {
      enableLogAutoScroll,
      enableLogScrollButtons,
      fetchLogs,
      forceLogPolling,
      getLogsToolbar,
      maximizedLogsContainer,
      pollingInterval,
      selectedStepId,
      selectedTaskId
    } = this.props;

    const { isLogsMaximized } = this.state;

    if (!selectedStepId || !stepStatus) {
      return null;
    }

    const LogsRoot =
      isLogsMaximized && maximizedLogsContainer ? Portal : React.Fragment;

    return (
      <LogsRoot
        {...(isLogsMaximized ? { container: maximizedLogsContainer } : null)}
      >
        <Log
          toolbar={
            getLogsToolbar &&
            stepStatus &&
            getLogsToolbar({
              isMaximized: isLogsMaximized,
              stepStatus,
              taskRun,
              toggleMaximized:
                !!maximizedLogsContainer && this.toggleLogsMaximized
            })
          }
          fetchLogs={() => fetchLogs(stepName, stepStatus, taskRun)}
          forcePolling={forceLogPolling}
          key={`${selectedTaskId}:${selectedStepId}`}
          pollingInterval={pollingInterval}
          stepStatus={stepStatus}
          isLogsMaximized={isLogsMaximized}
          enableLogAutoScroll={enableLogAutoScroll}
          enableLogScrollButtons={enableLogScrollButtons}
        />
      </LogsRoot>
    );
  }

  toggleLogsMaximized = () => {
    this.setState(({ isLogsMaximized }) => ({
      isLogsMaximized: !isLogsMaximized
    }));
  };

  loadTaskRuns = () => {
    const { intl, pipelineRun } = this.props;
    if (!pipelineRun?.status?.taskRuns) {
      return [];
    }

    let { taskRuns } = this.props;

    if (!taskRuns) {
      return [];
    }

    const retryPodIndex = {};
    taskRuns = taskRuns.reduce((acc, taskRun) => {
      if (taskRun.status?.retriesStatus) {
        taskRun.status.retriesStatus.forEach((retryStatus, index) => {
          const retryRun = { ...taskRun };
          retryRun.status = retryStatus;
          retryPodIndex[retryStatus.podName] = index;
          acc.push(retryRun);
        });
      }
      acc.push(taskRun);
      return acc;
    }, []);

    const {
      status: { taskRuns: taskRunDetails }
    } = pipelineRun;

    return taskRuns.map(taskRun => {
      const { labels, name: taskRunName, uid } = taskRun.metadata;

      let pipelineTaskName;
      const conditionCheck = labels[labelConstants.CONDITION_CHECK];
      if (conditionCheck) {
        pipelineTaskName = conditionCheck;
      } else {
        ({ pipelineTaskName } = taskRunDetails[taskRunName] || {});
      }

      const { podName } = taskRun.status || {};

      if (retryPodIndex[podName] || taskRun.status?.retriesStatus) {
        const retryNumber =
          retryPodIndex[podName] || taskRun.status.retriesStatus.length;
        pipelineTaskName = intl.formatMessage(
          {
            id: 'dashboard.pipelineRun.pipelineTaskName.retry',
            defaultMessage: '{pipelineTaskName} (retry {retryNumber, number})'
          },
          { pipelineTaskName, retryNumber }
        );
      }

      return {
        ...taskRun,
        metadata: {
          ...taskRun.metadata,
          labels: {
            ...taskRun.metadata.labels,
            [labelConstants.DASHBOARD_RETRY_NAME]: pipelineTaskName
          },
          uid: `${uid}${podName}`
        },
        status: {
          ...taskRun.status
        }
      };
    });
  };

  render() {
    const {
      customNotification,
      error,
      handleTaskSelected,
      intl,
      loading,
      onViewChange,
      pipelineRun,
      pod,
      runaction,
      selectedStepId,
      selectedTaskId,
      showIO,
      triggerHeader,
      view
    } = this.props;

    if (loading) {
      return <SkeletonText heading width="60%" />;
    }

    if (error) {
      return (
        <>
          {customNotification}
          <InlineNotification
            kind="error"
            hideCloseButton
            lowContrast
            title={intl.formatMessage({
              id: 'dashboard.pipelineRun.error',
              defaultMessage: 'Error loading PipelineRun'
            })}
            subtitle={getErrorMessage(error)}
          />
        </>
      );
    }

    if (!this.props.pipelineRun) {
      return (
        <>
          {customNotification}
          <InlineNotification
            kind="info"
            hideCloseButton
            lowContrast
            title={intl.formatMessage({
              id: 'dashboard.pipelineRun.failed',
              defaultMessage: 'Cannot load PipelineRun'
            })}
            subtitle={intl.formatMessage({
              id: 'dashboard.pipelineRun.notFound',
              defaultMessage: 'PipelineRun not found'
            })}
          />
        </>
      );
    }

    const pipelineRunName = pipelineRun.metadata.name;
    const pipelineRunError = this.getPipelineRunError();

    const {
      lastTransitionTime,
      message: pipelineRunStatusMessage,
      reason: pipelineRunReason,
      status: pipelineRunStatus
    } = getStatus(pipelineRun);

    if (pipelineRunError) {
      return (
        <>
          <RunHeader
            lastTransitionTime={lastTransitionTime}
            loading={loading}
            pipelineRun={pipelineRun}
            runName={pipelineRun.pipelineRunName}
            reason="Error"
            status={pipelineRunStatus}
            triggerHeader={triggerHeader}
          />
          {customNotification}
          <InlineNotification
            kind="error"
            hideCloseButton
            lowContrast
            title={intl.formatMessage(
              {
                id: 'dashboard.pipelineRun.failedMessage',
                defaultMessage: 'Unable to load PipelineRun: {reason}'
              },
              { reason: pipelineRunError.reason }
            )}
            subtitle={pipelineRunError.message}
          />
        </>
      );
    }

    const taskRuns = this.loadTaskRuns();
    const taskRun =
      taskRuns.find(run => run.metadata.uid === selectedTaskId) || {};

    const task =
      (taskRun.spec?.taskRef?.name &&
        this.props.tasks?.find(
          t => t.metadata.name === taskRun.spec.taskRef.name
        )) ||
      {};

    const definition = getStepDefinition({
      selectedStepId,
      task,
      taskRun
    });

    const stepStatus = getStepStatus({
      selectedStepId,
      taskRun
    });

    const logContainer = this.getLogContainer({
      stepName: selectedStepId,
      stepStatus,
      taskRun
    });

    return (
      <>
        <RunHeader
          lastTransitionTime={lastTransitionTime}
          loading={loading}
          message={pipelineRunStatusMessage}
          runName={pipelineRunName}
          reason={pipelineRunReason}
          status={pipelineRunStatus}
          triggerHeader={triggerHeader}
        >
          {runaction}
        </RunHeader>
        {customNotification}
        {taskRuns.length > 0 && (
          <div className="tkn--tasks">
            <TaskTree
              onSelect={handleTaskSelected}
              selectedTaskId={selectedTaskId}
              selectedStepId={selectedStepId}
              taskRuns={taskRuns}
            />
            {(selectedStepId && (
              <StepDetails
                definition={definition}
                logContainer={logContainer}
                onViewChange={onViewChange}
                stepName={selectedStepId}
                stepStatus={stepStatus}
                taskRun={taskRun}
                view={view}
              />
            )) ||
              (selectedTaskId && (
                <TaskRunDetails
                  onViewChange={onViewChange}
                  pod={pod}
                  task={task}
                  taskRun={taskRun}
                  view={view}
                  showIO={showIO}
                />
              ))}
          </div>
        )}
      </>
    );
  }
}

PipelineRunContainer.propTypes = {
  handleTaskSelected: PropTypes.func,
  onViewChange: PropTypes.func,
  selectedStepId: PropTypes.string,
  selectedTaskId: PropTypes.string,
  view: PropTypes.string
};

PipelineRunContainer.defaultProps = {
  handleTaskSelected: /* istanbul ignore next */ () => {},
  onViewChange: /* istanbul ignore next */ () => {},
  selectedStepId: null,
  selectedTaskId: null,
  view: null
};

export default injectIntl(PipelineRunContainer);
