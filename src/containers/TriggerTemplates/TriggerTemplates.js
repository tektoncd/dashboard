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
import { Link, useLocation, useParams } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { getFilters, urls, useTitleSync } from '@tektoncd/dashboard-utils';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';
import { Link as CarbonLink } from 'carbon-components-react';

import { ListPageLayout } from '..';
import { useSelectedNamespace, useTriggerTemplates } from '../../api';

function TriggerTemplates({ intl }) {
  useTitleSync({ page: 'TriggerTemplates' });

  const location = useLocation();
  const params = useParams();
  const filters = getFilters(location);
  const { selectedNamespace: defaultNamespace } = useSelectedNamespace();
  const { namespace: selectedNamespace = defaultNamespace } = params;

  const {
    data: triggerTemplates = [],
    error,
    isLoading
  } = useTriggerTemplates({ filters, namespace: selectedNamespace });

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

  const triggerTemplatesFormatted = triggerTemplates.map(template => ({
    id: `${template.metadata.namespace}:${template.metadata.name}`,
    name: (
      <Link
        component={CarbonLink}
        to={urls.triggerTemplates.byName({
          namespace: template.metadata.namespace,
          triggerTemplateName: template.metadata.name
        })}
        title={template.metadata.name}
      >
        {template.metadata.name}
      </Link>
    ),
    namespace: template.metadata.namespace,
    date: <FormattedDate date={template.metadata.creationTimestamp} relative />
  }));

  return (
    <ListPageLayout
      error={getError()}
      filters={filters}
      title="TriggerTemplates"
    >
      <Table
        headers={initialHeaders}
        rows={triggerTemplatesFormatted}
        loading={isLoading}
        selectedNamespace={selectedNamespace}
        emptyTextAllNamespaces={intl.formatMessage(
          {
            id: 'dashboard.emptyState.allNamespaces',
            defaultMessage: 'No matching {kind} found'
          },
          { kind: 'TriggerTemplates' }
        )}
        emptyTextSelectedNamespace={intl.formatMessage(
          {
            id: 'dashboard.emptyState.selectedNamespace',
            defaultMessage:
              'No matching {kind} found in namespace {selectedNamespace}'
          },
          { kind: 'TriggerTemplates', selectedNamespace }
        )}
      />
    </ListPageLayout>
  );
}

export default injectIntl(TriggerTemplates);
