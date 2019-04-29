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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { InlineNotification } from 'carbon-components-react';

import { getTasks, getTaskRuns } from '../../api';
import { getSelectedNamespace } from '../../reducers';

import RunHeader from '../../components/RunHeader';
import StepDetails from '../../components/StepDetails';
import TaskTree from '../../components/TaskTree';
import {
  getStatus,
  stepsStatus,
  taskRunStep,
  selectedTaskRun
} from '../../utils';

import '../../components/Run/Run.scss';

export /* istanbul ignore next */ class TaskRunsContainer extends Component {
  // once redux store is available errors will be handled properly with dedicated components
  static notification(notification) {
    const { kind, message } = notification;
    const titles = {
      info: 'Task runs not available',
      error: 'Error loading task run'
    };
    return (
      <InlineNotification
        kind={kind}
        title={titles[kind]}
        subtitle={JSON.stringify(message, Object.getOwnPropertyNames(message))}
      />
    );
  }

  state = {
    notification: null,
    loading: true,
    selectedStepId: null,
    selectedTaskId: null,
    taskRuns: []
  };

  async componentDidMount() {
    try {
      const { match } = this.props;
      const { taskName } = match.params;
      await this.loadTaskRuns(taskName);
    } catch (error) {
      let message = error;
      if (error.response) {
        message = error.response.status === 404 ? 'Not Found' : 'Error';
      }
      this.setState({
        notification: { kind: 'error', message },
        loading: false
      });
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

  async loadTaskRuns(selectedTaskName) {
    const { namespace } = this.props;
    let notification;
    const tasks = await getTasks(namespace);
    const task = tasks.find(
      currentTask => currentTask.metadata.name === selectedTaskName
    );
    let taskRuns = await getTaskRuns(namespace);
    taskRuns = taskRuns
      .filter(
        taskRun =>
          taskRun.spec.taskRef && taskRun.spec.taskRef.name === selectedTaskName
      )
      .map(taskRun => {
        const taskName = taskRun.spec.taskRef.name;
        const taskRunName = taskRun.metadata.name;
        const { reason, status: succeeded } = getStatus(taskRun);
        const pipelineTaskName = taskRunName;
        const runSteps = stepsStatus(task.spec.steps, taskRun.status.steps);
        const { startTime } = taskRun.status;
        return {
          id: taskRun.metadata.uid,
          pipelineTaskName,
          pod: taskRun.status.podName,
          reason,
          steps: runSteps,
          succeeded,
          taskName,
          taskRunName,
          startTime
        };
      });

    if (taskRuns.length === 0) {
      notification = {
        kind: 'info',
        message: 'Task has never run'
      };
    }

    this.setState({ taskRuns, notification, loading: false });
  }

  render() {
    const { match } = this.props;
    const { taskName } = match.params;
    const {
      loading,
      selectedStepId,
      selectedTaskId,
      taskRuns,
      notification
    } = this.state;

    const taskRun = selectedTaskRun(selectedTaskId, taskRuns) || {};

    const { definition, reason, status, stepName, stepStatus } = taskRunStep(
      selectedStepId,
      taskRun
    );

    return (
      <div className="run">
        <RunHeader
          lastTransitionTime={taskRun.startTime}
          loading={loading}
          name={taskName}
          runName={taskRun.taskRunName}
          status={taskRun.succeeded}
          type="tasks"
          typeLabel="Tasks"
        />
        <main>
          {notification ? (
            TaskRunsContainer.notification(notification)
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

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    namespace: getSelectedNamespace(state)
  };
}

export default connect(mapStateToProps)(TaskRunsContainer);
