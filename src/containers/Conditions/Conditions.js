/*
Copyright 2020 The Tekton Authors
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
import {
  getErrorMessage,
  getFilters,
  getTitle,
  urls
} from '@tektoncd/dashboard-utils';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';
import { InlineNotification } from 'carbon-components-react';

import { ListPageLayout } from '..';
import { fetchConditions } from '../../actions/conditions';
import {
  getConditions,
  getConditionsErrorMessage,
  getSelectedNamespace,
  isFetchingConditions,
  isWebSocketConnected
} from '../../reducers';

export class Conditions extends Component {
  componentDidMount() {
    document.title = getTitle({ page: 'Conditions' });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { filters, namespace, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      namespace: prevNamespace,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;

    if (
      namespace !== prevNamespace ||
      (webSocketConnected && prevWebSocketConnected === false) ||
      !isEqual(filters, prevFilters)
    ) {
      this.fetchData();
    }
  }

  fetchData() {
    const { filters, namespace } = this.props;
    this.props.fetchConditions({
      filters,
      namespace
    });
  }

  render() {
    const {
      error,
      loading,
      conditions,
      intl,
      namespace: selectedNamespace
    } = this.props;

    const headers = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'namespace',
        header: 'Namespace'
      },
      {
        key: 'createdTime',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.createdTime',
          defaultMessage: 'Created'
        })
      }
    ];

    const conditionsFormatted = conditions.map(condition => ({
      id: condition.metadata.uid,
      name: (
        <Link
          to={urls.conditions.byName({
            namespace: condition.metadata.namespace,
            conditionName: condition.metadata.name
          })}
          title={condition.metadata.name}
        >
          {condition.metadata.name}
        </Link>
      ),
      namespace: condition.metadata.namespace,
      createdTime: (
        <FormattedDate date={condition.metadata.creationTimestamp} relative />
      )
    }));

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.conditions.errorLoading',
            defaultMessage: 'Error loading Conditions'
          })}
          subtitle={getErrorMessage(error)}
        />
      );
    }

    return (
      <ListPageLayout title="Conditions" {...this.props}>
        <Table
          headers={headers}
          rows={conditionsFormatted}
          loading={loading && !conditionsFormatted.length}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No {kind} in any namespace.'
            },
            { kind: 'Conditions' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage: 'No {kind} in namespace {selectedNamespace}'
            },
            { kind: 'Conditions', selectedNamespace }
          )}
        />
      </ListPageLayout>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);
  const filters = getFilters(props.location);

  return {
    error: getConditionsErrorMessage(state),
    filters,
    loading: isFetchingConditions(state),
    namespace,
    conditions: getConditions(state, { filters, namespace }),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchConditions
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Conditions));
