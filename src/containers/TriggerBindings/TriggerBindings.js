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
import { connect } from 'react-redux';
import isEqual from 'lodash.isequal';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import {
  getErrorMessage,
  getFilters,
  getTitle,
  urls
} from '@tektoncd/dashboard-utils';
import { InlineNotification } from 'carbon-components-react';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';

import { ListPageLayout } from '..';
import { fetchTriggerBindings } from '../../actions/triggerBindings';
import {
  getSelectedNamespace,
  getTriggerBindings,
  getTriggerBindingsErrorMessage,
  isFetchingTriggerBindings,
  isWebSocketConnected
} from '../../reducers';

export /* istanbul ignore next */ class TriggerBindings extends Component {
  componentDidMount() {
    document.title = getTitle({ page: 'TriggerBindings' });
    this.fetchTriggerBindings();
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
      this.fetchTriggerBindings();
    }
  }

  fetchTriggerBindings() {
    const { filters, namespace } = this.props;
    this.props.fetchTriggerBindings({
      filters,
      namespace
    });
  }

  render() {
    const {
      error,
      intl,
      loading,
      selectedNamespace,
      triggerBindings
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
        header: 'Namespace'
      },
      {
        key: 'date',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.createdTime',
          defaultMessage: 'Created'
        })
      }
    ];

    const triggerBindingsFormatted = triggerBindings.map(binding => ({
      id: `${binding.metadata.namespace}:${binding.metadata.name}`,
      name: (
        <Link
          to={urls.triggerBindings.byName({
            namespace: binding.metadata.namespace,
            triggerBindingName: binding.metadata.name
          })}
          title={binding.metadata.name}
        >
          {binding.metadata.name}
        </Link>
      ),
      namespace: binding.metadata.namespace,
      date: <FormattedDate date={binding.metadata.creationTimestamp} relative />
    }));

    return (
      <ListPageLayout title="TriggerBindings" {...this.props}>
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
            data-testid="errorNotificationComponent"
            lowContrast
          />
        )}
        <Table
          headers={initialHeaders}
          rows={triggerBindingsFormatted}
          loading={loading && !triggerBindingsFormatted.length}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No {kind} in any namespace.'
            },
            { kind: 'TriggerBindings' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage: 'No {kind} in namespace {selectedNamespace}'
            },
            { kind: 'TriggerBindings', selectedNamespace }
          )}
        />
      </ListPageLayout>
    );
  }
}

function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const filters = getFilters(props.location);
  const namespace = namespaceParam || getSelectedNamespace(state);

  return {
    error: getTriggerBindingsErrorMessage(state),
    filters,
    loading: isFetchingTriggerBindings(state),
    triggerBindings: getTriggerBindings(state, { filters, namespace }),
    selectedNamespace: namespace,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchTriggerBindings
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TriggerBindings));
