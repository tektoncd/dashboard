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
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { useTitleSync } from '@tektoncd/dashboard-utils';
import { ResourceDetails, Table } from '@tektoncd/dashboard-components';

import { useCondition } from '../../api';
import { getViewChangeHandler } from '../../utils';

function ConditionParameters({ condition, intl }) {
  if (!condition || !condition.spec.params) {
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
      key: 'default',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.default',
        defaultMessage: 'Default'
      })
    },
    {
      key: 'type',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.type',
        defaultMessage: 'Type'
      })
    }
  ];

  const rows = condition.spec.params.map(
    ({ name, default: defaultValue, type = 'string' }) => ({
      id: name,
      name,
      default: defaultValue,
      type
    })
  );

  return (
    <Table
      title={intl.formatMessage({
        id: 'dashboard.parameters.title',
        defaultMessage: 'Parameters'
      })}
      headers={headers}
      rows={rows}
    />
  );
}

export function ConditionContainer({ intl }) {
  const history = useHistory();
  const location = useLocation();
  const params = useParams();
  const { conditionName, namespace } = params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  useTitleSync({
    page: 'Condition',
    resourceName: conditionName
  });

  const { data: condition, error } = useCondition({
    name: conditionName,
    namespace
  });

  return (
    <ResourceDetails
      error={error}
      kind="Condition"
      onViewChange={getViewChangeHandler({ history, location })}
      resource={condition}
      view={view}
    >
      <ConditionParameters condition={condition} intl={intl} />
    </ResourceDetails>
  );
}

export default injectIntl(ConditionContainer);
