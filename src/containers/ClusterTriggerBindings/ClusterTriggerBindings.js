/*
Copyright 2020-2021 The Tekton Authors
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
import isEqual from 'lodash.isequal';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { getFilters, getTitle, urls } from '@tektoncd/dashboard-utils';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';

import { ListPageLayout } from '..';
import { fetchClusterTriggerBindings } from '../../actions/clusterTriggerBindings';
import {
  getClusterTriggerBindings,
  getClusterTriggerBindingsErrorMessage,
  isFetchingClusterTriggerBindings,
  isWebSocketConnected
} from '../../reducers';

export /* istanbul ignore next */ class ClusterTriggerBindings extends Component {
  componentDidMount() {
    document.title = getTitle({ page: 'ClusterTriggerBindings' });
    this.fetchClusterTriggerBindings();
  }

  componentDidUpdate(prevProps) {
    const { filters, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;

    if (
      !isEqual(filters, prevFilters) ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchClusterTriggerBindings();
    }
  }

  getError() {
    const { error } = this.props;
    if (error) {
      return { error };
    }

    return null;
  }

  fetchClusterTriggerBindings() {
    const { filters } = this.props;
    this.props.fetchClusterTriggerBindings({
      filters
    });
  }

  render() {
    const { intl, loading, clusterTriggerBindings } = this.props;
    const initialHeaders = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'date',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.createdTime',
          defaultMessage: 'Created'
        })
      }
    ];

    const clusterTriggerBindingsFormatted = clusterTriggerBindings.map(
      binding => ({
        id: `${binding.metadata.name}`,
        name: (
          <Link
            to={urls.clusterTriggerBindings.byName({
              clusterTriggerBindingName: binding.metadata.name
            })}
            title={binding.metadata.name}
          >
            {binding.metadata.name}
          </Link>
        ),
        date: (
          <FormattedDate date={binding.metadata.creationTimestamp} relative />
        )
      })
    );

    return (
      <ListPageLayout
        {...this.props}
        error={this.getError()}
        hideNamespacesDropdown
        title="ClusterTriggerBindings"
      >
        <Table
          headers={initialHeaders}
          rows={clusterTriggerBindingsFormatted}
          loading={loading && !clusterTriggerBindingsFormatted.length}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.clusterResource',
              defaultMessage: 'No matching {kind} found'
            },
            { kind: 'ClusterTriggerBindings' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.clusterResource',
              defaultMessage: 'No matching {kind} found'
            },
            { kind: 'ClusterTriggerBindings' }
          )}
        />
      </ListPageLayout>
    );
  }
}

function mapStateToProps(state, props) {
  const filters = getFilters(props.location);

  return {
    error: getClusterTriggerBindingsErrorMessage(state),
    filters,
    loading: isFetchingClusterTriggerBindings(state),
    clusterTriggerBindings: getClusterTriggerBindings(state, { filters }),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchClusterTriggerBindings
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ClusterTriggerBindings));
