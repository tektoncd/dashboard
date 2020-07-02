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
  isReadOnly,
  isWebSocketConnected
} from '../../reducers';
import { LogDownloadButton } from '..';
import { fetchPipelineRun } from '../../actions/pipelineRuns';
import { fetchClusterTasks, fetchTasks } from '../../actions/tasks';
import { fetchTaskRuns } from '../../actions/taskRuns';
import { rerunPipelineRun } from '../../api';

import { fetchLogs, getViewChangeHandler } from '../../utils';

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

  handleTaskSelected = (selectedTaskId, selectedStepId) => {
    const { history, location, match } = this.props;
    const queryParams = new URLSearchParams(location.search);

    queryParams.set('taskRun', selectedTaskId);
    if (selectedStepId) {
      queryParams.set('step', selectedStepId);
    } else {
      queryParams.delete('step');
    }

    const currentStepId = this.props.selectedStepId;
    const currentTaskId = this.props.selectedTaskId;
    if (selectedStepId !== currentStepId || selectedTaskId !== currentTaskId) {
      queryParams.delete('view');
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
      selectedStepId,
      selectedTaskId,
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

    const rerun = !this.props.isReadOnly && (
      <Rerun
        pipelineRun={pipelineRun}
        rerunPipelineRun={rerunPipelineRun}
        runName={pipelineRunName}
        setShowRerunNotification={this.setShowRerunNotification}
      />
    );

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
          fetchLogs={fetchLogs}
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
  const selectedTaskId = queryParams.get('taskRun');
  const selectedStepId = queryParams.get('step');
  const view = queryParams.get('view');

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
    selectedStepId,
    selectedTaskId,
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
