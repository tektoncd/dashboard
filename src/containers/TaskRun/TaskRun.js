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
import { injectIntl } from 'react-intl';
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
  TaskRunDetails,
  TaskTree
} from '@tektoncd/dashboard-components';
import {
  getParams,
  getResources,
  getStatus,
  getTitle,
  queryParams as queryParamConstants,
  reorderSteps,
  stepsStatus,
  taskRunStep,
  updateUnexecutedSteps
} from '@tektoncd/dashboard-utils';

import { getLogsRetriever, getViewChangeHandler } from '../../utils';

import { LogDownloadButton } from '..';
import {
  getExternalLogsURL,
  getSelectedNamespace,
  getTaskByType,
  getTaskRun,
  getTaskRunsErrorMessage,
  isLogStreamingEnabled,
  isWebSocketConnected
} from '../../reducers';

import '@tektoncd/dashboard-components/dist/scss/Run.scss';
import { fetchTask, fetchTaskByType } from '../../actions/tasks';
import { fetchTaskRun } from '../../actions/taskRuns';

const taskTypeKeys = { ClusterTask: 'clustertasks', Task: 'tasks' };
const { STEP, TASK_RUN_DETAILS, VIEW } = queryParamConstants;

export /* istanbul ignore next */ class TaskRunContainer extends Component {
  // once redux store is available errors will be handled properly with dedicated components
  static notification({ intl, kind, message }) {
    const titles = {
      info: intl.formatMessage({
        id: 'dashboard.taskRun.unavailable',
        defaultMessage: 'TaskRun not available'
      }),
      error: intl.formatMessage({
        id: 'dashboard.taskRun.errorLoading',
        defaultMessage: 'Error loading TaskRun'
      })
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

  state = { loading: true };

  componentDidMount() {
    const { match, namespace } = this.props;
    const { taskRunName } = match.params;
    document.title = getTitle({
      page: 'TaskRun',
      resourceName: taskRunName
    });
    this.fetchTaskAndRuns(taskRunName, namespace);
  }

  componentDidUpdate(prevProps) {
    const { match, namespace, webSocketConnected } = this.props;
    const { taskRunName } = match.params;
    const {
      match: prevMatch,
      namespace: prevNamespace,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    const { taskRunName: prevTaskRunName } = prevMatch.params;

    const websocketReconnected =
      webSocketConnected && prevWebSocketConnected === false;

    if (
      taskRunName !== prevTaskRunName ||
      namespace !== prevNamespace ||
      websocketReconnected
    ) {
      this.setState({ loading: !websocketReconnected }); // eslint-disable-line
      this.fetchTaskAndRuns(taskRunName, namespace);
    }
  }

  handleTaskSelected = (_, selectedStepId) => {
    const { history, location, match } = this.props;
    const queryParams = new URLSearchParams(location.search);

    if (selectedStepId) {
      queryParams.set(STEP, selectedStepId);
      queryParams.delete(TASK_RUN_DETAILS);
    } else {
      queryParams.delete(STEP);
      queryParams.set(TASK_RUN_DETAILS, true);
    }

    const currentStepId = this.props.selectedStepId;
    if (selectedStepId !== currentStepId) {
      queryParams.delete(VIEW);
    }

    const browserURL = match.url.concat(`?${queryParams.toString()}`);
    history.push(browserURL);
  };

  loadTaskRun = () => {
    const { task } = this.props;
    let { taskRun } = this.props;
    if (!taskRun) {
      return null;
    }

    const { steps } = taskRun.status;
    const stepDefinitions = taskRun.spec.taskSpec
      ? taskRun.spec.taskSpec.steps
      : task.spec.steps;
    const reorderedSteps = reorderSteps(steps, stepDefinitions);
    const taskRunName = taskRun.metadata.name;
    const taskRunNamespace = taskRun.metadata.namespace;
    const { reason, status: succeeded } = getStatus(taskRun);
    const runSteps = stepsStatus(reorderedSteps, taskRun.status.steps);
    const params = getParams(taskRun.spec);
    const { inputResources, outputResources } = getResources(taskRun.spec);
    const { startTime } = taskRun.status;
    taskRun = {
      id: taskRun.metadata.uid,
      pod: taskRun.status.podName,
      pipelineTaskName: taskRunName,
      reason,
      steps: runSteps,
      succeeded,
      taskRunName,
      startTime,
      namespace: taskRunNamespace,
      params,
      inputResources,
      outputResources,
      status: taskRun.status
    };
    return taskRun;
  };

  fetchTaskAndRuns(taskRunName, namespace) {
    this.props.fetchTaskRun({ name: taskRunName, namespace }).then(taskRun => {
      if (taskRun && taskRun.spec.taskRef) {
        const { name, kind } = taskRun.spec.taskRef;
        this.props
          .fetchTaskByType(name, taskTypeKeys[kind], namespace)
          .then(() => {
            this.setState({ loading: false });
          });
      } else {
        this.setState({ loading: false });
      }
    });
  }

  render() {
    const { loading } = this.state;
    const {
      error,
      intl,
      selectedStepId,
      showTaskRunDetails,
      view
    } = this.props;

    if (loading) {
      return <StructuredListSkeleton border />;
    }

    if (error) {
      return TaskRunContainer.notification({
        intl,
        kind: 'error',
        message: intl.formatMessage({
          id: 'dashboard.taskRun.errorLoading',
          defaultMessage: 'Error loading TaskRun'
        })
      });
    }

    const taskRun = this.loadTaskRun();

    if (!taskRun) {
      return TaskRunContainer.notification({
        intl,
        kind: 'info',
        message: intl.formatMessage({
          id: 'dashboard.taskRun.unavailable',
          defaultMessage: 'TaskRun not available'
        })
      });
    }

    const { definition, reason, status, stepName, stepStatus } = taskRunStep(
      selectedStepId,
      {
        ...taskRun,
        steps: updateUnexecutedSteps(taskRun.steps)
      }
    );

    const {
      reason: taskRunStatusReason,
      message: taskRunStatusMessage
    } = getStatus(this.props.taskRun);

    const logsRetriever = getLogsRetriever(
      this.props.isLogStreamingEnabled,
      this.props.externalLogsURL
    );

    const logContainer = selectedStepId && (
      <Log
        downloadButton={
          <LogDownloadButton
            stepName={stepName}
            stepStatus={stepStatus}
            taskRun={taskRun}
          />
        }
        fetchLogs={() => logsRetriever(stepName, stepStatus, taskRun)}
        key={stepName}
        stepStatus={stepStatus}
      />
    );

    const onViewChange = getViewChangeHandler(this.props);

    return (
      <>
        <RunHeader
          lastTransitionTime={taskRun.startTime}
          loading={loading}
          message={taskRunStatusMessage}
          reason={taskRunStatusReason}
          runName={taskRun.taskRunName}
          status={taskRun.succeeded}
        />
        <div className="tkn--tasks">
          <TaskTree
            onSelect={this.handleTaskSelected}
            selectedStepId={selectedStepId}
            selectedTaskId={showTaskRunDetails && taskRun.id}
            taskRuns={[taskRun]}
          />
          {(selectedStepId && (
            <StepDetails
              definition={definition}
              logContainer={logContainer}
              onViewChange={onViewChange}
              reason={reason}
              showIO
              status={status}
              stepName={stepName}
              stepStatus={stepStatus}
              taskRun={taskRun}
              view={view}
            />
          )) || (
            <TaskRunDetails
              onViewChange={onViewChange}
              taskRun={taskRun}
              view={view}
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
  const { location, match } = ownProps;
  const { namespace: namespaceParam, taskRunName } = match.params;

  const queryParams = new URLSearchParams(location.search);
  const selectedStepId = queryParams.get(STEP);
  const view = queryParams.get(VIEW);
  const showTaskRunDetails = queryParams.get(TASK_RUN_DETAILS);

  const namespace = namespaceParam || getSelectedNamespace(state);
  const taskRun = getTaskRun(state, {
    name: taskRunName,
    namespace
  });
  let task;
  if (taskRun && taskRun.spec.taskRef) {
    task = getTaskByType(state, {
      type: taskTypeKeys[taskRun.spec.taskRef.kind],
      name: taskRun.spec.taskRef.name,
      namespace
    });
  }
  return {
    error: getTaskRunsErrorMessage(state),
    externalLogsURL: getExternalLogsURL(state),
    namespace,
    selectedStepId,
    isLogStreamingEnabled: isLogStreamingEnabled(state),
    showTaskRunDetails,
    taskRun,
    task,
    view,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchTaskByType,
  fetchTask,
  fetchTaskRun
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TaskRunContainer));
