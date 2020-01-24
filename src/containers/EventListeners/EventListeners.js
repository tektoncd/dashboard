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
  getAddFilterHandler,
  getDeleteFilterHandler,
  getErrorMessage,
  getFilters,
  urls
} from '@tektoncd/dashboard-utils';
import { InlineNotification } from 'carbon-components-react';
import {
  FormattedDate,
  LabelFilter,
  Table
} from '@tektoncd/dashboard-components';
import { fetchEventListeners } from '../../actions/eventListeners';
import {
  getEventListeners,
  getEventListenersErrorMessage,
  getSelectedNamespace,
  isFetchingEventListeners,
  isWebSocketConnected
} from '../../reducers';

export /* istanbul ignore next */ class EventListeners extends Component {
  componentDidMount() {
    this.fetchEventListeners();
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
      this.fetchEventListeners();
    }
  }

  fetchEventListeners() {
    const { filters, namespace } = this.props;
    this.props.fetchEventListeners({
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
      eventListeners
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
      },
      {
        key: 'date',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.createdTime',
          defaultMessage: 'Created'
        })
      }
    ];

    const eventListenersFormatted = eventListeners.map(listener => ({
      id: `${listener.metadata.namespace}:${listener.metadata.name}`,
      name: (
        <Link
          to={urls.eventListeners.byName({
            namespace: listener.metadata.namespace,
            eventListenerName: listener.metadata.name
          })}
          title={listener.metadata.name}
        >
          {listener.metadata.name}
        </Link>
      ),
      namespace: (
        <span title={listener.metadata.namespace}>
          {listener.metadata.namespace}
        </span>
      ),
      date: (
        <FormattedDate date={listener.metadata.creationTimestamp} relative />
      )
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
        <h1>EventListeners</h1>
        <LabelFilter
          filters={filters}
          handleAddFilter={getAddFilterHandler(this.props)}
          handleDeleteFilter={getDeleteFilterHandler(this.props)}
        />
        <Table
          headers={initialHeaders}
          rows={eventListenersFormatted}
          loading={loading}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No {kind} under any namespace.'
            },
            { kind: 'EventListeners' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage: 'No {kind} under namespace {selectedNamespace}'
            },
            { kind: 'EventListeners', selectedNamespace }
          )}
        />
      </>
    );
  }
}

function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const filters = getFilters(props.location);
  const namespace = namespaceParam || getSelectedNamespace(state);

  return {
    error: getEventListenersErrorMessage(state),
    filters,
    loading: isFetchingEventListeners(state),
    eventListeners: getEventListeners(state, { filters, namespace }),
    selectedNamespace: namespace,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchEventListeners
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(EventListeners));
