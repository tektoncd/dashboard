/*
Copyright 2022-2024 The Tekton Authors
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
import { useInterceptors, useSelectedNamespace } from '../../api';

function getFormattedResources(resources) {
  return resources.map(interceptor => ({
    id: `${interceptor.metadata.namespace}:${interceptor.metadata.name}`,
    name: (
      <Link
        to={urls.interceptors.byName({
          namespace: interceptor.metadata.namespace,
          interceptorName: interceptor.metadata.name
        })}
        title={interceptor.metadata.name}
      >
        {interceptor.metadata.name}
      </Link>
    ),
    namespace: interceptor.metadata.namespace,
    date: (
      <FormattedDate date={interceptor.metadata.creationTimestamp} relative />
    )
  }));
}

export function Interceptors() {
  const intl = useIntl();
  const location = useLocation();
  const params = useParams();
  const filters = getFilters(location);

  const { selectedNamespace } = useSelectedNamespace();
  const { namespace = selectedNamespace } = params;

  useTitleSync({ page: 'Interceptors' });

  const {
    data: interceptors = [],
    error,
    isLoading
  } = useInterceptors({
    filters,
    namespace
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
      resources={interceptors}
      title="Interceptors"
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
            { kind: 'Interceptors' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage:
                'No matching {kind} found in namespace {selectedNamespace}'
            },
            { kind: 'Interceptors', selectedNamespace }
          )}
        />
      )}
    </ListPageLayout>
  );
}

export default Interceptors;
