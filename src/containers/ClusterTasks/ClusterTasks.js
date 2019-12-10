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
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Table } from '@tektoncd/dashboard-components';
import { InlineNotification } from 'carbon-components-react';
import { getErrorMessage, urls } from '@tektoncd/dashboard-utils';

import { fetchClusterTasks } from '../../actions/tasks';
import {
  getClusterTasks,
  getClusterTasksErrorMessage,
  isFetchingClusterTasks,
  isWebSocketConnected
} from '../../reducers';

import '../../components/Definitions/Definitions.scss';

export /* istanbul ignore next */ class ClusterTasksContainer extends Component {
  componentDidMount() {
    this.props.fetchClusterTasks();
  }

  componentDidUpdate(prevProps) {
    const { webSocketConnected } = this.props;
    const { webSocketConnected: prevWebSocketConnected } = prevProps;
    if (webSocketConnected && prevWebSocketConnected === false) {
      this.props.fetchClusterTasks();
    }
  }

  render() {
    const {
      error,
      loading,
      clusterTasks,
      intl,
      namespace: selectedNamespace
    } = this.props;
    const initialHeaders = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      }
    ];

    const clusterTasksFormatted = clusterTasks.map(clusterTask => ({
      id: `${clusterTask.metadata.namespace}:${clusterTask.metadata.name}`,
      name: (
        <Link
          to={urls.taskRuns.byClusterTask({
            taskName: clusterTask.metadata.name
          })}
        >
          {clusterTask.metadata.name}
        </Link>
      )
    }));

    if (error) {
      return (
        <InlineNotification
          hideCloseButton
          kind="error"
          title="Error loading ClusterTasks"
          subtitle={getErrorMessage(error)}
          lowContrast
        />
      );
    }
    return (
      <>
        <h1>ClusterTasks</h1>
        <Table
          headers={initialHeaders}
          rows={clusterTasksFormatted}
          loading={loading}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.clusterTasks',
              defaultMessage: 'No {kind}'
            },
            { kind: 'ClusterTasks' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.clusterTasks',
              defaultMessage: 'No {kind}'
            },
            { kind: 'ClusterTasks' }
          )}
        />
      </>
    );
  }
}

ClusterTasksContainer.defaultProps = {
  clusterTasks: []
};

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    clusterTasks: getClusterTasks(state),
    error: getClusterTasksErrorMessage(state),
    loading: isFetchingClusterTasks(state),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchClusterTasks
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ClusterTasksContainer));
