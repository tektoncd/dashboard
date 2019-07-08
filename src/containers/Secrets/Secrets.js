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
import { InlineNotification } from 'carbon-components-react';
import Modal from '../SecretsModal';
import DeleteModal from '../../components/SecretsDeleteModal';
import Table from '../../components/SecretsTable';
import {
  clearNotification,
  deleteSecret,
  fetchSecrets
} from '../../actions/secrets';
import {
  getSecrets,
  getSecretsErrorMessage,
  isFetchingSecrets
} from '../../reducers';

export /* istanbul ignore next */ class Secrets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openNewSecret: false,
      openDeleteSecret: false,
      toBeDeleted: null
    };
  }

  componentDidMount() {
    this.props.fetchSecrets();
  }

  handleNewSecretClick = () => {
    this.setState(prevState => {
      return {
        openNewSecret: !prevState.openNewSecret
      };
    });
  };

  handleDeleteSecretToggle = () => {
    this.setState({
      openDeleteSecret: false,
      toBeDeleted: null
    });
  };

  handleDeleteSecretClick = value => {
    this.setState({
      openDeleteSecret: true,
      toBeDeleted: value
    });
  };

  delete = () => {
    const { name, namespace } = this.state.toBeDeleted;
    this.props.deleteSecret(name, namespace);
    this.handleDeleteSecretToggle();
  };

  render() {
    const { secrets, loading, error } = this.props;
    const { openNewSecret, toBeDeleted, openDeleteSecret } = this.state;

    return (
      <>
        {error && (
          <InlineNotification
            kind="error"
            title="Error:"
            subtitle={error}
            iconDescription="Clear Notification"
            className="notificationComponent"
            data-testid="errorNotificationComponent"
            onCloseButtonClick={this.props.clearNotification}
          />
        )}
        <Table
          handleNew={this.handleNewSecretClick}
          handleDelete={this.handleDeleteSecretClick}
          loading={loading}
          secrets={secrets}
        />
        {openNewSecret && (
          <Modal open={openNewSecret} handleNew={this.handleNewSecretClick} />
        )}
        {openDeleteSecret && (
          <DeleteModal
            open={openDeleteSecret}
            handleClick={this.handleDeleteSecretToggle}
            handleDelete={this.delete}
            id={toBeDeleted.name}
          />
        )}
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
    loading: isFetchingSecrets(state),
    secrets: getSecrets(state)
  };
}

const mapDispatchToProps = {
  fetchSecrets,
  deleteSecret,
  clearNotification
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Secrets);
