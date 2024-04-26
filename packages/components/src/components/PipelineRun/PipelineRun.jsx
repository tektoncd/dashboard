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

import { Component, Fragment } from 'react';
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

import Log from '../Log';
import Portal from '../Portal';
import RunHeader from '../RunHeader';
import StepDetails from '../StepDetails';
import TaskRunDetails from '../TaskRunDetails';
import TaskTree from '../TaskTree';

function getPipelineTask({ pipeline, pipelineRun, selectedTaskId, taskRun }) {
  const memberOf = taskRun?.metadata?.labels?.[labelConstants.MEMBER_OF];
  const pipelineTask = (
    pipelineRun.spec?.pipelineSpec?.[memberOf] ||
    pipelineRun.status?.pipelineSpec?.[memberOf] ||
    pipeline?.spec?.[memberOf]
  )?.find(task => task.name === selectedTaskId);

  return pipelineTask;
}

export /* istanbul ignore next */ class PipelineRunContainer extends Component {
  state = {
    isLogsMaximized: false
  };

  getPipelineRunError = () => {
    const { pipelineRun } = this.props;

    if (!pipelineRun.status?.taskRuns && !pipelineRun.status?.childReferences) {
      return null;
    }

    const {
      status: { childReferences, taskRuns: taskRunsStatus }
    } = pipelineRun;
    const { message, status, reason } = getStatus(pipelineRun);

    return (
      status === 'False' &&
      !taskRunsStatus &&
      !childReferences && { message, reason }
    );
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
      selectedRetry,
      selectedStepId,
      selectedTaskId
    } = this.props;

    const { isLogsMaximized } = this.state;

    if (!selectedStepId || !stepStatus) {
      return null;
    }

    const LogsRoot =
      isLogsMaximized && maximizedLogsContainer ? Portal : Fragment;

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
          key={`${selectedTaskId}:${selectedStepId}:${selectedRetry}`}
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
    const { pipelineRun } = this.props;
    if (
      !pipelineRun?.status?.taskRuns &&
      !pipelineRun?.status?.childReferences
    ) {
      return [];
    }

    const { taskRuns } = this.props;
    return taskRuns || [];
  };

  onTaskSelected = ({
    selectedRetry: retry,
    selectedStepId,
    selectedTaskId,
    taskRunName
  }) => {
    const { handleTaskSelected, pipeline, pipelineRun } = this.props;
    const taskRuns = this.loadTaskRuns();
    const taskRun =
      taskRuns.find(
        ({ metadata }) =>
          metadata.labels?.[labelConstants.PIPELINE_TASK] === selectedTaskId
      ) || {};

    const pipelineTask = getPipelineTask({
      pipeline,
      pipelineRun,
      selectedTaskId,
      taskRun
    });
    handleTaskSelected({
      selectedRetry: retry,
      selectedStepId,
      selectedTaskId,
      taskRunName: pipelineTask?.matrix ? taskRunName : undefined
    });
  };

  render() {
    const {
      customNotification,
      error,
      icon,
      intl,
      loading,
      onRetryChange,
      onViewChange,
      pipeline,
      pipelineRun,
      pod,
      runActions,
      selectedRetry,
      selectedStepId,
      selectedTaskId,
      selectedTaskRunName,
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

    const pipelineRunName =
      pipelineRun.metadata.name || pipelineRun.metadata.generateName;
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
            icon={icon}
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
    let taskRun =
      taskRuns.find(
        ({ metadata }) =>
          metadata.labels?.[labelConstants.PIPELINE_TASK] === selectedTaskId
      ) || {};

    const pipelineTask = getPipelineTask({
      pipeline,
      pipelineRun,
      selectedTaskId,
      taskRun
    });
    if (pipelineTask?.matrix && selectedTaskRunName) {
      taskRun = taskRuns.find(
        ({ metadata }) => metadata.name === selectedTaskRunName
      );
    }

    if (taskRun.status?.retriesStatus && selectedRetry) {
      taskRun = {
        ...taskRun,
        status: taskRun.status.retriesStatus[selectedRetry]
      };
    }

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
          icon={icon}
          lastTransitionTime={lastTransitionTime}
          loading={loading}
          message={pipelineRunStatusMessage}
          runName={pipelineRunName}
          reason={pipelineRunReason}
          status={pipelineRunStatus}
          triggerHeader={triggerHeader}
        >
          {runActions}
        </RunHeader>
        {customNotification}
        {taskRuns.length > 0 && (
          <div className="tkn--tasks">
            <TaskTree
              isSelectedTaskMatrix={!!pipelineTask?.matrix}
              onRetryChange={onRetryChange}
              onSelect={this.onTaskSelected}
              selectedRetry={selectedRetry}
              selectedStepId={selectedStepId}
              selectedTaskId={selectedTaskId}
              selectedTaskRunName={selectedTaskRunName}
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
