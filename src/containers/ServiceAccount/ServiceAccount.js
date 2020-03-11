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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../../scss/Triggers.scss';
import { injectIntl } from 'react-intl';
import { InlineNotification, Tag } from 'carbon-components-react';
import {
  FormattedDate,
  Tab,
  Table,
  Tabs,
  ViewYAML
} from '@tektoncd/dashboard-components';
import { formatLabels, urls } from '@tektoncd/dashboard-utils';
import {
  getSecrets,
  getSelectedNamespace,
  getServiceAccount,
  getServiceAccountsErrorMessage,
  isFetchingSecrets,
  isFetchingServiceAccounts,
  isWebSocketConnected
} from '../../reducers';

import { fetchServiceAccount } from '../../actions/serviceAccounts';
import { fetchSecrets } from '../../actions/secrets';

export /* istanbul ignore next */ class ServiceAccountContainer extends Component {
  static notification({ kind, message, intl }) {
    const titles = {
      info: intl.formatMessage({
        id: 'dashboard.serviceAccount.unavailable',
        defaultMessage: 'ServiceAccount not available'
      }),
      error: intl.formatMessage({
        id: 'dashboard.serviceAccount.errorloading',
        defaultMessage: 'Error loading ServiceAccount'
      })
    };
    return (
      <InlineNotification
        kind={kind}
        hideCloseButton
        lowContrast
        title={titles[kind]}
        subtitle={message}
      />
    );
  }

  componentDidMount() {
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
      serviceAccount
    } = this.props;
    const { serviceAccountName, namespace } = match.params;

    if (error) {
      return ServiceAccountContainer.notification({
        kind: 'error',
        intl
      });
    }
    if (!serviceAccount) {
      return ServiceAccountContainer.notification({
        kind: 'info',
        intl
      });
    }

    let formattedLabelsToRender = [];
    if (serviceAccount.metadata.labels) {
      formattedLabelsToRender = formatLabels(serviceAccount.metadata.labels);
    }

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
    if (serviceAccount.secrets && !loading) {
      rowsForSecrets = serviceAccount.secrets.map(({ name }) => {
        return {
          id: name,
          name: (
            <Link
              to={urls.secrets.byName({
                namespace,
                secretName: name
              })}
              title={name}
            >
              {' '}
              {name}
            </Link>
          )
        };
      });
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
    if (serviceAccount.imagePullSecrets && !loading) {
      rowsForImgPull = serviceAccount.imagePullSecrets.map(({ name }) => {
        return {
          id: name,
          name
        };
      });
    }

    const emptyTextMessageImgPull = intl.formatMessage({
      id: 'dashboard.serviceAccount.noImgPull',
      defaultMessage: 'No imagePullSecrets found for this ServiceAccount.'
    });

    return (
      <div className="serviceAccount">
        <h1>{serviceAccountName}</h1>
        <Tabs selected={0}>
          <Tab
            label={intl.formatMessage({
              id: 'dashboard.resource.detailsTab',
              defaultMessage: 'Details'
            })}
          >
            <div className="details">
              <p>
                <span>
                  {intl.formatMessage({
                    id: 'dashboard.metadata.dateCreated',
                    defaultMessage: 'Date Created:'
                  })}
                </span>
                <FormattedDate
                  date={serviceAccount.metadata.creationTimestamp}
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
                {formattedLabelsToRender.length === 0
                  ? intl.formatMessage({
                      id: 'dashboard.metadata.none',
                      defaultMessage: 'None'
                    })
                  : formattedLabelsToRender.map(label => (
                      <Tag type="blue" key={label}>
                        {label}
                      </Tag>
                    ))}
              </p>
              <p>
                <span>
                  {intl.formatMessage({
                    id: 'dashboard.metadata.namespace',
                    defaultMessage: 'Namespace:'
                  })}
                </span>
                {serviceAccount.metadata.namespace}
              </p>
              <Table
                title={intl.formatMessage({
                  id: 'dashboard.serviceAccount.secretsTableTitle',
                  defaultMessage: 'Secrets'
                })}
                headers={headersForSecrets}
                rows={rowsForSecrets}
                loading={loading}
                selectedNamespace={selectedNamespace}
                emptyTextAllNamespaces={emptyTextMessageSecrets}
                emptyTextSelectedNamespace={emptyTextMessageSecrets}
              />
              <Table
                title="imagePullSecrets"
                headers={headersForImgPull}
                rows={rowsForImgPull}
                loading={loading}
                selectedNamespace={selectedNamespace}
                emptyTextAllNamespaces={emptyTextMessageImgPull}
                emptyTextSelectedNamespace={emptyTextMessageImgPull}
              />
            </div>
          </Tab>
          <Tab label="YAML">
            <ViewYAML resource={serviceAccount} />
          </Tab>
        </Tabs>
      </div>
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
  const { match } = ownProps;
  const { namespace: namespaceParam, serviceAccountName } = match.params;

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
