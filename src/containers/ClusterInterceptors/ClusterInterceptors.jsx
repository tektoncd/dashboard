/*
Copyright 2021-2024 The Tekton Authors
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

import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom-v5-compat';
import { useIntl } from 'react-intl';
import { getFilters, urls, useTitleSync } from '@tektoncd/dashboard-utils';
import {
  Link as CustomLink,
  FormattedDate,
  Table
} from '@tektoncd/dashboard-components';

import ListPageLayout from '../ListPageLayout';
import { useClusterInterceptors } from '../../api';

function getFormattedResources(resources) {
  return resources.map(clusterInterceptor => ({
    id: clusterInterceptor.metadata.uid,
    name: (
      <Link
        component={CustomLink}
        to={urls.rawCRD.cluster({
          name: clusterInterceptor.metadata.name,
          type: 'clusterinterceptors'
        })}
        title={clusterInterceptor.metadata.name}
      >
        {clusterInterceptor.metadata.name}
      </Link>
    ),
    createdTime: (
      <FormattedDate
        date={clusterInterceptor.metadata.creationTimestamp}
        relative
      />
    )
  }));
}

function ClusterInterceptors() {
  const intl = useIntl();
  const location = useLocation();
  const filters = getFilters(location);

  useTitleSync({ page: 'ClusterInterceptors' });

  const {
    data: clusterInterceptors = [],
    error,
    isLoading
  } = useClusterInterceptors({ filters });

  function getError() {
    if (error) {
      return {
        error,
        title: intl.formatMessage(
          {
            id: 'dashboard.resourceList.errorLoading',
            defaultMessage: 'Error loading {type}'
          },
          { type: 'ClusterInterceptors' }
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
      key: 'createdTime',
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
      resources={clusterInterceptors}
      title="ClusterInterceptors"
    >
      {({ resources }) => (
        <Table
          headers={headers}
          rows={getFormattedResources(resources)}
          loading={isLoading}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.clusterResource',
              defaultMessage: 'No matching {kind} found'
            },
            { kind: 'ClusterInterceptors' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.clusterResource',
              defaultMessage: 'No matching {kind} found'
            },
            { kind: 'ClusterInterceptors' }
          )}
        />
      )}
    </ListPageLayout>
  );
}

export default ClusterInterceptors;
