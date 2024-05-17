/*
Copyright 2019-2024 The Tekton Authors
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

import { useLocation, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { getFilters, urls, useTitleSync } from '@tektoncd/dashboard-utils';
import { FormattedDate, Link, Table } from '@tektoncd/dashboard-components';

import ListPageLayout from '../ListPageLayout';
import { useEventListeners, useSelectedNamespace } from '../../api';

function getFormattedResources(resources) {
  return resources.map(listener => ({
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
}

function EventListeners() {
  const intl = useIntl();
  const location = useLocation();
  const params = useParams();
  const filters = getFilters(location);

  useTitleSync({ page: 'EventListeners' });

  const { selectedNamespace: defaultNamespace } = useSelectedNamespace();
  const { namespace: selectedNamespace = defaultNamespace } = params;

  const {
    data: eventListeners = [],
    error,
    isLoading
  } = useEventListeners({
    filters,
    namespace: selectedNamespace
  });

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

  return (
    <ListPageLayout
      error={getError()}
      filters={filters}
      resources={eventListeners}
      title="EventListeners"
    >
      {({ resources }) => (
        <Table
          headers={initialHeaders}
          rows={getFormattedResources(resources)}
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
      )}
    </ListPageLayout>
  );
}

export default EventListeners;
