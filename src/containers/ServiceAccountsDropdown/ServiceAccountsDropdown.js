/*
Copyright 2019 The Tekton Authors
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
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { TooltipDropdown } from '@tektoncd/dashboard-components';

import {
  getSelectedNamespace,
  getServiceAccounts,
  isFetchingServiceAccounts,
  isWebSocketConnected
} from '../../reducers';
import { fetchServiceAccounts } from '../../actions/serviceAccounts';

class ServiceAccountsDropdown extends React.Component {
  componentDidMount() {
    const { namespace } = this.props;
    this.props.fetchServiceAccounts({ namespace });
  }

  componentDidUpdate(prevProps) {
    const { namespace, webSocketConnected } = this.props;
    const { webSocketConnected: prevWebSocketConnected } = prevProps;
    if (
      namespace !== prevProps.namespace ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.props.fetchServiceAccounts({ namespace });
    }
  }

  render() {
    const {
      fetchServiceAccounts: _fetchServiceAccounts,
      intl,
      label,
      namespace,
      webSocketConnected,
      ...rest
    } = this.props;
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
      <TooltipDropdown {...rest} emptyText={emptyText} label={labelString} />
    );
  }
}

ServiceAccountsDropdown.defaultProps = {
  items: [],
  loading: false,
  titleText: 'ServiceAccount'
};

function mapStateToProps(state, ownProps) {
  const namespace = ownProps.namespace || getSelectedNamespace(state);
  return {
    items: getServiceAccounts(state, { namespace }).map(sa => sa.metadata.name),
    loading: isFetchingServiceAccounts(state),
    namespace,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchServiceAccounts
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ServiceAccountsDropdown));
