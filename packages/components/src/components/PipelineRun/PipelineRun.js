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
import {
  InlineNotification,
  StructuredListSkeleton
} from 'carbon-components-react';
import { injectIntl } from 'react-intl';
import {
  RunHeader,
  StepDetails,
  TaskTree
} from '@tektoncd/dashboard-components';

import {
  getErrorMessage,
  getStatus,
  selectedTask,
  selectedTaskRun,
  stepsStatus,
  taskRunStep
} from '@tektoncd/dashboard-utils';
import { Log } from '..';

import './Run.scss';

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

  loadTaskRuns = pipelineRun => {
    if (!pipelineRun) {
      return [];
    }

    const { tasks, taskRuns } = this.props;
    const {
      status: { taskRuns: taskRunDetails }
    } = pipelineRun;

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
        const steps = stepsStatus(task.spec.steps, taskRun.status.steps);
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
    const { error, loading, fetchLogs, intl, rebuild, showIO } = this.props;

    const { selectedStepId, selectedTaskId } = this.state;

    if (loading) {
      return <StructuredListSkeleton border />;
    }

    if (error) {
      return (
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
      );
    }

    if (!this.props.pipelineRun) {
      return (
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
          />
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
    const taskRun = selectedTaskRun(selectedTaskId, taskRuns) || {};

    const { definition, reason, status, stepName, stepStatus } = taskRunStep(
      selectedStepId,
      taskRun
    );

    const logContainer = (
      <Log
        key={`${selectedTaskId}:${selectedStepId}`}
        fetchLogs={() => fetchLogs(stepName, stepStatus, taskRun)}
        stepStatus={stepStatus}
      />
    );
    return (
      <>
        <RunHeader
          lastTransitionTime={lastTransitionTime}
          loading={loading}
          runName={pipelineRunName}
          reason={pipelineRunReason}
          status={pipelineRunStatus}
        >
          {rebuild}
        </RunHeader>
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
