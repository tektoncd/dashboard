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
import { injectIntl } from 'react-intl';
import { InlineNotification } from 'carbon-components-react';
import { Table } from '@tektoncd/dashboard-components';
import Add from '@carbon/icons-react/lib/add/16';
import Delete from '@carbon/icons-react/lib/delete/16';
import Modal from '../SecretsModal';
import DeleteModal from '../../components/SecretsDeleteModal';
import {
  clearNotification,
  deleteSecret,
  fetchSecrets
} from '../../actions/secrets';
import {
  getCreateSecretsSuccessMessage,
  getDeleteSecretsSuccessMessage,
  getSecrets,
  getSecretsErrorMessage,
  getSelectedNamespace,
  isFetchingSecrets,
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
    this.handleCreateSecretClick = this.handleCreateSecretClick.bind(this);
  }

  componentDidMount() {
    this.props.fetchSecrets();
  }

  componentDidUpdate(prevProps) {
    const { webSocketConnected } = this.props;
    const { webSocketConnected: prevWebSocketConnected } = prevProps;
    if (webSocketConnected && prevWebSocketConnected === false) {
      this.props.fetchSecrets();
    }
  }

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

  handleCreateSecretClick(openNewSecret) {
    this.setState({
      openNewSecret
    });
  }

  render() {
    const {
      loading,
      createSuccess,
      deleteSuccess,
      secrets,
      selectedNamespace,
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
        key: 'annotations',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.annotations',
          defaultMessage: 'Annotations'
        })
      }
    ];

    const secretsFormatted = secrets.map(secret => {
      let annotations = '';
      if (secret.annotations !== undefined) {
        Object.keys(secret.annotations).forEach(function annotationSetup(key) {
          if (key.includes('tekton.dev')) {
            annotations += `${key}: ${secret.annotations[key]}\n`;
          }
        });
      }
      const formattedSecret = {
        annotations,
        id: `${secret.namespace}:${secret.name}`,
        namespace: secret.namespace,
        name: secret.name
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
                id: 'dashboard.secrets.clearNotification',
                defaultMessage: 'Clear Notification'
              })}
              className="notificationComponent"
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
              id: 'dashboard.secrets.clearNotification',
              defaultMessage: 'Clear Notification'
            })}
            className="notificationComponent"
            onCloseButtonClick={this.props.clearNotification}
            lowContrast
          />
        )}
        <Table
          title="Secrets"
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
                id: 'dashboard.secrets.delete',
                defaultMessage: 'Delete'
              }),
              icon: Delete
            }
          ]}
          toolbarButtons={[
            {
              onClick: this.handleDisplayModalClick,
              text: intl.formatMessage({
                id: 'dashboard.secrets.add',
                defaultMessage: 'Add Secret'
              }),
              icon: Add
            }
          ]}
        />
        <Modal
          errorMessage={errorMessage}
          open={openNewSecret}
          key={openNewSecret}
          handleCreateSecret={this.handleCreateSecretClick}
          handleHideModal={this.handleHideModalClick}
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

function mapStateToProps(state) {
  return {
    errorMessage: getSecretsErrorMessage(state),
    createSuccess: getCreateSecretsSuccessMessage(state),
    deleteSuccess: getDeleteSecretsSuccessMessage(state),
    loading: isFetchingSecrets(state),
    secrets: getSecrets(state),
    selectedNamespace: getSelectedNamespace(state),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  clearNotification,
  deleteSecret,
  fetchSecrets
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Secrets));
