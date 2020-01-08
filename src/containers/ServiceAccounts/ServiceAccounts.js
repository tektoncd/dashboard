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
import isEqual from 'lodash.isequal';
// import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
// import { getErrorMessage, urls } from '@tektoncd/dashboard-utils';
import { getErrorMessage } from '@tektoncd/dashboard-utils';
import { InlineNotification } from 'carbon-components-react';
import { LabelFilter, Table } from '@tektoncd/dashboard-components';
import { fetchServiceAccounts } from '../../actions/serviceAccounts';
import {
  getSelectedNamespace,
  getServiceAccounts,
  getServiceAccountsErrorMessage,
  isFetchingServiceAccounts,
  isWebSocketConnected
} from '../../reducers';

export /* istanbul ignore next */ class ServiceAccounts extends Component {
  componentDidMount() {
    this.fetchServiceAccounts();
  }

  componentDidUpdate(prevProps) {
    const { filters, namespace, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      namespace: prevNamespace,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;

    if (
      !isEqual(filters, prevFilters) ||
      namespace !== prevNamespace ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchServiceAccounts();
    }
  }

  handleAddFilter = labelFilters => {
    const queryParams = `?${new URLSearchParams({
      labelSelector: labelFilters
    }).toString()}`;

    const currentURL = this.props.match.url;
    const browserURL = currentURL.concat(queryParams);
    this.props.history.push(browserURL);
  };

  handleDeleteFilter = filter => {
    const currentQueryParams = new URLSearchParams(this.props.location.search);
    const labelFilters = currentQueryParams.getAll('labelSelector');
    const labelFiltersArray = labelFilters.toString().split(',');
    const index = labelFiltersArray.indexOf(filter);
    labelFiltersArray.splice(index, 1);

    const currentURL = this.props.match.url;
    if (labelFiltersArray.length === 0) {
      this.props.history.push(currentURL);
    } else {
      const newQueryParams = `?${new URLSearchParams({
        labelSelector: labelFiltersArray
      }).toString()}`;
      const browserURL = currentURL.concat(newQueryParams);
      this.props.history.push(browserURL);
    }
  };

  fetchServiceAccounts() {
    const { filters, namespace } = this.props;
    this.props.fetchServiceAccounts({
      filters,
      namespace
    });
  }

  render() {
    const {
      error,
      filters,
      intl,
      loading,
      selectedNamespace,
      serviceAccounts
    } = this.props;

    const initialHeaders = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'namespace',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.namespace',
          defaultMessage: 'Namespace'
        })
      }
    ];

    const serviceAccountsFormatted = serviceAccounts.map(serviceAccount => ({
      id: `${serviceAccount.metadata.namespace}:${
        serviceAccount.metadata.name
      }`,
      name: serviceAccount.metadata.name,
      namespace: serviceAccount.metadata.namespace
    }));

    return (
      <>
        {error && (
          <InlineNotification
            kind="error"
            title={intl.formatMessage({
              id: 'dashboard.error.title',
              defaultMessage: 'Error:'
            })}
            subtitle={getErrorMessage(error)}
            iconDescription={intl.formatMessage({
              id: 'dashboard.notification.clear',
              defaultMessage: 'Clear Notification'
            })}
            className="notificationComponent"
            data-testid="errorNotificationComponent"
            lowContrast
          />
        )}
        <h1>ServiceAccounts</h1>
        <LabelFilter
          filters={filters}
          handleAddFilter={this.handleAddFilter}
          handleDeleteFilter={this.handleDeleteFilter}
        />
        <Table
          headers={initialHeaders}
          rows={serviceAccountsFormatted}
          loading={loading}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No {kind} under any namespace.'
            },
            { kind: 'ServiceAccounts' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage: 'No {kind} under namespace {selectedNamespace}'
            },
            { kind: 'ServiceAccounts', selectedNamespace }
          )}
        />
      </>
    );
  }
}

function fetchFilters(searchQuery) {
  const queryParams = new URLSearchParams(searchQuery);
  let filters = [];
  queryParams.forEach(function filterValueSplit(value) {
    filters = value.split(',');
  });
  return filters;
}

function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const filters = fetchFilters(props.location.search);
  const namespace = namespaceParam || getSelectedNamespace(state);

  return {
    error: getServiceAccountsErrorMessage(state),
    filters,
    loading: isFetchingServiceAccounts(state),
    serviceAccounts: getServiceAccounts(state, { filters, namespace }),
    selectedNamespace: namespace,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchServiceAccounts
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ServiceAccounts));
