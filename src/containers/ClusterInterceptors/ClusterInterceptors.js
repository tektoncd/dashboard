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
import { Link, useLocation } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { getFilters, urls, useTitleSync } from '@tektoncd/dashboard-utils';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';
import { Link as CarbonLink } from 'carbon-components-react';

import { ListPageLayout } from '..';
import { useClusterInterceptors } from '../../api';

function ClusterInterceptors({ intl }) {
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

  const clusterInterceptorsFormatted = clusterInterceptors.map(
    clusterInterceptor => ({
      id: clusterInterceptor.metadata.uid,
      name: (
        <Link
          component={CarbonLink}
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
    })
  );

  return (
    <ListPageLayout
      error={getError()}
      filters={filters}
      hideNamespacesDropdown
      title="ClusterInterceptors"
    >
      <Table
        headers={headers}
        rows={clusterInterceptorsFormatted}
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
    </ListPageLayout>
  );
}

export default injectIntl(ClusterInterceptors);
