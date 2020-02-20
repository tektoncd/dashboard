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
import {
  InlineNotification,
  StructuredListSkeleton
} from 'carbon-components-react';
import { FormattedMessage, injectIntl } from 'react-intl';
import {
  getErrorMessage,
  getStatus,
  reorderSteps,
  selectedTask,
  selectedTaskRun,
  stepsStatus,
  taskRunStep,
  updateUnexecutedSteps
} from '@tektoncd/dashboard-utils';

import { Log, RunHeader, StepDetails, TaskTree } from '..';

import '../../scss/Run.scss';

export /* istanbul ignore next */ class PipelineRunContainer extends Component {
  state = {
    selectedStepId: null,
    selectedTaskId: null
  };

  handleTaskSelected = (selectedTaskId, selectedStepId) => {
    this.setState({ selectedStepId, selectedTaskId });
  };

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
      pipelineRunName: pipelineRun.metadata.name,
      taskRunNames: taskRunsStatus && Object.keys(taskRunsStatus)
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

    const { tasks, taskRuns } = this.props;

    if (!tasks || !taskRuns) {
      return [];
    }

    const {
      status: { taskRuns: taskRunDetails }
    } = pipelineRun;

    if (!pipelineRun.status || !pipelineRun.status.taskRuns) {
      return [];
    }

    return taskRuns
      .map(taskRun => {
        const taskName = taskRun.spec.taskRef.name;
        const task = selectedTask(taskName, tasks);
        if (!task) {
          return null;
        }

        const {
          name: taskRunName,
          namespace: taskRunNamespace,
          annotations
        } = taskRun.metadata;

        const { reason, status: succeeded } = getStatus(taskRun);

        const { pipelineTaskName } = taskRunDetails[taskRunName] || {};
        const { params, resources: inputResources } = taskRun.spec.inputs;
        const { resources: outputResources } = taskRun.spec.outputs;

        let steps = '';

        if (!task.spec || !taskRun.status) {
          steps = {
            id: 0,
            reason: 'unknown',
            status: 'unknown'
          };
          let theRun = taskRun;
          theRun = {
            metadata: {
              uid: '0'
            },
            status: {
              podName: 'unknown'
            }
          };
          taskRun = theRun; // eslint-disable-line no-param-reassign
        } else {
          const reorderedSteps = reorderSteps(
            taskRun.status.steps,
            task.spec.steps
          );
          steps = stepsStatus(reorderedSteps, reorderedSteps);
        }

        return {
          id: taskRun.metadata.uid,
          pipelineTaskName,
          pod: taskRun.status.podName,
          reason,
          steps,
          succeeded,
          taskName,
          taskRunName,
          namespace: taskRunNamespace,
          inputResources,
          outputResources,
          params,
          annotations
        };
      })
      .filter(Boolean);
  };

  render() {
    const {
      customNotification,
      error,
      fetchLogs,
      logDownloadButton: LogDownloadButton,
      intl,
      loading,
      pollingInterval,
      rerun,
      showIO,
      triggerHeader
    } = this.props;

    const { selectedStepId, selectedTaskId } = this.state;

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
      pipelineRun,
      taskRunNames
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
                defaultMessage: 'Unable to load PipelineRun details: {reason}'
              },
              { reason: pipelineRunError.reason }
            )}
            subtitle={pipelineRunError.message}
          />
        </>
      );
    }
    const taskRuns = this.loadTaskRuns(pipelineRun, taskRunNames);

    this.sortTaskRuns(taskRuns);

    if (taskRuns.length === 0) {
      return (
        <FormattedMessage
          id="dashboard.taskRun.noTaskRuns"
          defaultMessage="No TaskRuns found for this PipelineRun yet…"
        />
      );
    }

    const taskRun = selectedTaskRun(selectedTaskId, taskRuns) || {};

    const { definition, reason, status, stepName, stepStatus } = taskRunStep(
      selectedStepId,
      {
        ...taskRun,
        steps: updateUnexecutedSteps(taskRun.steps)
      }
    );

    const logContainer = (
      <Log
        downloadButton={
          LogDownloadButton && (
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
        <div className="tasks">
          <TaskTree
            onSelect={this.handleTaskSelected}
            selectedTaskId={selectedTaskId}
            taskRuns={taskRuns}
          />
          {selectedStepId && (
            <StepDetails
              definition={definition}
              logContainer={logContainer}
              reason={reason}
              showIO={showIO}
              status={status}
              stepName={stepName}
              stepStatus={stepStatus}
              taskRun={taskRun}
            />
          )}
        </div>
      </>
    );
  }
}

export default injectIntl(PipelineRunContainer);
