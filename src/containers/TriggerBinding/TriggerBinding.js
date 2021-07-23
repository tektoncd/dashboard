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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { ResourceDetails, Table } from '@tektoncd/dashboard-components';
import {
  useTitleSync,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';

import { isWebSocketConnected } from '../../reducers';
import { useSelectedNamespace, useTriggerBinding } from '../../api';
import { getViewChangeHandler } from '../../utils';

export function TriggerBindingContainer(props) {
  const { intl, match, view, webSocketConnected } = props;
  const { namespace, triggerBindingName: resourceName } = match.params;

  const { selectedNamespace: defaultNamespace } = useSelectedNamespace();
  const selectedNamespace = namespace || defaultNamespace;

  useTitleSync({
    page: 'TriggerBinding',
    resourceName
  });

  const {
    data: triggerBinding,
    error,
    isFetching,
    refetch
  } = useTriggerBinding({ name: resourceName, namespace });

  useWebSocketReconnected(refetch, webSocketConnected);

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
    triggerBinding?.spec.params.map(({ name, value }) => ({
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
      onViewChange={getViewChangeHandler(props)}
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

TriggerBindingContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      triggerBindingName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { location } = ownProps;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  return {
    view,
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(TriggerBindingContainer));
