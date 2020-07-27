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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PipelineRun, Rerun } from '@tektoncd/dashboard-components';
import { getTitle } from '@tektoncd/dashboard-utils';
import { InlineNotification } from 'carbon-components-react';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';

import {
  getClusterTasks,
  getPipelineRun,
  getPipelineRunsErrorMessage,
  getTaskRunsByPipelineRunName,
  getTaskRunsErrorMessage,
  getTasks,
  getTasksErrorMessage,
  isLogStreamingEnabled,
  isReadOnly,
  isWebSocketConnected
} from '../../reducers';
import { LogDownloadButton } from '..';
import { fetchPipelineRun } from '../../actions/pipelineRuns';
import { fetchClusterTasks, fetchTasks } from '../../actions/tasks';
import { fetchTaskRuns } from '../../actions/taskRuns';
import { rerunPipelineRun } from '../../api';

import { fetchLogs, followLogs, getViewChangeHandler } from '../../utils';

const PIPELINE_TASK = 'pipelineTask';
const RETRY = 'retry';
const STEP = 'step';
const VIEW = 'view';

export /* istanbul ignore next */ class PipelineRunContainer extends Component {
  constructor(props) {
    super(props);
    this.setShowRerunNotification = this.setShowRerunNotification.bind(this);

    this.state = {
      loading: true,
      showRerunNotification: false
    };
  }

  componentDidMount() {
    const { match } = this.props;
    const { pipelineRunName: resourceName } = match.params;
    document.title = getTitle({
      page: 'PipelineRun',
      resourceName
    });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { match, webSocketConnected } = this.props;
    const { namespace, pipelineRunName } = match.params;
    const {
      match: prevMatch,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    const {
      namespace: prevNamespace,
      pipelineRunName: prevPipelineRunName
    } = prevMatch.params;

    const websocketReconnected =
      webSocketConnected && prevWebSocketConnected === false;
    if (
      namespace !== prevNamespace ||
      pipelineRunName !== prevPipelineRunName ||
      websocketReconnected
    ) {
      this.fetchData({ skipLoading: websocketReconnected });
    }
  }

  setShowRerunNotification(value) {
    this.setState({ showRerunNotification: value });
  }

  getSelectedTaskId(pipelineTaskName, retry) {
    const { taskRuns } = this.props;
    const taskRun = taskRuns.find(
      ({ metadata }) =>
        metadata.labels &&
        (metadata.labels['tekton.dev/conditionCheck'] === pipelineTaskName ||
          metadata.labels['tekton.dev/pipelineTask'] === pipelineTaskName)
    );

    if (!taskRun) {
      return null;
    }

    const retryNumber = parseInt(retry, 10);
    if (
      !Number.isNaN(retryNumber) &&
      taskRun.status &&
      taskRun.status.retriesStatus
    ) {
      const retryStatus = taskRun.status.retriesStatus[retryNumber];
      return retryStatus && taskRun.metadata.uid + retryStatus.podName;
    }

    return taskRun.metadata.uid + taskRun.status.podName;
  }

  getSelectedTaskRun(selectedTaskId) {
    const { taskRuns } = this.props;
    const lookup = taskRuns.reduce((acc, taskRun) => {
      const { labels, uid } = taskRun.metadata;
      const pipelineTaskName =
        labels &&
        (labels['tekton.dev/conditionCheck'] ||
          labels['tekton.dev/pipelineTask']);
      const { podName, retriesStatus } = taskRun.status;
      acc[uid + podName] = {
        pipelineTaskName,
        uid
      };
      if (retriesStatus) {
        retriesStatus.forEach((retryStatus, index) => {
          acc[uid + retryStatus.podName] = {
            pipelineTaskName,
            retry: index,
            uid
          };
        });
      }
      return acc;
    }, {});
    return lookup[selectedTaskId];
  }

  handleTaskSelected = (selectedTaskId, selectedStepId) => {
    const {
      history,
      location,
      match,
      pipelineTaskName: currentPipelineTaskName,
      retry: currentRetry
    } = this.props;
    const { pipelineTaskName, retry } = this.getSelectedTaskRun(selectedTaskId);
    const queryParams = new URLSearchParams(location.search);

    queryParams.set(PIPELINE_TASK, pipelineTaskName);
    if (selectedStepId) {
      queryParams.set(STEP, selectedStepId);
    } else {
      queryParams.delete(STEP);
    }

    if (Number.isInteger(retry)) {
      queryParams.set(RETRY, retry);
    } else {
      queryParams.delete(RETRY);
    }

    const currentStepId = this.props.selectedStepId;
    const currentTaskId = this.getSelectedTaskId(
      currentPipelineTaskName,
      currentRetry
    );
    if (selectedStepId !== currentStepId || selectedTaskId !== currentTaskId) {
      queryParams.delete(VIEW);
    }

    const browserURL = match.url.concat(`?${queryParams.toString()}`);
    history.push(browserURL);
  };

  fetchData({ skipLoading } = {}) {
    const { match } = this.props;
    const { namespace, pipelineRunName } = match.params;
    this.setState({ loading: !skipLoading }, async () => {
      await Promise.all([
        this.props.fetchPipelineRun({ name: pipelineRunName, namespace }),
        this.props.fetchTasks(),
        this.props.fetchClusterTasks(),
        this.props.fetchTaskRuns({
          filters: [`tekton.dev/pipelineRun=${pipelineRunName}`]
        })
      ]);
      this.setState({ loading: false });
    });
  }

  render() {
    const {
      clusterTasks,
      error,
      intl,
      match,
      pipelineRun,
      pipelineTaskName,
      retry,
      selectedStepId,
      tasks,
      taskRuns,
      view
    } = this.props;

    if (!pipelineRun) {
      return (
        <PipelineRun
          error={intl.formatMessage({
            id: 'dashboard.pipelineRun.notFound',
            defaultMessage: 'PipelineRun not found'
          })}
          loading={false}
        />
      );
    }

    if (!pipelineRun.status) {
      pipelineRun.status = {
        taskRuns: []
      };
    }
    if (!pipelineRun.status.taskRuns) {
      pipelineRun.status.taskRuns = [];
    }

    const { loading, showRerunNotification } = this.state;
    const { pipelineRunName } = match.params;
    const selectedTaskId = this.getSelectedTaskId(pipelineTaskName, retry);

    const rerun = !this.props.isReadOnly && (
      <Rerun
        pipelineRun={pipelineRun}
        rerunPipelineRun={rerunPipelineRun}
        runName={pipelineRunName}
        setShowRerunNotification={this.setShowRerunNotification}
      />
    );

    const logsRetriever = this.props.isLogStreamingEnabled
      ? followLogs
      : fetchLogs;

    return (
      <>
        {showRerunNotification && (
          <InlineNotification
            lowContrast
            actions={
              showRerunNotification.logsURL ? (
                <Link
                  className="bx--inline-notification__text-wrapper"
                  to={showRerunNotification.logsURL}
                >
                  {intl.formatMessage({
                    id: 'dashboard.pipelineRun.rerunStatusMessage',
                    defaultMessage: 'View status'
                  })}
                </Link>
              ) : (
                ''
              )
            }
            title={showRerunNotification.message}
            kind={showRerunNotification.kind}
            caption=""
          />
        )}
        <PipelineRun
          error={error}
          fetchLogs={logsRetriever}
          handleTaskSelected={this.handleTaskSelected}
          loading={loading}
          logDownloadButton={LogDownloadButton}
          onViewChange={getViewChangeHandler(this.props)}
          pipelineRun={pipelineRun}
          rerun={rerun}
          selectedStepId={selectedStepId}
          selectedTaskId={selectedTaskId}
          showIO
          sortTaskRuns
          taskRuns={taskRuns}
          tasks={tasks.concat(clusterTasks)}
          view={view}
        />
      </>
    );
  }
}

PipelineRunContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      pipelineRunName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { location, match } = ownProps;
  const { namespace } = match.params;

  const queryParams = new URLSearchParams(location.search);
  const pipelineTaskName = queryParams.get(PIPELINE_TASK);
  const retry = queryParams.get(RETRY);
  const selectedStepId = queryParams.get(STEP);
  const view = queryParams.get(VIEW);

  return {
    clusterTasks: getClusterTasks(state),
    error:
      getPipelineRunsErrorMessage(state) ||
      getTasksErrorMessage(state) ||
      getTaskRunsErrorMessage(state),
    isReadOnly: isReadOnly(state),
    namespace,
    pipelineRun: getPipelineRun(state, {
      name: ownProps.match.params.pipelineRunName,
      namespace
    }),
    pipelineTaskName,
    retry,
    selectedStepId,
    isLogStreamingEnabled: isLogStreamingEnabled(state),
    tasks: getTasks(state, { namespace }),
    taskRuns: getTaskRunsByPipelineRunName(
      state,
      ownProps.match.params.pipelineRunName,
      {
        namespace
      }
    ),
    view,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchClusterTasks,
  fetchPipelineRun,
  fetchTasks,
  fetchTaskRuns
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PipelineRunContainer));
