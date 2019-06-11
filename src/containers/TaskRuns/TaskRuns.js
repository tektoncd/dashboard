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
  getTaskRunsByTaskName,
  getTaskRunsErrorMessage
} from '../../reducers';

import RunHeader from '../../components/RunHeader';
import StepDetails from '../../components/StepDetails';
import TaskTree from '../../components/TaskTree';
import {
  getStatus,
  selectedTaskRun,
  stepsStatus,
  taskRunStep
} from '../../utils';

import '../../components/Run/Run.scss';
import { fetchTask } from '../../actions/tasks';
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
    loading: true,
    selectedStepId: null,
    selectedTaskId: null
  };

  componentDidMount() {
    const { match, namespace } = this.props;
    const { taskName } = match.params;
    this.fetchTaskAndRuns(taskName, namespace);
  }

  componentDidUpdate(prevProps) {
    const { match, namespace } = this.props;
    const { taskName } = match.params;
    const { match: prevMatch, namespace: prevNamespace } = prevProps;
    const { taskName: prevTaskName } = prevMatch.params;

    if (taskName !== prevTaskName || namespace !== prevNamespace) {
      this.setState({ loading: true }); // eslint-disable-line
      this.fetchTaskAndRuns(taskName, namespace);
    }
  }

  handleTaskSelected = (selectedTaskId, selectedStepId) => {
    this.setState({ selectedStepId, selectedTaskId });
  };

  loadTaskRuns = () => {
    const { task } = this.props;
    let { taskRuns } = this.props;
    taskRuns = taskRuns.map(taskRun => {
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
    return taskRuns;
  };

  fetchTaskAndRuns(taskName, namespace) {
    Promise.all([
      this.props.fetchTask({ name: taskName, namespace }),
      this.props.fetchTaskRuns({ taskName })
    ]).then(() => {
      this.setState({ loading: false });
    });
  }

  render() {
    const taskRuns = this.loadTaskRuns();
    const { loading, selectedStepId, selectedTaskId } = this.state;
    const { error } = this.props;

    if (loading) {
      return <StructuredListSkeleton border />;
    }

    if (error) {
      return TaskRunsContainer.notification({
        kind: 'error',
        message: 'Error loading task runs'
      });
    }

    if (taskRuns.length === 0) {
      return TaskRunsContainer.notification({
        kind: 'info',
        message: 'Task has never run'
      });
    }

    const taskRun = selectedTaskRun(selectedTaskId, taskRuns) || {};

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
function mapStateToProps(state, ownProps) {
  const { match } = ownProps;
  const { namespace: namespaceParam, taskName } = match.params;

  const namespace = namespaceParam || getSelectedNamespace(state);

  return {
    error: getTaskRunsErrorMessage(state),
    namespace,
    taskRuns: getTaskRunsByTaskName(state, {
      name: taskName,
      namespace
    }),
    task: getTask(state, { name: taskName, namespace })
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
