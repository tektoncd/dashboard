/*
Copyright 2020 The Tekton Authors
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
import '../../scss/Triggers.scss';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { InlineNotification, Tag } from 'carbon-components-react';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';
import {
  formatLabels,
  getErrorMessage,
  getTitle,
  urls
} from '@tektoncd/dashboard-utils';
import { fetchServiceAccounts } from '../../actions/serviceAccounts';

import {
  getSecret,
  getSecretsErrorMessage,
  getServiceAccounts,
  isFetchingSecrets,
  isWebSocketConnected
} from '../../reducers';

import { fetchSecret } from '../../actions/secrets';

export /* istanbul ignore next */ class SecretContainer extends Component {
  componentDidMount() {
    const { match } = this.props;
    const { secretName: resourceName } = match.params;
    document.title = getTitle({
      page: 'Secret',
      resourceName
    });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { match, webSocketConnected } = this.props;
    const { namespace, secretName } = match.params;
    const {
      match: prevMatch,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    const {
      namespace: prevNamespace,
      secretName: prevSecretName
    } = prevMatch.params;

    if (
      namespace !== prevNamespace ||
      secretName !== prevSecretName ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchData();
    }
  }

  async fetchData() {
    const { match } = this.props;
    const { namespace, secretName } = match.params;
    await this.props.fetchSecret({ name: secretName, namespace });
    await this.props.fetchServiceAccounts();
  }

  render() {
    const { error, intl, match, secret, loading, serviceAccounts } = this.props;
    const { secretName, namespace } = match.params;
    const serviceAccountsWithSecret = [];

    if (serviceAccounts) {
      serviceAccounts.forEach(serviceAccount => {
        (serviceAccount.secrets || []).forEach(secretInServiceAccount => {
          if (secretInServiceAccount.name === secret.metadata.name) {
            serviceAccountsWithSecret.push(serviceAccount.metadata.name);
          }
        });
      });
    }

    const emptyTextMessageSAs = intl.formatMessage({
      id: 'dashboard.secret.noServiceAccounts',
      defaultMessage: 'No ServiceAccounts found for this Secret.'
    });

    const headersForServiceAccounts = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      }
    ];

    const rowsForServiceAccounts = serviceAccountsWithSecret.map(
      serviceAccount => ({
        id: serviceAccount,
        name: (
          <Link
            to={urls.serviceAccounts.byName({
              namespace,
              serviceAccountName: serviceAccount
            })}
            title={serviceAccount}
          >
            {serviceAccount}
          </Link>
        )
      })
    );

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.secret.errorLoading',
            defaultMessage: 'Error loading Secret'
          })}
          subtitle={getErrorMessage(error)}
        />
      );
    }

    if (!secret) {
      return (
        <InlineNotification
          kind="info"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.secret.failed',
            defaultMessage: 'Cannot load Secret'
          })}
          subtitle={intl.formatMessage(
            {
              id: 'dashboard.secret.failedSubtitle',
              defaultMessage: 'Secret {secretName} not found'
            },
            { secretName }
          )}
        />
      );
    }

    const { type } = secret;
    let formattedLabelsToRender = [];
    if (secret.metadata.labels) {
      formattedLabelsToRender = formatLabels(secret.metadata.labels);
    }

    return (
      <>
        <h1>{secretName}</h1>
        <div className="tkn--resourcedetails">
          <div className="tkn--details">
            <div className="tkn--resourcedetails-metadata">
              <p>
                <span>
                  {intl.formatMessage({
                    id: 'dashboard.metadata.dateCreated',
                    defaultMessage: 'Date Created:'
                  })}
                </span>
                <FormattedDate
                  date={secret.metadata.creationTimestamp}
                  relative
                />
              </p>
              <p>
                <span>
                  {intl.formatMessage({
                    id: 'dashboard.metadata.labels',
                    defaultMessage: 'Labels:'
                  })}
                </span>
                {formattedLabelsToRender.length
                  ? formattedLabelsToRender.map(label => (
                      <Tag type="blue" key={label}>
                        {label}
                      </Tag>
                    ))
                  : intl.formatMessage({
                      id: 'dashboard.metadata.none',
                      defaultMessage: 'None'
                    })}
              </p>
              <p>
                <span>
                  {intl.formatMessage({
                    id: 'dashboard.metadata.namespace',
                    defaultMessage: 'Namespace:'
                  })}
                </span>
                {secret.metadata.namespace}
              </p>
              <p>
                <span>
                  {intl.formatMessage({
                    id: 'dashboard.secret.type',
                    defaultMessage: 'Type:'
                  })}
                </span>
                {type}
              </p>
            </div>
            <Table
              title={intl.formatMessage({
                id: 'dashboard.secret.serviceAccountTableTitle',
                defaultMessage: 'ServiceAccounts'
              })}
              headers={headersForServiceAccounts}
              rows={rowsForServiceAccounts}
              loading={loading}
              size="short"
              selectedNamespace={namespace}
              emptyTextAllNamespaces={emptyTextMessageSAs}
              emptyTextSelectedNamespace={emptyTextMessageSAs}
            />
          </div>
        </div>
      </>
    );
  }
}

SecretContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      namespace: PropTypes.string.isRequired,
      secretName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { match } = ownProps;
  const { namespace, secretName: name } = match.params;

  return {
    error: getSecretsErrorMessage(state),
    loading: isFetchingSecrets(state),
    namespace,
    secret: getSecret(state, {
      name,
      namespace
    }),
    webSocketConnected: isWebSocketConnected(state),
    serviceAccounts: getServiceAccounts(state)
  };
}

const mapDispatchToProps = {
  fetchSecret,
  fetchServiceAccounts
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(SecretContainer));
