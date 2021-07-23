/*
Copyright 2021 The Tekton Authors
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
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
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
import { useSelectedNamespace, useTriggers } from '../../api';
import { isWebSocketConnected as selectIsWebSocketConnected } from '../../reducers';

function Triggers(props) {
  const { filters, intl, match, webSocketConnected } = props;
  useTitleSync({ page: 'Triggers' });

  const { selectedNamespace } = useSelectedNamespace();
  const { namespace = selectedNamespace } = match.params;

  const { data: triggers = [], error, isLoading, refetch } = useTriggers({
    filters,
    namespace
  });

  useWebSocketReconnected(refetch, webSocketConnected);

  function getError() {
    if (error) {
      return {
        error,
        title: intl.formatMessage(
          {
            id: 'dashboard.resourceList.errorLoading',
            defaultMessage: 'Error loading {type}'
          },
          { type: 'Triggers' }
        )
      };
    }

    return null;
  }

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

  const triggersFormatted = triggers.map(trigger => ({
    id: trigger.metadata.uid,
    name: (
      <Link
        component={CarbonLink}
        to={urls.triggers.byName({
          namespace: trigger.metadata.namespace,
          triggerName: trigger.metadata.name
        })}
        title={trigger.metadata.name}
      >
        {trigger.metadata.name}
      </Link>
    ),
    namespace: trigger.metadata.namespace,
    createdTime: (
      <FormattedDate date={trigger.metadata.creationTimestamp} relative />
    )
  }));

  return (
    <ListPageLayout {...props} error={getError()} title="Triggers">
      <Table
        headers={headers}
        rows={triggersFormatted}
        loading={isLoading}
        selectedNamespace={namespace}
        emptyTextAllNamespaces={intl.formatMessage(
          {
            id: 'dashboard.emptyState.allNamespaces',
            defaultMessage: 'No matching {kind} found'
          },
          { kind: 'Triggers' }
        )}
        emptyTextSelectedNamespace={intl.formatMessage(
          {
            id: 'dashboard.emptyState.selectedNamespace',
            defaultMessage:
              'No matching {kind} found in namespace {selectedNamespace}'
          },
          { kind: 'Triggers', selectedNamespace: namespace }
        )}
      />
    </ListPageLayout>
  );
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const filters = getFilters(props.location);

  return {
    filters,
    webSocketConnected: selectIsWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(Triggers));
