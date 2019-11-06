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
// import { getErrorMessage } from '@tektoncd/dashboard-utils';

import Modal from '../SecretsModal';
import DeleteModal from '../../components/SecretsDeleteModal';
import Table from '../../components/SecretsTable';
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
  toBeDeleted: [],
  error: ''
};

export /* istanbul ignore next */ class Secrets extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
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
        error: ''
      };
    });
  };

  handleCreateSecretClick = () => {
    console.log(this.props.error);
    if (!this.props.error) {
      this.setState({
        openNewSecret: false
      });
    } else {
      this.setState({
        openNewSecret: true
      });
    }
  };

  handleDeleteSecretToggle = () => {
    this.setState({
      openDeleteSecret: false,
      toBeDeleted: []
    });
  };

  handleHideModalClick = () => {
    this.props.clearNotification();
    this.setState({
      openNewSecret: false
    });
  };

  handleDeleteSecretClick = secrets => {
    this.setState({
      openDeleteSecret: true,
      toBeDeleted: secrets
    });
  };

  delete = () => {
    this.props.deleteSecret(this.state.toBeDeleted);
    this.handleDeleteSecretToggle();
  };

  render() {
    const {
      loading,
      createSuccess,
      deleteSuccess,
      secrets,
      selectedNamespace,
      intl
    } = this.props;

    const { openNewSecret, toBeDeleted, openDeleteSecret } = this.state;
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
          handleDisplayModal={this.handleDisplayModalClick}
          handleDelete={this.handleDeleteSecretClick}
          loading={loading}
          secrets={secrets}
          selectedNamespace={selectedNamespace}
        />
        <Modal
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
    error: getSecretsErrorMessage(state),
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
