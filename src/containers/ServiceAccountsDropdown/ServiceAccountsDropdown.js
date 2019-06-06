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
import { connect } from 'react-redux';

import {
  getServiceAccounts,
  isFetchingServiceAccounts,
  getSelectedNamespace
} from '../../reducers';
import { fetchServiceAccounts } from '../../actions/serviceAccounts';
import TooltipDropdown from '../../components/TooltipDropdown';
import { ALL_NAMESPACES } from '../../constants';

class ServiceAccountsDropdown extends React.Component {
  componentDidMount() {
    this.props.fetchServiceAccounts();
  }

  componentDidUpdate(prevProps) {
    const { namespace } = this.props;
    if (namespace !== prevProps.namespace) {
      this.props.fetchServiceAccounts();
    }
  }

  render() {
    const { namespace, ...rest } = this.props;
    const emptyText =
      namespace === ALL_NAMESPACES
        ? `No Service Accounts found`
        : `No Service Accounts found in the '${namespace}' namespace`;
    return <TooltipDropdown {...rest} emptyText={emptyText} />;
  }
}

ServiceAccountsDropdown.defaultProps = {
  items: [],
  loading: false,
  label: 'Select Service Account',
  titleText: 'Service Account'
};

function mapStateToProps(state) {
  return {
    items: getServiceAccounts(state).map(sa => sa.metadata.name),
    loading: isFetchingServiceAccounts(state),
    namespace: getSelectedNamespace(state)
  };
}

const mapDispatchToProps = {
  fetchServiceAccounts
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServiceAccountsDropdown);
