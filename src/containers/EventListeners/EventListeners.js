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

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import {
  getFilters,
  urls,
  useTitleSync,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';
import { Link as CarbonLink } from 'carbon-components-react';

import { ListPageLayout } from '..';
import { useEventListeners, useSelectedNamespace } from '../../api';
import { isWebSocketConnected } from '../../reducers';

function EventListeners(props) {
  const { filters, intl, webSocketConnected } = props;

  useTitleSync({ page: 'EventListeners' });

  const { selectedNamespace: defaultNamespace } = useSelectedNamespace();
  const {
    namespace: selectedNamespace = defaultNamespace
  } = props.match.params;

  const {
    data: eventListeners = [],
    error,
    isLoading,
    refetch
  } = useEventListeners({ filters, namespace: selectedNamespace });

  useWebSocketReconnected(refetch, webSocketConnected);

  function getError() {
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
        component={CarbonLink}
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
        loading={isLoading}
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
  const filters = getFilters(props.location);

  return {
    filters,
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(EventListeners));
