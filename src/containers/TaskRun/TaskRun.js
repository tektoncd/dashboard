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
  getSelectedNamespace,
  getTask,
  getTaskRun,
  getTaskRunsErrorMessage
} from '../../reducers';

import RunHeader from '../../components/RunHeader';
import StepDetails from '../../components/StepDetails';
import TaskTree from '../../components/TaskTree';
import { getStatus, stepsStatus, taskRunStep } from '../../utils';

import '../../components/Run/Run.scss';
import { fetchTask } from '../../actions/tasks';
import { fetchTaskRun } from '../../actions/taskRuns';

export /* istanbul ignore next */ class TaskRunContainer extends Component {
  // once redux store is available errors will be handled properly with dedicated components
  static notification(notification) {
    const { kind, message } = notification;
    const titles = {
      info: 'Task run not available',
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
    loading: true,
    selectedStepId: null
  };

  componentDidMount() {
    const { match, namespace } = this.props;
    const { taskRunName } = match.params;
    this.fetchTaskAndRuns(taskRunName, namespace);
  }

  componentDidUpdate(prevProps) {
    const { match, namespace } = this.props;
    const { taskRunName } = match.params;
    const { match: prevMatch, namespace: prevNamespace } = prevProps;
    const { taskRunName: prevTaskRunName } = prevMatch.params;

    if (taskRunName !== prevTaskRunName || namespace !== prevNamespace) {
      this.setState({ loading: true }); // eslint-disable-line
      this.fetchTaskAndRuns(taskRunName, namespace);
    }
  }

  handleTaskSelected = (_, selectedStepId) => {
    this.setState({ selectedStepId });
  };

  loadTaskRun = () => {
    const { task } = this.props;
    let { taskRun } = this.props;
    const taskRunName = taskRun.metadata.name;
    const { reason, status: succeeded } = getStatus(taskRun);
    const runSteps = stepsStatus(
      task ? task.spec.steps : taskRun.status.steps,
      taskRun.status.steps
    );
    const { startTime } = taskRun.status;
    taskRun = {
      id: taskRun.metadata.uid,
      pod: taskRun.status.podName,
      pipelineTaskName: taskRunName,
      reason,
      steps: runSteps,
      succeeded,
      taskRunName,
      startTime
    };
    return taskRun;
  };

  fetchTaskAndRuns(taskRunName, namespace) {
    this.props.fetchTaskRun({ taskRunName, namespace }).then(taskRun => {
      if (taskRun && taskRun.spec.taskRef) {
        this.props
          .fetchTask({ name: taskRun.spec.taskRef.name, namespace })
          .then(() => {
            this.setState({ loading: false });
          });
      } else {
        this.setState({ loading: false });
      }
    });
  }

  render() {
    const { loading, selectedStepId } = this.state;
    const { error } = this.props;

    if (loading) {
      return <StructuredListSkeleton border />;
    }

    if (error) {
      return TaskRunContainer.notification({
        kind: 'error',
        message: 'Error loading task run'
      });
    }

    const taskRun = this.loadTaskRun();

    if (!taskRun) {
      return TaskRunContainer.notification({
        kind: 'info',
        message: 'Task run not available'
      });
    }

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
        <div className="tasks">
          <TaskTree
            onSelect={this.handleTaskSelected}
            selectedTaskId={taskRun.id}
            taskRuns={[taskRun]}
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
      </>
    );
  }
}

TaskRunContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      taskRunName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { match } = ownProps;
  const { namespace: namespaceParam, taskRunName } = match.params;

  const namespace = namespaceParam || getSelectedNamespace(state);
  const taskRun = getTaskRun(state, {
    name: taskRunName,
    namespace
  });
  let task;
  if (taskRun && taskRun.spec.taskRef) {
    task = getTask(state, { name: taskRun.spec.taskRef.name, namespace });
  }
  return {
    error: getTaskRunsErrorMessage(state),
    namespace,
    taskRun,
    task
  };
}

const mapDispatchToProps = {
  fetchTask,
  fetchTaskRun
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskRunContainer);
