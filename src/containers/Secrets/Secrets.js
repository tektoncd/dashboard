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
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import { InlineNotification } from 'carbon-components-react';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';
import { getErrorMessage, getFilters } from '@tektoncd/dashboard-utils';
import { Add16 as Add, Delete16 as Delete } from '@carbon/icons-react';

import { LabelFilter } from '..';
import Modal from '../SecretsModal';
import DeleteModal from '../../components/SecretsDeleteModal';
import {
  clearNotification,
  deleteSecret,
  fetchSecrets
} from '../../actions/secrets';
import { fetchServiceAccounts } from '../../actions/serviceAccounts';
import {
  getCreateSecretsSuccessMessage,
  getDeleteSecretsErrorMessage,
  getDeleteSecretsSuccessMessage,
  getSecrets,
  getSelectedNamespace,
  getServiceAccounts,
  isFetchingSecrets,
  isFetchingServiceAccounts,
  isWebSocketConnected
} from '../../reducers';

const initialState = {
  openNewSecret: false,
  openDeleteSecret: false,
  toBeDeleted: []
};

export /* istanbul ignore next */ class Secrets extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { filters, namespace, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      namespace: prevNamespace,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;

    if (
      !isEqual(filters, prevFilters) ||
      namespace !== prevNamespace ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchData();
    }
  }

  fetchData = () => {
    const { filters, namespace } = this.props;
    this.props.fetchSecrets({
      filters,
      namespace
    });
    this.props.fetchServiceAccounts();
  };

  handleDisplayModalClick = () => {
    this.props.clearNotification();
    this.setState(prevState => {
      return {
        openNewSecret: !prevState.openNewSecret,
        errorMessage: ''
      };
    });
  };

  handleDeleteSecretToggle = () => {
    this.setState({
      openDeleteSecret: false,
      cancelMethod: null,
      toBeDeleted: []
    });
  };

  handleDeleteSecretClick = (secrets, cancelMethod) => {
    const toBeDeleted = secrets.map(secret => ({
      namespace: secret.id.split(':')[0],
      name: secret.id.split(':')[1]
    }));
    this.setState({
      openDeleteSecret: true,
      cancelMethod,
      toBeDeleted
    });
  };

  handleHideModalClick = () => {
    this.props.clearNotification();
    this.setState({
      openNewSecret: false
    });
  };

  delete = () => {
    this.props.deleteSecret(this.state.toBeDeleted, this.state.cancelMethod);
    this.handleDeleteSecretToggle();
  };

  handleCreateSecretClick = openNewSecret => {
    if (!openNewSecret) {
      this.props.fetchServiceAccounts();
    }
    this.setState({
      openNewSecret
    });
  };

  render() {
    const {
      loading,
      createSuccess,
      deleteSuccess,
      secrets,
      selectedNamespace,
      serviceAccounts,
      intl,
      errorMessage
    } = this.props;

    const { openNewSecret, toBeDeleted, openDeleteSecret } = this.state;

    const initialHeaders = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'namespace',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.namespace',
          defaultMessage: 'Namespace'
        })
      },
      {
        key: 'serviceAccounts',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.serviceAccounts',
          defaultMessage: 'Service Accounts'
        })
      },
      {
        key: 'type',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.type',
          defaultMessage: 'Type'
        })
      },
      {
        key: 'username',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.username',
          defaultMessage: 'Username'
        })
      },
      {
        key: 'annotations',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.annotations',
          defaultMessage: 'Annotations'
        })
      },
      {
        key: 'created',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.createdTime',
          defaultMessage: 'Created'
        })
      }
    ];

    const secretsFormatted = secrets.map(secret => {
      let annotations = '';
      if (secret.metadata.annotations !== undefined) {
        Object.keys(secret.metadata.annotations).forEach(
          function annotationSetup(key) {
            if (key.includes('tekton.dev')) {
              annotations += `${key}: ${secret.metadata.annotations[key]}\n`;
            }
          }
        );
      }
      const serviceAccountsWithSecret = [];
      serviceAccounts.forEach(serviceAccount => {
        serviceAccount.secrets.forEach(secretInServiceAccount => {
          if (secretInServiceAccount.name === secret.metadata.name) {
            serviceAccountsWithSecret.push(serviceAccount.metadata.name);
          }
        });
      });
      const serviceAccountsString = serviceAccountsWithSecret.join(', ');

      const translatedReload = [
        intl.formatMessage({
          id: 'dashboard.secrets.reload',
          defaultMessage: 'Reload this page to view'
        })
      ];

      // Defaults - todo ensure all data is fetched and displayed so we don't need this
      let secretUsernameToDisplay = translatedReload;
      let secretTypeToDisplay = translatedReload;

      if (secret.data.username) {
        secretUsernameToDisplay = atob(secret.data.username);
      }

      if (secret.type) {
        secretTypeToDisplay = secret.type;
      }

      const formattedSecret = {
        annotations: <span title={annotations}>{annotations}</span>,
        id: `${secret.metadata.namespace}:${secret.metadata.name}`,
        name: <span title={secret.metadata.name}>{secret.metadata.name}</span>,
        namespace: (
          <span title={secret.metadata.namespace}>
            {secret.metadata.namespace}
          </span>
        ),
        created: (
          <FormattedDate date={secret.metadata.creationTimestamp} relative />
        ),
        serviceAccounts: (
          <span title={serviceAccountsString}>{serviceAccountsString}</span>
        ),
        type: <span title={secretTypeToDisplay}>{secretTypeToDisplay}</span>,
        username: (
          <span title={secretUsernameToDisplay}>{secretUsernameToDisplay}</span>
        )
      };
      return formattedSecret;
    });

    return (
      <>
        {createSuccess &&
          (!deleteSuccess && (
            <InlineNotification
              kind="success"
              title={intl.formatMessage({
                id: 'dashboard.secrets.success',
                defaultMessage: 'Success:'
              })}
              subtitle={intl.formatMessage({
                id: 'dashboard.secrets.createSuccess',
                defaultMessage: 'Secret created successfully'
              })}
              iconDescription={intl.formatMessage({
                id: 'dashboard.notification.clear',
                defaultMessage: 'Clear Notification'
              })}
              onCloseButtonClick={this.props.clearNotification}
              lowContrast
            />
          ))}
        {deleteSuccess && (
          <InlineNotification
            kind="success"
            title={intl.formatMessage({
              id: 'dashboard.secrets.success',
              defaultMessage: 'Success:'
            })}
            subtitle={intl.formatMessage({
              id: 'dashboard.secrets.deleteSuccess',
              defaultMessage: 'Secret deleted successfully'
            })}
            iconDescription={intl.formatMessage({
              id: 'dashboard.notification.clear',
              defaultMessage: 'Clear Notification'
            })}
            onCloseButtonClick={this.props.clearNotification}
            lowContrast
          />
        )}
        {errorMessage && (
          <InlineNotification
            kind="error"
            title={intl.formatMessage({
              id: 'dashboard.error.title',
              defaultMessage: 'Error:'
            })}
            subtitle={getErrorMessage(errorMessage)}
            iconDescription={intl.formatMessage({
              id: 'dashboard.notification.clear',
              defaultMessage: 'Clear Notification'
            })}
            data-testid="errorNotificationComponent"
            onCloseButtonClick={this.props.clearNotification}
            lowContrast
          />
        )}
        <h1>Secrets</h1>
        <LabelFilter {...this.props} />
        <Table
          headers={initialHeaders}
          rows={secretsFormatted}
          handleDisplayModal={this.handleDisplayModalClick}
          handleDelete={this.handleDeleteSecretClick}
          loading={loading}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No {kind} under any namespace.'
            },
            { kind: 'Secrets' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage: 'No {kind} under namespace {selectedNamespace}'
            },
            { kind: 'Secrets', selectedNamespace }
          )}
          batchActionButtons={[
            {
              onClick: this.handleDeleteSecretClick,
              text: intl.formatMessage({
                id: 'dashboard.actions.deleteButton',
                defaultMessage: 'Delete'
              }),
              icon: Delete
            }
          ]}
          toolbarButtons={[
            {
              onClick: this.handleDisplayModalClick,
              text: intl.formatMessage({
                id: 'dashboard.actions.createButton',
                defaultMessage: 'Create'
              }),
              icon: Add
            }
          ]}
        />
        <Modal
          open={openNewSecret}
          key={openNewSecret}
          handleCreateSecret={this.handleCreateSecretClick}
          handleHideModal={this.handleHideModalClick}
          clearNotification={this.props.clearNotification}
        />
        <DeleteModal
          open={openDeleteSecret}
          handleClick={this.handleDeleteSecretToggle}
          handleDelete={this.delete}
          toBeDeleted={toBeDeleted}
        />
      </>
    );
  }
}

Secrets.defaultProps = {
  secrets: []
};

function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const filters = getFilters(props.location);
  const namespace = namespaceParam || getSelectedNamespace(state);

  return {
    errorMessage: getDeleteSecretsErrorMessage(state),
    createSuccess: getCreateSecretsSuccessMessage(state),
    deleteSuccess: getDeleteSecretsSuccessMessage(state),
    filters,
    loading: isFetchingSecrets(state) || isFetchingServiceAccounts(state),
    secrets: getSecrets(state, { filters, namespace }),
    serviceAccounts: getServiceAccounts(state),
    selectedNamespace: namespace,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  clearNotification,
  deleteSecret,
  fetchSecrets,
  fetchServiceAccounts
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Secrets));
