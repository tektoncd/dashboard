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
  Log,
  RunHeader,
  StepDetails,
  TaskTree
} from '@tektoncd/dashboard-components';
import {
  getStatus,
  selectedTaskRun,
  stepsStatus,
  taskRunStep
} from '@tektoncd/dashboard-utils';

import {
  getSelectedNamespace,
  getTaskByType,
  getTaskRunsByTaskName,
  getTaskRunsErrorMessage
} from '../../reducers';

import '../../components/Run/Run.scss';
import { fetchTaskByType } from '../../actions/tasks';
import { fetchTaskRuns } from '../../actions/taskRuns';
import { fetchLogs } from '../../utils';

export /* istanbul ignore next */ class TaskRunsContainer extends Component {
  // once redux store is available errors will be handled properly with dedicated components
  static notification({ kind, message }) {
    const titles = {
      info: 'TaskRuns not available',
      error: 'Error loading TaskRun'
    };
    return (
      <InlineNotification
        kind={kind}
        hideCloseButton
        lowContrast
        title={titles[kind]}
        subtitle={message}
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
    const { taskName, taskType } = match.params;
    this.fetchTaskAndRuns(taskName, taskType, namespace);
  }

  componentDidUpdate(prevProps) {
    const { match, namespace } = this.props;
    const { taskName, taskType } = match.params;
    const { match: prevMatch, namespace: prevNamespace } = prevProps;
    const { taskName: prevTaskName, taskType: prevTaskType } = prevMatch.params;

    if (
      taskName !== prevTaskName ||
      namespace !== prevNamespace ||
      taskType !== prevTaskType
    ) {
      this.setState({ loading: true }); // eslint-disable-line
      this.fetchTaskAndRuns(taskName, taskType, namespace);
    }
  }

  handleTaskSelected = (selectedTaskId, selectedStepId) => {
    this.setState({ selectedStepId, selectedTaskId });
  };

  loadTaskRuns = () => {
    const { task } = this.props;
    let { taskRuns } = this.props;
    taskRuns = taskRuns
      .map(taskRun => {
        if (!taskRun) {
          return null;
        }
        const taskName = taskRun.spec.taskRef.name;
        const taskRunName = taskRun.metadata.name;
        const taskRunNamespace = taskRun.metadata.namespace;
        const { reason, status: succeeded } = getStatus(taskRun);
        const pipelineTaskName = taskRunName;
        const runSteps = stepsStatus(task.spec.steps, taskRun.status.steps);
        const { params, resources: inputResources } = taskRun.spec.inputs;
        const { resources: outputResources } = taskRun.spec.outputs;
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
          startTime,
          namespace: taskRunNamespace,
          params,
          inputResources,
          outputResources
        };
      })
      .filter(Boolean);
    return taskRuns;
  };

  fetchTaskAndRuns(taskName, taskType, namespace) {
    Promise.all([
      this.props.fetchTaskByKind(taskName, taskType, namespace),
      this.props.fetchTaskRuns({ taskName })
    ]).then(() => {
      this.setState({ loading: false });
    });
  }

  render() {
    const { loading, selectedStepId, selectedTaskId } = this.state;
    const { error } = this.props;

    if (loading) {
      return <StructuredListSkeleton border />;
    }

    if (error) {
      return TaskRunsContainer.notification({
        kind: 'error',
        message: 'Error loading TaskRuns'
      });
    }

    const taskRuns = this.loadTaskRuns();

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

    const logContainer = (
      <Log
        fetchLogs={() => fetchLogs(stepName, stepStatus, taskRun)}
        stepStatus={stepStatus}
      />
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
              logContainer={logContainer}
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
  const { namespace: namespaceParam, taskName, taskType } = match.params;

  const namespace = namespaceParam || getSelectedNamespace(state);

  return {
    error: getTaskRunsErrorMessage(state),
    namespace,
    taskRuns: getTaskRunsByTaskName(state, {
      name: taskName,
      namespace
    }),
    task: getTaskByType(state, { type: taskType, name: taskName, namespace })
  };
}

const mapDispatchToProps = {
  fetchTaskByKind: fetchTaskByType,
  fetchTaskRuns
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskRunsContainer);
