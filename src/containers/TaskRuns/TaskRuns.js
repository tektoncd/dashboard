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

import { getTaskRun, getTasks, getTaskRuns } from '../../api';

import RunHeader from '../../components/RunHeader';
import StepDetails from '../../components/StepDetails';
import TaskTree from '../../components/TaskTree';
import { getStatus } from '../../utils';

import '../../components/PipelineRun/PipelineRun.scss';

/* istanbul ignore next */
class TaskRunsContainer extends Component {
  state = {
    error: null,
    loading: true,
    selectedStepId: null,
    selectedTaskId: null,
    taskRuns: [],
    task: null
  };

  async componentDidMount() {
    try {
      const { match } = this.props;
      const { taskName } = match.params;

     let taskRuns = await this.loadTaskRuns(taskName);
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const { taskName } = match.params;
    if (taskName !== prevProps.match.params.taskName) {
      this.loadTaskRuns(taskName);
    }
  }

  handleTaskSelected = (selectedTaskId, selectedStepId) => {
    this.setState({ selectedStepId, selectedTaskId });
  };

  async loadTaskRuns(taskName) {
    const tasks = await getTasks();
    const task = tasks.find(task => task.metadata.name === taskName);
    let taskRuns = await getTaskRuns();
    taskRuns = taskRuns.filter(taskRun => taskRun.spec.taskRef && 
      taskRun.spec.taskRef.name === taskName).map(taskRun => {
      const taskName = taskRun.spec.taskRef.name;
      const taskRunName = taskRun.metadata.name;
      const { reason, status: succeeded } = getStatus(taskRun);
      const pipelineTaskName = taskRunName;
      console.log({taskRun})
      if(!taskRun.status.steps){
        console.log(JSON.stringify(taskRun))
      }
      const taskRunSteps = this.steps(task, taskRun.status.steps, taskName);
      return {
        id: taskRun.metadata.uid,
        pipelineTaskName,
        pod: taskRun.status.podName,
        reason,
        steps: taskRunSteps,
        succeeded,
        taskName,
        taskRunName
      };
    });

    if(taskRuns.length == 0){
      throw "Task has never been run";
    }

    this.setState({ taskRuns, task, loading: false });
  }

  step() {
    const { selectedStepId, selectedTaskId, taskRuns } = this.state;
    const taskRun = taskRuns.find(run => run.id === selectedTaskId);
    if (!taskRun) {
      return {};
    }
    const step = taskRun.steps.find(s => s.id === selectedStepId);
    if (!step) {
      return {};
    }

    const { id, stepName, stepStatus, status, reason, ...definition } = step;

    return {
      definition,
      reason,
      stepName,
      stepStatus,
      status,
      taskRun
    };
  }

  steps(task, stepsStatus, taskName) {
    const steps = task.spec.steps.map((step, index) => {
      const stepStatus = stepsStatus ? stepsStatus[index] : {};
      let status;
      let reason;
      if (stepStatus.terminated) {
        status = 'terminated';
        ({ reason } = stepStatus.terminated);
      } else if (stepStatus.running) {
        status = 'running';
      } else if (stepStatus.waiting) {
        status = 'waiting';
      }

      return {
        ...step,
        reason,
        status,
        stepStatus,
        stepName: step.name,
        id: step.name
      };
    });
    return steps;
  }

  render() {
    const { match } = this.props;
    const { taskName } = match.params;
    const {
      error,
      loading,
      selectedStepId,
      selectedTaskId,
      taskRuns
    } = this.state;

    // TODO: actual error handling
    let errorMessage;
    if (error && error.response) {
      errorMessage = error.response.status === 404 ? 'Not Found' : 'Error';
    }

    const {
      definition,
      reason,
      status,
      stepName,
      stepStatus,
      taskRun
    } = this.step();

    return (
      <div className="pipeline-run">
        <RunHeader
          error={errorMessage}
          lastTransitionTime=""
          loading={loading}
          name={taskName}
          type="tasks"
        />
        <main>
          {error ? (
            <InlineNotification
              kind="error"
              title="Error loading task run"
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

TaskRunsContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      taskName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default TaskRunsContainer;
