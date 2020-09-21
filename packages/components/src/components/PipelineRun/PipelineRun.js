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
import PropTypes from 'prop-types';
import {
  InlineNotification,
  StructuredListSkeleton
} from 'carbon-components-react';
import { injectIntl } from 'react-intl';
import {
  getErrorMessage,
  getParams,
  getResources,
  getStatus,
  labels,
  reorderSteps,
  selectedTask,
  selectedTaskRun,
  stepsStatus,
  taskRunStep,
  updateUnexecutedSteps
} from '@tektoncd/dashboard-utils';

import { Log, RunHeader, StepDetails, TaskRunDetails, TaskTree } from '..';

import '../../scss/Run.scss';

export /* istanbul ignore next */ class PipelineRunContainer extends Component {
  loadPipelineRunData = () => {
    const { pipelineRun } = this.props;

    if (!(pipelineRun.status && pipelineRun.status.taskRuns)) {
      return { pipelineRun };
    }

    const {
      status: { taskRuns: taskRunsStatus }
    } = pipelineRun;
    const { message, status, reason } = getStatus(pipelineRun);

    return {
      error: status === 'False' && !taskRunsStatus && { message, reason },
      pipelineRun,
      pipelineRunName: pipelineRun.metadata.name
    };
  };

  sortTaskRuns = taskRuns => {
    const toReturn = taskRuns.sort((taskRunA, taskRunB) => {
      if (!taskRunA || !taskRunB) {
        return 0;
      }

      const firstStepA = taskRunA.steps[0];
      const firstStepB = taskRunB.steps[0];

      if (!firstStepA || !firstStepB) {
        // shouldn't be able to reach this state (both tasks requiring at least one step)
        return 0;
      }

      const { startedAt: startedAtA } =
        firstStepA.terminated || firstStepA.running || {};
      const { startedAt: startedAtB } =
        firstStepB.terminated || firstStepB.running || {};

      if (!startedAtA || !startedAtB) {
        return 0;
      }

      return new Date(startedAtA).getTime() - new Date(startedAtB).getTime();
    });
    return toReturn;
  };

  loadTaskRuns = pipelineRun => {
    if (!pipelineRun || !pipelineRun.status || !pipelineRun.status.taskRuns) {
      return [];
    }

    const { tasks, intl } = this.props;
    let { taskRuns } = this.props;

    if (!tasks || !taskRuns) {
      return [];
    }

    const {
      status: { taskRuns: taskRunDetails }
    } = pipelineRun;

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
    return taskRuns
      .map(taskRun => {
        let taskSpec;
        if (taskRun.spec.taskRef) {
          const task = selectedTask(taskRun.spec.taskRef.name, tasks);

          if (!task) {
            return null;
          }

          taskSpec = task.spec;
        } else {
          ({ taskSpec } = taskRun.spec);
        }

        if (!taskSpec) {
          return null;
        }

        const {
          name: taskRunName,
          namespace: taskRunNamespace,
          annotations
        } = taskRun.metadata;

        const { reason, status: succeeded } = getStatus(taskRun);

        let pipelineTaskName;
        const conditionCheck = taskRun.metadata.labels[labels.CONDITION_CHECK];
        if (conditionCheck) {
          pipelineTaskName = conditionCheck;
        } else {
          ({ pipelineTaskName } = taskRunDetails[taskRunName] || {});
        }

        const params = getParams(taskRun.spec);
        const { inputResources, outputResources } = getResources(taskRun.spec);

        let steps = [];

        if (!taskRun.status) {
          taskRun.status = {}; // eslint-disable-line no-param-reassign
        } else {
          const reorderedSteps = reorderSteps(
            taskRun.status.steps,
            taskSpec.steps
          );
          steps = stepsStatus(reorderedSteps, taskRun.status.steps);
        }
        const { podName } = taskRun.status;

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
          id: `${taskRun.metadata.uid}${podName}`,
          pipelineTaskName,
          pod: podName,
          reason,
          steps,
          succeeded,
          taskRunName,
          namespace: taskRunNamespace,
          inputResources,
          outputResources,
          params,
          annotations,
          status: taskRun.status
        };
      })
      .filter(Boolean);
  };

  render() {
    const {
      customNotification,
      error,
      fetchLogs,
      handleTaskSelected,
      intl,
      loading,
      logDownloadButton: LogDownloadButton,
      onViewChange,
      pollingInterval,
      rerun,
      selectedStepId,
      selectedTaskId,
      showIO,
      sortTaskRuns,
      triggerHeader,
      view
    } = this.props;

    if (loading) {
      return <StructuredListSkeleton border />;
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

    const {
      pipelineRunName,
      error: pipelineRunError,
      pipelineRun
    } = this.loadPipelineRunData();

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
    const taskRuns = this.loadTaskRuns(pipelineRun);

    if (sortTaskRuns) {
      this.sortTaskRuns(taskRuns);
    }

    const taskRun = selectedTaskRun(selectedTaskId, taskRuns) || {};

    const { definition, reason, status, stepName, stepStatus } = taskRunStep(
      selectedStepId,
      {
        ...taskRun,
        steps: updateUnexecutedSteps(taskRun.steps)
      }
    );

    const logContainer = selectedStepId && (
      <Log
        downloadButton={
          LogDownloadButton &&
          stepStatus && (
            <LogDownloadButton
              stepName={stepName}
              stepStatus={stepStatus}
              taskRun={taskRun}
            />
          )
        }
        fetchLogs={() => fetchLogs(stepName, stepStatus, taskRun)}
        key={`${selectedTaskId}:${selectedStepId}`}
        pollingInterval={pollingInterval}
        stepStatus={stepStatus}
      />
    );

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
          {rerun}
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
                reason={reason}
                showIO={showIO}
                status={status}
                stepName={stepName}
                stepStatus={stepStatus}
                taskRun={taskRun}
                view={view}
              />
            )) ||
              (selectedTaskId && (
                <TaskRunDetails
                  onViewChange={onViewChange}
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
  sortTaskRuns: PropTypes.bool,
  view: PropTypes.string
};

PipelineRunContainer.defaultProps = {
  handleTaskSelected: /* istanbul ignore next */ () => {},
  onViewChange: /* istanbul ignore next */ () => {},
  selectedStepId: null,
  selectedTaskId: null,
  sortTaskRuns: false,
  view: null
};

export default injectIntl(PipelineRunContainer);
