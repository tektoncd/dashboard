/*
Copyright 2019-2021 The Tekton Authors
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

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import {
  getFilters,
  getTitle,
  urls,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';

import { ListPageLayout } from '..';
import { fetchEventListeners as fetchEventListenersActionCreator } from '../../actions/eventListeners';
import {
  getEventListeners,
  getEventListenersErrorMessage,
  getSelectedNamespace,
  isFetchingEventListeners,
  isWebSocketConnected
} from '../../reducers';

/* istanbul ignore next */
function EventListeners(props) {
  const {
    eventListeners,
    fetchEventListeners,
    filters,
    intl,
    loading,
    selectedNamespace,
    webSocketConnected
  } = props;

  useEffect(() => {
    document.title = getTitle({ page: 'EventListeners' });
  }, []);

  function fetchData() {
    fetchEventListeners({ filters, namespace: selectedNamespace });
  }

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters), selectedNamespace]);

  useWebSocketReconnected(fetchData, webSocketConnected);

  function getError() {
    const { error } = props;
    if (error) {
      return { error };
    }

    return null;
  }

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
    namespace: listener.metadata.namespace,
    date: <FormattedDate date={listener.metadata.creationTimestamp} relative />
  }));

  return (
    <ListPageLayout {...props} error={getError()} title="EventListeners">
      <Table
        headers={initialHeaders}
        rows={eventListenersFormatted}
        loading={loading && !eventListenersFormatted.length}
        selectedNamespace={selectedNamespace}
        emptyTextAllNamespaces={intl.formatMessage(
          {
            id: 'dashboard.emptyState.allNamespaces',
            defaultMessage: 'No matching {kind} found'
          },
          { kind: 'EventListeners' }
        )}
        emptyTextSelectedNamespace={intl.formatMessage(
          {
            id: 'dashboard.emptyState.selectedNamespace',
            defaultMessage:
              'No matching {kind} found in namespace {selectedNamespace}'
          },
          { kind: 'EventListeners', selectedNamespace }
        )}
      />
    </ListPageLayout>
  );
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
  fetchEventListeners: fetchEventListenersActionCreator
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(EventListeners));
