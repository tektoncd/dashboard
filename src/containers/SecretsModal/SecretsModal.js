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

import { getErrorMessage } from '@tektoncd/dashboard-utils';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { InlineNotification, Modal } from 'carbon-components-react';
import UniversalFields from '../../components/SecretsModal/UniversalFields';
import Annotations from '../../components/SecretsModal/Annotations';
import BasicAuthFields from '../../components/SecretsModal/BasicAuthFields';
import '../../components/SecretsModal/SecretsModal.scss';
import { createSecret } from '../../actions/secrets';
import { getSecretsErrorMessage, isWebSocketConnected } from '../../reducers';
import { fetchServiceAccounts } from '../../actions/serviceAccounts';

/* istanbul ignore next */
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

export /* istanbul ignore next */ class SecretsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      namespace: '',
      accessTo: 'git',
      username: '',
      password: '',
      serviceAccount: '',
      annotations: [
        {
          label: `tekton.dev/git-0`,
          value: 'https://github.com',
          placeholder: 'https://github.com',
          id: Math.random()
            .toString(36)
            .substring(2, 11)
        }
      ],
      invalidFields: [],
      serviceAccounts: []
    };
  }

  componentDidUpdate(prevProps) {
    const { webSocketConnected } = this.props;
    const { webSocketConnected: prevWebSocketConnected } = prevProps;
    if (webSocketConnected && prevWebSocketConnected === false) {
      this.props.fetchServiceAccounts();
    }
  }

  handleSubmit = () => {
    const invalidFields = [];
    const postData = {
      apiVersion: 'v1',
      data: {
        password: '',
        username: ''
      },
      kind: 'Secret',
      metadata: {
        annotations: [],
        labels: {
          serviceAccount: ''
        },
        name: '',
        namespace: ''
      },
      type: 'kubernetes.io/basic-auth'
    };
    const {
      annotations,
      name,
      namespace,
      password,
      serviceAccount,
      username
    } = this.state;

    if (!validateInputs(namespace, 'namespace')) {
      invalidFields.push('namespace');
    }

    if (validateInputs(name, 'name')) {
      postData.metadata.name = name.trim();
    } else {
      invalidFields.push('name');
    }

    // If the data isn't base64 encoded, you'll confusingly get back a 404 from the secrets API

    if (validateInputs(username, 'username')) {
      const encodedUsername = Buffer.from(username).toString('base64');
      postData.data.username = encodedUsername;
    } else {
      invalidFields.push('username');
    }

    if (validateInputs(password, 'password')) {
      const encodedPass = Buffer.from(password).toString('base64');
      postData.data.password = encodedPass;
    } else {
      invalidFields.push('password');
    }

    if (validateInputs(serviceAccount, 'serviceAccount')) {
      postData.metadata.labels.serviceAccount = serviceAccount;
    } else {
      invalidFields.push('serviceAccount');
    }

    const annotationsObject = {};
    for (let i = 0; i < annotations.length; i += 1) {
      if (
        !validateInputs(annotations[i].label, `annotation-label${i}`) ||
        !validateInputs(annotations[i].value, `annotation-value${i}`)
      ) {
        if (!validateInputs(annotations[i].label, `annotation-label${i}`)) {
          invalidFields.push(`annotation-label${i}`);
        }
        if (!validateInputs(annotations[i].value, `annotation-value${i}`)) {
          invalidFields.push(`annotation-value${i}`);
        }
      } else {
        annotationsObject[annotations[i].label] = annotations[i].value;
      }
    }
    postData.metadata.annotations = annotationsObject;

    if (invalidFields.length === 0) {
      this.props.createSecret(postData, namespace);
      this.props.handleCreateSecret();
    } else {
      this.setState({ invalidFields });
    }
  };

  handleChangeTextInput = e => {
    const stateVar = e.target.id;
    const stateValue = e.target.value;
    this.setState(prevState => {
      const newInvalidFields = prevState.invalidFields;
      const idIndex = newInvalidFields.indexOf(stateVar);
      if (validateInputs(stateValue, stateVar)) {
        if (idIndex !== -1) {
          newInvalidFields.splice(idIndex, 1);
        }
      } else if (idIndex === -1) {
        newInvalidFields.push(stateVar);
      }
      return { [stateVar]: stateValue, invalidFields: newInvalidFields };
    });
  };

  handleChangeServiceAccount = e => {
    const stateVar = 'serviceAccount';
    const stateValue = e.target.value;
    this.setState(prevState => {
      const newInvalidFields = prevState.invalidFields;
      const idIndex = newInvalidFields.indexOf(stateVar);
      if (validateInputs(stateValue, stateVar)) {
        if (idIndex !== -1) {
          newInvalidFields.splice(idIndex, 1);
        }
      } else if (idIndex === -1) {
        newInvalidFields.push(stateVar);
      }
      return { [stateVar]: stateValue, invalidFields: newInvalidFields };
    });
  };

  handleChangeNamespace = e => {
    const stateVar = 'namespace';
    const stateValue = e.selectedItem.text;
    this.setState(prevState => {
      const newInvalidFields = prevState.invalidFields;
      const idIndex = newInvalidFields.indexOf(stateVar);
      if (validateInputs(stateValue, stateVar)) {
        if (idIndex !== -1) {
          newInvalidFields.splice(idIndex, 1);
        }
      } else if (idIndex === -1) {
        newInvalidFields.push(stateVar);
      }
      this.props.fetchServiceAccounts({ namespace: stateValue }).then(data => {
        this.setState({ serviceAccounts: data });
      });
      return {
        [stateVar]: stateValue,
        invalidFields: newInvalidFields
      };
    });
  };

  handleChangeAccessTo = e => {
    const stateVar = 'accessTo';
    const stateValue = e.selectedItem.id;
    this.setState(prevState => {
      const newInvalidFields = prevState.invalidFields;
      const idIndex = newInvalidFields.indexOf(stateVar);
      if (validateInputs(stateValue, stateVar)) {
        if (idIndex !== -1) {
          newInvalidFields.splice(idIndex, 1);
        }
      } else if (idIndex === -1) {
        newInvalidFields.push(stateVar);
      }
      const annotations = prevState.annotations.map(annotation => {
        const gitExampleText = 'https://github.com';
        const dockerExampleText = 'https://index.docker.io/v1/';
        let toSearch;
        let toExampleText;
        let annotationValue;
        if (stateValue === 'git') {
          toSearch = 'docker';
          toExampleText = gitExampleText;
        } else {
          toSearch = 'git';
          toExampleText = dockerExampleText;
        }
        if (
          annotation.value === gitExampleText ||
          annotation.value === dockerExampleText ||
          annotation.value.trim() === ''
        ) {
          annotationValue = toExampleText;
        } else {
          annotationValue = annotation.value;
        }
        return {
          label: annotation.label.split(toSearch).join(stateValue),
          value: annotationValue,
          id: annotation.id,
          placeholder: toExampleText
        };
      });
      return {
        [stateVar]: stateValue,
        annotations,
        invalidFields: newInvalidFields.filter(
          field => field.indexOf('annotation') === -1
        )
      };
    });
  };

  handleAnnotationChange = annotation => {
    this.setState(prevState => {
      const { key, index, value } = annotation;
      const id = `annotation-${key}${index}`;
      const newInvalidFields = prevState.invalidFields;
      const idIndex = newInvalidFields.indexOf(id);
      if (idIndex !== -1) {
        newInvalidFields.splice(idIndex, 1);
      }

      if (!validateInputs(value, id)) {
        newInvalidFields.push(id);
      }

      const { annotations } = prevState;
      annotations[index][key] = value;

      return {
        annotations,
        invalidFields: newInvalidFields
      };
    });
  };

  handleAdd = () => {
    this.setState(prevState => {
      const { annotations, accessTo } = prevState;
      let example;
      if (accessTo === 'git') {
        example = 'https://github.com';
      } else {
        example = 'https://index.docker.io/v1/';
      }
      annotations.push({
        label: `tekton.dev/${accessTo}-${annotations.length}`,
        value: example,
        placeholder: example,
        id: Math.random()
          .toString(36)
          .substring(2, 11)
      });
      return annotations;
    });
  };

  handleRemove = () => {
    this.setState(prevState => {
      const { annotations } = prevState;
      if (annotations.length - 1 !== 0) {
        annotations.pop();
      }
      return annotations;
    });
  };

  render() {
    const { open, handleHideModal, error } = this.props;
    const { serviceAccounts } = this.state;
    const {
      name,
      namespace,
      accessTo,
      username,
      password,
      annotations,
      invalidFields,
      serviceAccount
    } = this.state;

    return (
      <>
        <Modal
          open={open}
          className="modal"
          data-testid="modal"
          primaryButtonText="Submit"
          secondaryButtonText="Close"
          modalHeading="Create Secret"
          onSecondarySubmit={handleHideModal}
          onRequestSubmit={this.handleSubmit}
          onRequestClose={handleHideModal}
        >
          <form>
            <UniversalFields
              name={name}
              selectedNamespace={namespace}
              accessTo={accessTo}
              handleChangeTextInput={this.handleChangeTextInput}
              handleChangeAccessTo={this.handleChangeAccessTo}
              handleChangeNamespace={this.handleChangeNamespace}
              invalidFields={invalidFields}
            />
            <BasicAuthFields
              username={username}
              password={password}
              serviceAccount={serviceAccount}
              serviceAccounts={serviceAccounts}
              namespace={namespace}
              handleChangeTextInput={this.handleChangeTextInput}
              handleChangeServiceAccount={this.handleChangeServiceAccount}
              invalidFields={invalidFields}
            />
            <Annotations
              annotations={annotations}
              handleChange={this.handleAnnotationChange}
              handleRemove={this.handleRemove}
              handleAdd={this.handleAdd}
              invalidFields={invalidFields}
            />
            {error &&
              (open && (
                <InlineNotification
                  kind="error"
                  title="Error:"
                  subtitle={getErrorMessage(error)}
                  iconDescription="Clear Notification"
                  className="notificationComponent"
                  data-testid="errorNotificationComponent"
                  onCloseButtonClick={this.props.clearNotification}
                  lowContrast
                />
              ))}
          </form>
        </Modal>
      </>
    );
  }
}

SecretsModal.defaultProps = {
  open: false
};

function mapStateToProps(state) {
  return {
    error: getSecretsErrorMessage(state),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  createSecret,
  fetchServiceAccounts
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SecretsModal);
