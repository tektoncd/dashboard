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
import { useClusterTriggerBindings } from '../../api';
import { isWebSocketConnected } from '../../reducers';

function ClusterTriggerBindings(props) {
  const { filters, intl, webSocketConnected } = props;

  useTitleSync({ page: 'ClusterTriggerBindings' });

  const {
    data: clusterTriggerBindings = [],
    error,
    isLoading,
    refetch
  } = useClusterTriggerBindings({ filters });

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
          component={CarbonLink}
          to={urls.clusterTriggerBindings.byName({
            clusterTriggerBindingName: binding.metadata.name
          })}
          title={binding.metadata.name}
        >
          {binding.metadata.name}
        </Link>
      ),
      date: <FormattedDate date={binding.metadata.creationTimestamp} relative />
    })
  );

  return (
    <ListPageLayout
      {...props}
      error={getError()}
      hideNamespacesDropdown
      title="ClusterTriggerBindings"
    >
      <Table
        headers={initialHeaders}
        rows={clusterTriggerBindingsFormatted}
        loading={isLoading}
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

function mapStateToProps(state, props) {
  const filters = getFilters(props.location);

  return {
    filters,
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(ClusterTriggerBindings));
