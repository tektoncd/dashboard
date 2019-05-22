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
import Add from '@carbon/icons-react/lib/add--alt/24';
import Close from '@carbon/icons-react/lib/close--outline/16';
import { connect } from 'react-redux';
import { InlineNotification } from 'carbon-components-react';
import Modal from '../SecretsModal';
import DeleteModal from '../../components/SecretsDeleteModal';
import Spinner from '../../components/Spinner';
import Table from '../../components/SecretsTable';
import {
  fetchSecrets,
  deleteSecret,
  clearNotification
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
      toBeDeleted: ''
    };
  }

  componentDidMount() {
    this.props.fetchSecrets();
  }

  handleNewSecretClick = () => {
    this.setState(function(prevState) {
      return {
        openNewSecret: !prevState.openNewSecret
      };
    });
  };

  handleDeleteSecretToggle = () => {
    this.setState({
      openDeleteSecret: false,
      toBeDeleted: ''
    });
  };

  handleDeleteSecretClick = e => {
    let secretName;
    if (e.target.nodeName === 'svg' || e.target.nodeName === 'path')
      secretName = e.currentTarget.id;
    else secretName = e.target.id;
    this.setState({
      openDeleteSecret: true,
      toBeDeleted: secretName
    });
  };

  delete = () => {
    this.props.deleteSecret(this.state.toBeDeleted);
    this.handleDeleteSecretToggle();
  };

  render() {
    const { secrets, loading, error } = this.props;
    const { openNewSecret, toBeDeleted, openDeleteSecret } = this.state;

    let initialRows = secrets.map(secret => {
      let annotations = '';
      Object.keys(secret.annotations).forEach(function annotationSetup(key) {
        annotations += `${key}: ${secret.annotations[key]}\n`;
      });
      return {
        id: secret.uid,
        secret: secret.name,
        type: secret.type,
        annotations,
        add: <Close />,
        classText: 'cellText',
        classIcon: 'cellIcon',
        handler: this.handleDeleteSecretClick,
        testId: 'deleteIcon'
      };
    });

    if (initialRows.length === 0) {
      initialRows = [
        {
          id: 'empty',
          secret: '-',
          type: '-',
          annotations: '-',
          add: '-',
          classText: 'cellTextNone',
          classIcon: 'cellIconNone',
          handler: null,
          testId: null
        }
      ];
    }

    if (loading) {
      initialRows = [
        {
          id: 'loading',
          secret: <Spinner />,
          type: <Spinner />,
          annotations: <Spinner />,
          add: <Spinner />,
          classText: 'cellTextNone',
          classIcon: 'cellIconNone',
          handler: null,
          testId: null
        }
      ];
    }

    const initialHeaders = [
      { key: 'secret', header: 'Secret' },
      { key: 'type', header: 'Type' },
      { key: 'annotations', header: 'Annotations' },
      { key: 'add', header: <Add /> }
    ];

    if (error !== null) setTimeout(this.props.clearNotification, 5000);

    return (
      <>
        {error !== null ? (
          <InlineNotification
            kind="error"
            title="Error:"
            subtitle={error}
            iconDescription="Clear Notification"
            className="notificationComponent"
            data-testid="errorNotificationComponent"
          />
        ) : (
          ''
        )}
        <Table
          initialHeaders={initialHeaders}
          initialRows={initialRows}
          handleNew={this.handleNewSecretClick}
        />
        {openNewSecret ? (
          <Modal open={openNewSecret} handleNew={this.handleNewSecretClick} />
        ) : (
          ''
        )}
        {openDeleteSecret ? (
          <DeleteModal
            open={openDeleteSecret}
            handleClick={this.handleDeleteSecretToggle}
            handleDelete={this.delete}
            id={toBeDeleted}
          />
        ) : (
          ''
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
