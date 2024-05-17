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

import { useLocation, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { getFilters, urls, useTitleSync } from '@tektoncd/dashboard-utils';
import { FormattedDate, Link, Table } from '@tektoncd/dashboard-components';

import ListPageLayout from '../ListPageLayout';
import { useSelectedNamespace, useTriggers } from '../../api';

function getFormattedResources(resources) {
  return resources.map(trigger => ({
    id: trigger.metadata.uid,
    name: (
      <Link
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
}

function Triggers() {
  const intl = useIntl();
  useTitleSync({ page: 'Triggers' });

  const location = useLocation();
  const params = useParams();
  const filters = getFilters(location);
  const { selectedNamespace } = useSelectedNamespace();
  const { namespace = selectedNamespace } = params;

  const {
    data: triggers = [],
    error,
    isLoading
  } = useTriggers({
    filters,
    namespace
  });

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

  return (
    <ListPageLayout
      error={getError()}
      filters={filters}
      resources={triggers}
      title="Triggers"
    >
      {({ resources }) => (
        <Table
          headers={headers}
          rows={getFormattedResources(resources)}
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
      )}
    </ListPageLayout>
  );
}

export default Triggers;
