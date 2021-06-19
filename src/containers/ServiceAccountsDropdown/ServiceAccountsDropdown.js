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
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import {
  ALL_NAMESPACES,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import { TooltipDropdown } from '@tektoncd/dashboard-components';

import { useServiceAccounts } from '../../api';
import { getSelectedNamespace, isWebSocketConnected } from '../../reducers';

function ServiceAccountsDropdown({
  intl,
  label,
  namespace,
  webSocketConnected,
  ...rest
}) {
  const {
    data: serviceAccounts = [],
    isFetching,
    refetch
  } = useServiceAccounts({ namespace });
  useWebSocketReconnected(refetch, webSocketConnected);

  const items = serviceAccounts.map(sa => sa.metadata.name);

  const emptyText =
    namespace === ALL_NAMESPACES
      ? intl.formatMessage({
          id: 'dashboard.serviceAccountsDropdown.empty.allNamespaces',
          defaultMessage: 'No ServiceAccounts found'
        })
      : intl.formatMessage(
          {
            id: 'dashboard.serviceAccountsDropdown.empty.selectedNamespace',
            defaultMessage:
              "No ServiceAccounts found in the ''{namespace}'' namespace"
          },
          { namespace }
        );

  const labelString =
    label ||
    intl.formatMessage({
      id: 'dashboard.serviceAccountsDropdown.label',
      defaultMessage: 'Select ServiceAccount'
    });
  return (
    <TooltipDropdown
      {...rest}
      emptyText={emptyText}
      items={items}
      label={labelString}
      loading={isFetching}
    />
  );
}

ServiceAccountsDropdown.defaultProps = {
  titleText: 'ServiceAccount'
};

function mapStateToProps(state, ownProps) {
  const namespace = ownProps.namespace || getSelectedNamespace(state);
  return {
    namespace,
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(ServiceAccountsDropdown));
