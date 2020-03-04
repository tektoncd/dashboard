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

import { generateId } from '@tektoncd/dashboard-utils';
import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import Form from '../../components/CreateSecret/Form';
import ServiceAccountSelector from '../../components/CreateSecret/ServiceAccountSelector';
import { createSecret, patchSecret } from '../../actions/secrets';
import {
  getCreateSecretsSuccessMessage,
  getPatchSecretsErrorMessage,
  getSecretsErrorMessage,
  getServiceAccounts,
  isFetchingSecrets,
  isFetchingServiceAccounts,
  isWebSocketConnected
} from '../../reducers';
import { fetchServiceAccounts } from '../../actions/serviceAccounts';

import '../../components/CreateSecret/CreateSecret.scss';

const defaultGithubServerURL = 'https://github.com';
const defaultDockerServerURL = 'https://index.docker.io/v1/';

function validateInputs(value, id) {
  const trimmed = value.trim();

  if (trimmed === '') {
    return false;
  }
  if (id === 'name' || id === 'serviceAccount') {
    if (trimmed.length >= 253) {
      return false;
    }

    if (/[^-a-z0-9]/.test(trimmed)) {
      return false;
    }
  }
  if (id === 'name') {
    if (trimmed.startsWith('-', 0) || trimmed.endsWith('-')) {
      return false;
    }
  }

  return true;
}

