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
import {
  InlineNotification,
  StructuredListSkeleton
} from 'carbon-components-react';

import {
  getTask,
  getTaskRunsByTaskName,
  getTaskRunsErrorMessage,
  isFetchingTask,
  isFetchingTaskRuns
} from '../../reducers';

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
import { fetchTask } from '../../actions/task';
import { fetchTaskRuns } from '../../actions/taskRuns';

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
    selectedStepId: null,
    selectedTaskId: null,
    runs: []
  };

  componentDidMount() {
    const { match } = this.props;
    const { taskName } = match.params;
    this.props.fetchTask(taskName)
      .then(this.props.fetchTaskRuns())
      .then(this.loadTaskRuns);
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const { taskName } = match.params;
    if (taskName !== prevProps.match.params.taskName) {
      this.props.fetchTask(taskName).then(this.loadTaskRuns(taskName));
    }
  }

  handleTaskSelected = (selectedTaskId, selectedStepId) => {
    this.setState({ selectedStepId, selectedTaskId });
  };

  loadTaskRuns = () => {
    let notification;
    const { task } = this.props;
    const taskRuns = this.props.taskRunsByTaskName;
    const runs = taskRuns.map(taskRun => {
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

    this.setState({ runs, notification });
  };

  render() {
    const {
      selectedStepId,
      selectedTaskId,
      runs,
      notification
    } = this.state;

    const { loading, error } = this.props;

    if (loading && !runs.length) {
      return <StructuredListSkeleton border />;
    }

    if (error) {
      return (
        <InlineNotification
          kind="error"
          title="Error loading task runs"
          subtitle={error}
        />
      );
    }

    const taskRun = selectedTaskRun(selectedTaskId, runs) || {};

    const { definition, reason, status, stepName, stepStatus } = taskRunStep(
      selectedStepId,
      taskRun
    );

    return (
      <>
        <RunHeader
          lastTransitionTime={taskRun.startTime}
          loading={loading}
          runName={taskRun.taskRunName}
          status={taskRun.succeeded}
        />
        {notification ? (
          TaskRunsContainer.notification(notification)
        ) : (
          <div className="tasks">
            <TaskTree
              onSelect={this.handleTaskSelected}
              selectedTaskId={selectedTaskId}
              taskRuns={runs}
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
      </>
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
function mapStateToProps(state, props) {
  return {
    error: getTaskRunsErrorMessage(state),
    loading: isFetchingTaskRuns(state),
    taskRunsByTaskName: getTaskRunsByTaskName(
      state,
      props.match.params.taskName
    ),
    task: getTask(state, props.match.params.taskName)
  };
}

const mapDispatchToProps = {
  fetchTask,
  fetchTaskRuns
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskRunsContainer);
