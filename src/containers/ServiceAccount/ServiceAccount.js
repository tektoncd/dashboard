/*
Copyright 2019-2020 The Tekton Authors
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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../../scss/Triggers.scss';
import { injectIntl } from 'react-intl';
import { ResourceDetails, Table } from '@tektoncd/dashboard-components';
import { getTitle, urls } from '@tektoncd/dashboard-utils';
import {
  getSecrets,
  getSelectedNamespace,
  getServiceAccount,
  getServiceAccountsErrorMessage,
  isFetchingSecrets,
  isFetchingServiceAccounts,
  isWebSocketConnected
} from '../../reducers';
import { getViewChangeHandler } from '../../utils';

import { fetchServiceAccount } from '../../actions/serviceAccounts';
import { fetchSecrets } from '../../actions/secrets';

export /* istanbul ignore next */ class ServiceAccountContainer extends Component {
  componentDidMount() {
    const { match } = this.props;
    const { serviceAccountName: resourceName } = match.params;
    document.title = getTitle({
      page: 'ServiceAccount',
      resourceName
    });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { match, webSocketConnected } = this.props;
    const { namespace, serviceAccountName } = match.params;
    const {
      match: prevMatch,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    const {
      namespace: prevNamespace,
      serviceAccountName: prevServiceAccountName
    } = prevMatch.params;

    if (
      namespace !== prevNamespace ||
      serviceAccountName !== prevServiceAccountName ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchData();
    }
  }

  fetchData() {
    const { match } = this.props;
    const { namespace, serviceAccountName } = match.params;
    this.props.fetchServiceAccount({ name: serviceAccountName, namespace });
    this.props.fetchSecrets({ namespace });
  }

  render() {
    const {
      intl,
      error,
      loading,
      match,
      selectedNamespace,
      serviceAccount,
      view
    } = this.props;

    const { namespace } = match.params;
    const headersForSecrets = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      }
    ];

    let rowsForSecrets = [];
    if (serviceAccount?.secrets && !loading) {
      rowsForSecrets = serviceAccount.secrets.map(({ name }) => ({
        id: name,
        name: (
          <Link
            to={urls.secrets.byName({
              namespace,
              secretName: name
            })}
            title={name}
          >
            {name}
          </Link>
        )
      }));
    }

    const emptyTextMessageSecrets = intl.formatMessage({
      id: 'dashboard.serviceAccount.noSecrets',
      defaultMessage: 'No Secrets found for this ServiceAccount.'
    });

    const headersForImgPull = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      }
    ];

    let rowsForImgPull = [];
    if (serviceAccount?.imagePullSecrets && !loading) {
      rowsForImgPull = serviceAccount.imagePullSecrets.map(({ name }) => ({
        id: name,
        name
      }));
    }

    const emptyTextMessageImgPull = intl.formatMessage({
      id: 'dashboard.serviceAccount.noImgPull',
      defaultMessage: 'No imagePullSecrets found for this ServiceAccount.'
    });

    return (
      <ResourceDetails
        error={error}
        loading={loading}
        onViewChange={getViewChangeHandler(this.props)}
        resource={serviceAccount}
        view={view}
      >
        <Table
          title={intl.formatMessage({
            id: 'dashboard.serviceAccount.secretsTableTitle',
            defaultMessage: 'Secrets'
          })}
          headers={headersForSecrets}
          rows={rowsForSecrets}
          loading={loading}
          size="short"
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={emptyTextMessageSecrets}
          emptyTextSelectedNamespace={emptyTextMessageSecrets}
        />
        <Table
          title="imagePullSecrets"
          headers={headersForImgPull}
          rows={rowsForImgPull}
          loading={loading}
          size="short"
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={emptyTextMessageImgPull}
          emptyTextSelectedNamespace={emptyTextMessageImgPull}
        />
      </ResourceDetails>
    );
  }
}

ServiceAccountContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      serviceAccountName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { location, match } = ownProps;
  const { namespace: namespaceParam, serviceAccountName } = match.params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  const namespace = namespaceParam || getSelectedNamespace(state);
  const serviceAccount = getServiceAccount(state, {
    name: serviceAccountName,
    namespace
  });
  return {
    error: getServiceAccountsErrorMessage(state),
    loading: isFetchingSecrets(state) || isFetchingServiceAccounts(state),
    selectedNamespace: namespace,
    serviceAccount,
    secrets: getSecrets(state, { namespace }),
    view,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchServiceAccount,
  fetchSecrets
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ServiceAccountContainer));