export /* istanbul ignore next */ class CreateSecret extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      namespace: '',
      username: '',
      password: '',
      accessToken: '',
      secretType: 'password',
      annotations: [
        {
          access: 'git',
          value: 'https://github.com',
          id: generateId(`annotation0`)
        }
      ],
      invalidFields: {},
      errorMessageDuplicate: null
    };
  }

  componentDidUpdate(prevProps) {
    const { succesfullyCreated } = this.props;
    const { succesfullyCreated: prevSuccesfullyCreated } = prevProps;
    if (succesfullyCreated && prevSuccesfullyCreated === false) {
      this.props.fetchServiceAccounts();
    }
  }

  handleChangeNamespace = e => {
    const stateVar = 'namespace';
    const stateValue = e.selectedItem.text;
    this.setState(prevState => {
      const newInvalidFields = prevState.invalidFields;
      if (validateInputs(stateValue, stateVar)) {
        delete newInvalidFields[stateVar];
      } else {
        newInvalidFields[stateVar] = true;
      }
      return { [stateVar]: stateValue, invalidFields: newInvalidFields };
    });
  };

  handleChangeTextInput = e => {
    const stateVar = e.target.id;
    const stateValue = e.target.value;
    this.setState(prevState => {
      const newInvalidFields = prevState.invalidFields;
      if (validateInputs(stateValue, stateVar)) {
        delete newInvalidFields[stateVar];
      } else {
        newInvalidFields[stateVar] = true;
      }
      return { [stateVar]: stateValue, invalidFields: newInvalidFields };
    });
  };

  handleSecretType = type => {
    this.setState({
      secretType: type
    });
  };

  handleAnnotationChange = (type, index, value) => {
    // if the two types differ then they'e changed from git<->docker
    // and thus set the value to be the default
    const currentAccess = value.text;
    this.setState(prevState => {
      const annotations = [...prevState.annotations];
      const previousAccessType = annotations[index].access;
      // We enter this when it's the same access type, so a user is
      // simply changing the value for server URL - set it to that
      if (currentAccess === undefined) {
        annotations[index][type] = value;
      }
      // Gotcha: it'd be useful to switch on access type (Git vs Docker) but
      // actually that's passed in inconsistently, the strings to check on
      // are translated ones so this assumes Docker and Git don't become something
      // other than Docker and Git
      if (previousAccessType !== currentAccess) {
        // Harden this because doing an includes on something undefined is bad
        if (currentAccess !== undefined) {
          if (currentAccess.includes('Docker')) {
            annotations[index].value = defaultDockerServerURL;
            annotations[index].access = 'docker';
          } else if (currentAccess.includes('Git')) {
            annotations[index].value = defaultGithubServerURL;
            annotations[index].access = 'git';
          }
        }
      }
      const newInvalidFields = { ...prevState.invalidFields };
      if (type === 'value') {
        const { id } = annotations[index];
        if (!validateInputs(value, id)) {
          newInvalidFields[id] = true;
        } else {
          delete newInvalidFields[id];
        }
      }

      return {
        annotations,
        invalidFields: newInvalidFields
      };
    });
  };

  handleAddAnnotation = () => {
    this.setState(prevState => {
      const { annotations } = prevState;
      return {
        annotations: [
          ...annotations,
          {
            access: 'git',
            value: 'https://github.com',
            id: generateId(`annotation${annotations.length}-`)
          }
        ]
      };
    });
  };

  handleRemoveAnnotation = index => {
    this.setState(prevState => {
      const annotations = [...prevState.annotations];
      const invalidFields = { ...prevState.invalidFields };
      const removedAnnotation = annotations[index];
      annotations.splice(index, 1);
      if (removedAnnotation.id in invalidFields) {
        delete invalidFields[removedAnnotation.id];
      }
      return { annotations, invalidFields };
    });
  };

  handleSubmit = () => {
    const invalidFields = {};
    let postData;

    const {
      annotations,
      name,
      namespace,
      accessToken,
      username,
      password,
      secretType
    } = this.state;

    const { secrets } = this.props;

    if (secretType === 'password') {
      postData = {
        apiVersion: 'v1',
        data: {
          password: '',
          username: ''
        },
        kind: 'Secret',
        metadata: {
          annotations: [],
          name: '',
          namespace: ''
        },
        type: 'kubernetes.io/basic-auth'
      };
    } else {
      postData = {
        apiVersion: 'v1',
        data: {
          accessToken: ''
        },
        kind: 'Secret',
        metadata: {
          name: '',
          namespace: ''
        },
        type: 'Opaque'
      };
    }

    if (validateInputs(namespace, 'namespace')) {
      postData.metadata.namespace = namespace.trim();
    } else {
      invalidFields.namespace = true;
    }

    if (validateInputs(name, 'name')) {
      postData.metadata.name = name.trim();
    } else {
      invalidFields.name = true;
    }

    if (secretType === 'password') {
      // If the data isn't base64 encoded, you'll confusingly get back a 404 from the secrets API
      if (validateInputs(username, 'username')) {
        const encodedUsername = Buffer.from(username).toString('base64');
        postData.data.username = encodedUsername;
      } else {
        invalidFields.username = true;
      }

      if (validateInputs(password, 'password')) {
        const encodedPass = Buffer.from(password).toString('base64');
        postData.data.password = encodedPass;
      } else {
        invalidFields.password = true;
      }

      const annotationsObject = {};
      annotations.forEach(({ access, value, id }, index) => {
        if (!validateInputs(value, id)) {
          invalidFields[id] = true;
        } else {
          annotationsObject[`tekton.dev/${access}-${index}`] = value;
        }
      });
      postData.metadata.annotations = annotationsObject;
    } else if (secretType === 'accessToken') {
      if (validateInputs(accessToken, 'accessToken')) {
        const encodedToken = Buffer.from(accessToken).toString('base64');
        postData.data.accessToken = encodedToken;
      } else {
        invalidFields.accessToken = true;
      }
    }

    if (Object.keys(invalidFields).length === 0) {
      if (
        secrets.find(
          secret =>
            secret.metadata.name === name &&
            secret.metadata.namespace === namespace
        )
      ) {
        this.setState({
          errorMessageDuplicate: this.props.intl.formatMessage(
            {
              id: 'dashboard.createSecret.duplicateErrorMessage',
              defaultMessage:
                'Secret {name} already exists in namespace {namespace}'
            },
            { name, namespace }
          )
        });
      } else {
        this.setState({
          errorMessageDuplicate: null
        });
        this.props.createSecret(postData, namespace);
      }
    } else {
      this.setState({ invalidFields });
    }
  };

  removeDuplicateErrorMessage = () => {
    this.setState({
      errorMessageDuplicate: null
    });
  };

  render() {
    const {
      handleClose,
      loading,
      succesfullyCreated,
      errorMessageCreated,
      serviceAccounts,
      errorMessagePatched
    } = this.props;

    const { name, namespace } = this.state;

    return (
      <div data-testid="createSecret">
        {!succesfullyCreated && (
          <Form
            {...this.state}
            loading={loading}
            handleClose={handleClose}
            submit={this.handleSubmit}
            handleChangeTextInput={this.handleChangeTextInput}
            handleChangeNamespace={this.handleChangeNamespace}
            handleSecretType={this.handleSecretType}
            handleAnnotationChange={this.handleAnnotationChange}
            handleAdd={this.handleAddAnnotation}
            handleRemove={this.handleRemoveAnnotation}
            errorMessageCreated={errorMessageCreated}
            removeDuplicateErrorMessage={this.removeDuplicateErrorMessage}
          />
        )}
        {succesfullyCreated && (
          <ServiceAccountSelector
            name={name}
            namespace={namespace}
            serviceAccounts={serviceAccounts}
            loading={loading}
            patchSecret={this.props.patchSecret}
            errorMessagePatched={errorMessagePatched}
            handleClose={handleClose}
          />
        )}
      </div>
    );
  }
}

CreateSecret.defaultProps = {
  open: false
};

function mapStateToProps(state) {
  return {
    errorMessageCreated: getSecretsErrorMessage(state),
    errorMessagePatched: getPatchSecretsErrorMessage(state),
    webSocketConnected: isWebSocketConnected(state),
    succesfullyCreated: getCreateSecretsSuccessMessage(state),
    loading: isFetchingSecrets(state) || isFetchingServiceAccounts(state),
    serviceAccounts: getServiceAccounts(state)
  };
}

const mapDispatchToProps = {
  createSecret,
  fetchServiceAccounts,
  patchSecret
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CreateSecret));
