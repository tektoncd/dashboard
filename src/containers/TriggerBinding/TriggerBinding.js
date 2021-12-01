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
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { ResourceDetails, Table } from '@tektoncd/dashboard-components';
import { useTitleSync } from '@tektoncd/dashboard-utils';

import { useSelectedNamespace, useTriggerBinding } from '../../api';
import { getViewChangeHandler } from '../../utils';

export function TriggerBindingContainer({ intl }) {
  const history = useHistory();
  const location = useLocation();
  const params = useParams();
  const { namespace, triggerBindingName: resourceName } = params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  const { selectedNamespace: defaultNamespace } = useSelectedNamespace();
  const selectedNamespace = namespace || defaultNamespace;

  useTitleSync({
    page: 'TriggerBinding',
    resourceName
  });

  const {
    data: triggerBinding,
    error,
    isFetching
  } = useTriggerBinding({
    name: resourceName,
    namespace
  });

  const headersForParameters = [
    {
      key: 'name',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.name',
        defaultMessage: 'Name'
      })
    },
    {
      key: 'value',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.value',
        defaultMessage: 'Value'
      })
    }
  ];

  const rowsForParameters =
    triggerBinding?.spec?.params?.map(({ name, value }) => ({
      id: name,
      name,
      value
    })) || [];

  const emptyTextMessage = intl.formatMessage({
    id: 'dashboard.triggerBinding.noParams',
    defaultMessage: 'No parameters found for this TriggerBinding.'
  });

  return (
    <ResourceDetails
      error={error}
      loading={isFetching}
      onViewChange={getViewChangeHandler({ history, location })}
      resource={triggerBinding}
      view={view}
    >
      <Table
        title={intl.formatMessage({
          id: 'dashboard.parameters.title',
          defaultMessage: 'Parameters'
        })}
        headers={headersForParameters}
        rows={rowsForParameters}
        size="short"
        selectedNamespace={selectedNamespace}
        emptyTextAllNamespaces={emptyTextMessage}
        emptyTextSelectedNamespace={emptyTextMessage}
      />
    </ResourceDetails>
  );
}

export default injectIntl(TriggerBindingContainer);
