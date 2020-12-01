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
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';
import { InlineNotification } from 'carbon-components-react';
import { Information16 } from '@carbon/icons-react';
import {
  getErrorMessage,
  getFilters,
  getTitle,
  urls
} from '@tektoncd/dashboard-utils';

import { ListPageLayout } from '..';
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
    document.title = getTitle({ page: 'ClusterTasks' });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { filters, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    if (
      (webSocketConnected && prevWebSocketConnected === false) ||
      !isEqual(filters, prevFilters)
    ) {
      this.fetchData();
    }
  }

  fetchData() {
    const { filters } = this.props;
    this.props.fetchClusterTasks({ filters });
  }

  render() {
    const { error, loading, clusterTasks, intl } = this.props;
    const initialHeaders = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'createdTime',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.createdTime',
          defaultMessage: 'Created'
        })
      },
      {
        key: 'actions',
        header: ''
      }
    ];

    const clusterTasksFormatted = clusterTasks.map(clusterTask => ({
      id: `${clusterTask.metadata.namespace}:${clusterTask.metadata.name}`,
      name: (
        <Link
          to={urls.taskRuns.byClusterTask({
            taskName: clusterTask.metadata.name
          })}
          title={clusterTask.metadata.name}
        >
          {clusterTask.metadata.name}
        </Link>
      ),
      createdTime: (
        <FormattedDate date={clusterTask.metadata.creationTimestamp} relative />
      ),
      actions: (
        <Link
          to={urls.rawCRD.cluster({
            type: 'clustertasks',
            name: clusterTask.metadata.name
          })}
        >
          <Information16 className="tkn--resource-info-icon">
            <title>
              {intl.formatMessage(
                {
                  id: 'dashboard.resourceList.viewDetails',
                  defaultMessage: 'View {resource}'
                },
                { resource: clusterTask.metadata.name }
              )}
            </title>
          </Information16>
        </Link>
      )
    }));

    if (error) {
      return (
        <InlineNotification
          hideCloseButton
          kind="error"
          title={intl.formatMessage({
            id: 'dashboard.clusterTasks.errorLoading',
            defaultMessage: 'Error loading ClusterTasks'
          })}
          subtitle={getErrorMessage(error)}
          lowContrast
        />
      );
    }
    return (
      <ListPageLayout
        hideNamespacesDropdown
        title="ClusterTasks"
        {...this.props}
      >
        <Table
          headers={initialHeaders}
          rows={clusterTasksFormatted}
          loading={loading && !clusterTasksFormatted.length}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.clusterResource',
              defaultMessage: 'No {kind}'
            },
            { kind: 'ClusterTasks' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.clusterResource',
              defaultMessage: 'No {kind}'
            },
            { kind: 'ClusterTasks' }
          )}
        />
      </ListPageLayout>
    );
  }
}

ClusterTasksContainer.defaultProps = {
  clusterTasks: [],
  filters: []
};

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const filters = getFilters(props.location);
  return {
    clusterTasks: getClusterTasks(state, { filters }),
    error: getClusterTasksErrorMessage(state),
    filters,
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
