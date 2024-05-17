/*
Copyright 2020-2024 The Tekton Authors
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

import { useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { getFilters, urls, useTitleSync } from '@tektoncd/dashboard-utils';
import { FormattedDate, Link, Table } from '@tektoncd/dashboard-components';

import ListPageLayout from '../ListPageLayout';
import { useClusterTriggerBindings } from '../../api';

function getFormattedResources(resources) {
  return resources.map(binding => ({
    id: `${binding.metadata.name}`,
    name: (
      <Link
        to={urls.clusterTriggerBindings.byName({
          clusterTriggerBindingName: binding.metadata.name
        })}
        title={binding.metadata.name}
      >
        {binding.metadata.name}
      </Link>
    ),
    date: <FormattedDate date={binding.metadata.creationTimestamp} relative />
  }));
}

function ClusterTriggerBindings() {
  const intl = useIntl();
  const location = useLocation();
  const filters = getFilters(location);

  useTitleSync({ page: 'ClusterTriggerBindings' });

  const {
    data: clusterTriggerBindings = [],
    error,
    isLoading
  } = useClusterTriggerBindings({ filters });

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

  return (
    <ListPageLayout
      error={getError()}
      filters={filters}
      resources={clusterTriggerBindings}
      title="ClusterTriggerBindings"
    >
      {({ resources }) => (
        <Table
          headers={initialHeaders}
          rows={getFormattedResources(resources)}
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
      )}
    </ListPageLayout>
  );
}

export default ClusterTriggerBindings;
