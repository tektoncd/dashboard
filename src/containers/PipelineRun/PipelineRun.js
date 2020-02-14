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
import { connect } from 'react-redux';
import { PipelineRun, Rerun } from '@tektoncd/dashboard-components';
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
  isWebSocketConnected
} from '../../reducers';
import { LogDownloadButton } from '..';
import { fetchPipelineRun } from '../../actions/pipelineRuns';
import { fetchClusterTasks, fetchTasks } from '../../actions/tasks';
import { fetchTaskRuns } from '../../actions/taskRuns';
import { rerunPipelineRun } from '../../api';

import { fetchLogs } from '../../utils';
import './PipelineRun.scss';

export /* istanbul ignore next */ class PipelineRunContainer extends Component {
  constructor(props) {
    super(props);
    this.setShowRerunNotification = this.setShowRerunNotification.bind(this);
  }

  state = {
    loading: true,
    showRerunNotification: false
  };

  componentDidMount() {
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

    if (
      namespace !== prevNamespace ||
      pipelineRunName !== prevPipelineRunName ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchData();
    }
  }

  setShowRerunNotification(value) {
    this.setState({ showRerunNotification: value });
  }

  fetchData() {
    const { match } = this.props;
    const { namespace, pipelineRunName } = match.params;
    this.setState({ loading: true }, async () => {
      await Promise.all([
        this.props.fetchPipelineRun({ name: pipelineRunName, namespace }),
        this.props.fetchTasks(),
        this.props.fetchClusterTasks(),
        this.props.fetchTaskRuns()
      ]);
      this.setState({ loading: false });
    });
  }

  render() {
    const { error, intl, match, pipelineRun, tasks, taskRuns } = this.props;

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

    const rerun = (
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
            subtitle={
              showRerunNotification.logsURL ? (
                <Link
                  id="newpipelinerunlink"
                  to={showRerunNotification.logsURL}
                  onClick={() => this.setShowRerunNotification(false)}
                >
                  {intl.formatMessage({
                    id: 'dashboard.pipelineRun.rerunStatusMessage',
                    defaultMessage: 'View status of this rerun PipelineRun'
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
          loading={loading}
          fetchLogs={fetchLogs}
          logDownloadButton={LogDownloadButton}
          pipelineRun={pipelineRun}
          showIO
          tasks={tasks}
          taskRuns={taskRuns}
          rerun={rerun}
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
  const { match } = ownProps;
  const { namespace } = match.params;

  return {
    error:
      getPipelineRunsErrorMessage(state) ||
      getTasksErrorMessage(state) ||
      getTaskRunsErrorMessage(state),
    namespace,
    pipelineRun: getPipelineRun(state, {
      name: ownProps.match.params.pipelineRunName,
      namespace
    }),
    tasks: getTasks(state, { namespace }),

    taskRuns: getTaskRunsByPipelineRunName(
      state,
      ownProps.match.params.pipelineRunName,
      {
        namespace
      }
    ).filter(taskRun => 'taskRef' in taskRun.spec),
    clusterTasks: getClusterTasks(state),
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
