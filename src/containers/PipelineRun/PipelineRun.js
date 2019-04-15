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
import PropTypes from 'prop-types';
import { InlineNotification } from 'carbon-components-react';

import { getPipelineRun, getTaskRun, getTasks } from '../../api';

import RunHeader from '../../components/RunHeader';
import StepDetails from '../../components/StepDetails';
import TaskTree from '../../components/TaskTree';
import {
  getStatus,
  selectedTask,
  taskRunStep,
  selectedTaskRun,
  stepsStatus
} from '../../utils';

import '../../components/Run/Run.scss';

/* istanbul ignore next */
class PipelineRunContainer extends Component {
  state = {
    error: null,
    loading: true,
    pipelineRun: {},
    selectedStepId: null,
    selectedTaskId: null,
    taskRuns: [],
    tasks: []
  };

  componentDidMount() {
    this.loadPipelineRunData();
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const { pipelineRunName } = match.params;
    if (pipelineRunName !== prevProps.match.params.pipelineRunName) {
      this.loadPipelineRunData();
    }
  }

  handleTaskSelected = (selectedTaskId, selectedStepId) => {
    this.setState({ selectedStepId, selectedTaskId });
  };

  async loadPipelineRunData() {
    const { match } = this.props;
    const { pipelineRunName } = match.params;

    try {
      const [pipelineRun, tasks] = await Promise.all([
        getPipelineRun(pipelineRunName),
        getTasks()
      ]);
      const {
        status: { taskRuns: taskRunsStatus }
      } = pipelineRun;
      const { message, status } = getStatus(pipelineRun);
      if (status === 'False' && !taskRunsStatus) {
        throw message;
      }
      const taskRunNames = Object.keys(taskRunsStatus);

      this.setState(
        {
          pipelineRun,
          tasks,
          loading: false
        },
        () => {
          this.loadTaskRuns(taskRunNames);
        }
      );
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }

  async loadTaskRuns(taskRunNames) {
    let taskRuns = await Promise.all(
      taskRunNames.map(taskRunName => getTaskRun(taskRunName))
    );

    const {
      pipelineRun: {
        status: { taskRuns: taskRunDetails }
      },
      tasks
    } = this.state;

    taskRuns = taskRuns.map(taskRun => {
      const taskName = taskRun.spec.taskRef.name;
      const task = selectedTask(taskName, tasks);
      const taskRunName = taskRun.metadata.name;
      const { reason, status: succeeded } = getStatus(taskRun);
      const { pipelineTaskName } = taskRunDetails[taskRunName];
      const steps = stepsStatus(task.spec.steps, taskRun.status.steps);
      return {
        id: taskRun.metadata.uid,
        pipelineTaskName,
        pod: taskRun.status.podName,
        reason,
        steps,
        succeeded,
        taskName,
        taskRunName
      };
    });

    this.setState({ taskRuns });
  }

  render() {
    const { match } = this.props;
    const { pipelineName, pipelineRunName } = match.params;
    const {
      error,
      loading,
      pipelineRun,
      selectedStepId,
      selectedTaskId,
      taskRuns
    } = this.state;

    // TODO: actual error handling
    let errorMessage;
    if (error && error.response) {
      errorMessage = error.response.status === 404 ? 'Not Found' : 'Error';
    }

    const taskRun = selectedTaskRun(selectedTaskId, taskRuns) || {};

    const { definition, reason, status, stepName, stepStatus } = taskRunStep(
      selectedStepId,
      taskRun
    );

    const {
      lastTransitionTime,
      reason: pipelineRunReason,
      status: pipelineRunStatus
    } = getStatus(pipelineRun);

    return (
      <div className="run">
        <RunHeader
          error={errorMessage}
          lastTransitionTime={lastTransitionTime}
          loading={loading}
          name={pipelineName}
          runName={pipelineRunName}
          reason={pipelineRunReason}
          status={pipelineRunStatus}
          type="pipelines"
        />
        <main>
          {error ? (
            <InlineNotification
              kind="error"
              title="Error loading pipeline run"
              subtitle={JSON.stringify(
                error,
                Object.getOwnPropertyNames(error)
              )}
            />
          ) : (
            <div className="tasks">
              <TaskTree
                onSelect={this.handleTaskSelected}
                selectedTaskId={selectedTaskId}
                taskRuns={taskRuns}
              />
              {selectedStepId && (
                <StepDetails
                  definition={definition}
                  reason={reason}
                  status={status}
                  stepName={stepName}
                  stepStatus={stepStatus}
                  taskRun={taskRun}
                />
              )}
            </div>
          )}
        </main>
      </div>
    );
  }
}

PipelineRunContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      pipelineName: PropTypes.string.isRequired,
      pipelineRunName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default PipelineRunContainer;
