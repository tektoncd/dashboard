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
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { ResourceDetails, Table } from '@tektoncd/dashboard-components';
import { useTitleSync } from '@tektoncd/dashboard-utils';
import { useClusterTriggerBinding } from '../../api';
import { getViewChangeHandler } from '../../utils';

export /* istanbul ignore next */ function ClusterTriggerBindingContainer(
  props
) {
  const { intl, location, match } = props;
  const { clusterTriggerBindingName } = match.params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  useTitleSync({
    page: 'ClusterTriggerBinding',
    resourceName: clusterTriggerBindingName
  });

  const {
    data: clusterTriggerBinding,
    error,
    isFetching
  } = useClusterTriggerBinding({ name: clusterTriggerBindingName });

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
    clusterTriggerBinding?.spec.params.map(({ name, value }) => ({
      id: name,
      name,
      value
    })) || [];

  const emptyTextMessage = intl.formatMessage({
    id: 'dashboard.clusterTriggerBinding.noParams',
    defaultMessage: 'No parameters found for this ClusterTriggerBinding.'
  });

  return (
    <ResourceDetails
      error={error}
      loading={isFetching}
      onViewChange={getViewChangeHandler(props)}
      resource={clusterTriggerBinding}
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
        emptyTextAllNamespaces={emptyTextMessage}
        emptyTextSelectedNamespace={emptyTextMessage}
      />
    </ResourceDetails>
  );
}

ClusterTriggerBindingContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      clusterTriggerBindingName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default injectIntl(ClusterTriggerBindingContainer);
