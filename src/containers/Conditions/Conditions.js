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
import { Link, useLocation, useParams } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { getFilters, urls, useTitleSync } from '@tektoncd/dashboard-utils';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';
import { Link as CarbonLink } from 'carbon-components-react';

import { useConditions, useSelectedNamespace } from '../../api';
import { ListPageLayout } from '..';

function Conditions({ intl }) {
  const location = useLocation();
  const params = useParams();
  useTitleSync({ page: 'Conditions' });

  const { selectedNamespace } = useSelectedNamespace();
  const { namespace = selectedNamespace } = params;
  const filters = getFilters(location);

  const {
    data: conditions = [],
    error,
    isLoading
  } = useConditions({
    filters,
    namespace
  });

  function getError() {
    if (error) {
      return {
        error,
        title: intl.formatMessage({
          id: 'dashboard.conditions.errorLoading',
          defaultMessage: 'Error loading Conditions'
        })
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

  const conditionsFormatted = conditions.map(condition => ({
    id: condition.metadata.uid,
    name: (
      <Link
        component={CarbonLink}
        to={urls.conditions.byName({
          namespace: condition.metadata.namespace,
          conditionName: condition.metadata.name
        })}
        title={condition.metadata.name}
      >
        {condition.metadata.name}
      </Link>
    ),
    namespace: condition.metadata.namespace,
    createdTime: (
      <FormattedDate date={condition.metadata.creationTimestamp} relative />
    )
  }));

  return (
    <ListPageLayout error={getError()} filters={filters} title="Conditions">
      <Table
        headers={headers}
        rows={conditionsFormatted}
        loading={isLoading}
        selectedNamespace={namespace}
        emptyTextAllNamespaces={intl.formatMessage(
          {
            id: 'dashboard.emptyState.allNamespaces',
            defaultMessage: 'No matching {kind} found'
          },
          { kind: 'Conditions' }
        )}
        emptyTextSelectedNamespace={intl.formatMessage(
          {
            id: 'dashboard.emptyState.selectedNamespace',
            defaultMessage:
              'No matching {kind} found in namespace {selectedNamespace}'
          },
          { kind: 'Conditions', selectedNamespace: namespace }
        )}
      />
    </ListPageLayout>
  );
}

export default injectIntl(Conditions);
