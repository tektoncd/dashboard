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

import { generateId, getErrorMessage } from '@tektoncd/dashboard-utils';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { KeyValueList } from '@tektoncd/dashboard-components';
import { injectIntl } from 'react-intl';
import { InlineNotification, Modal } from 'carbon-components-react';
import UniversalFields from '../../components/SecretsModal/UniversalFields';
import BasicAuthFields from '../../components/SecretsModal/BasicAuthFields';
import { createSecret } from '../../actions/secrets';
import { getSecretsErrorMessage, isWebSocketConnected } from '../../reducers';
import { fetchServiceAccounts } from '../../actions/serviceAccounts';

import '../../components/SecretsModal/SecretsModal.scss';

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

// Used to determine if an annotation has been added or removed and therefore if the modal should scroll down
function handleScroll(state, prevState) {
  let shouldScroll = true;
  if (state.name !== prevState.name) {
    shouldScroll = false;
  } else if (state.namespace !== prevState.namespace) {
    shouldScroll = false;
  } else if (state.username !== prevState.username) {
    shouldScroll = false;
  } else if (state.password !== prevState.password) {
    shouldScroll = false;
  } else if (state.serviceAccount !== prevState.serviceAccount) {
    shouldScroll = false;
  } else if (state.serviceAccounts !== prevState.serviceAccounts) {
    shouldScroll = false;
  } else if (state.accessTo !== prevState.accessTo) {
    shouldScroll = false;
  } else if (state.annotations.label !== prevState.annotations.label) {
    shouldScroll = false;
  }
  return shouldScroll;
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
          key: 'tekton.dev/git-0',
          keyPlaceholder: 'tekton.dev/git-0',
          value: 'https://github.com',
          valuePlaceholder: 'https://github.com',
          id: generateId(`annotation0-`)
        }
      ],
      invalidFields: {},
      serviceAccounts: []
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { webSocketConnected } = this.props;
    const { webSocketConnected: prevWebSocketConnected } = prevProps;
    if (webSocketConnected && prevWebSocketConnected === false) {
      this.props.fetchServiceAccounts();
    }
    if (handleScroll(this.state, prevState)) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    this.annotationsEnd.scrollIntoView({ behavior: 'auto' });
  };

  handleSubmit = async () => {
    const invalidFields = {};
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
      invalidFields.namespace = true;
    }

    if (validateInputs(name, 'name')) {
      postData.metadata.name = name.trim();
    } else {
      invalidFields.name = true;
    }

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

    if (validateInputs(serviceAccount, 'serviceAccount')) {
      postData.metadata.labels.serviceAccount = serviceAccount;
    } else {
      invalidFields.serviceAccount = true;
    }

    const annotationsObject = {};
    for (let i = 0; i < annotations.length; i += 1) {
      const { key, value, id } = annotations[i];
      const keyId = `${id}-key`;
      const valueId = `${id}-value`;
      if (!validateInputs(key, keyId)) {
        invalidFields[keyId] = true;
      }
      if (!validateInputs(value, valueId)) {
        invalidFields[valueId] = true;
      }
      annotationsObject[key] = value;
    }
    postData.metadata.annotations = annotationsObject;
    if (Object.keys(invalidFields).length === 0) {
      const result = await this.props.createSecret(postData, namespace);
      await this.props.handleCreateSecret(result);
    } else {
      this.setState({ invalidFields });
    }
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

  handleChangeServiceAccount = e => {
    const stateVar = 'serviceAccount';
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
      this.props.fetchServiceAccounts({ namespace: stateValue }).then(data => {
        this.setState({ serviceAccounts: data });
      });
      return { [stateVar]: stateValue, invalidFields: newInvalidFields };
    });
  };

  handleChangeAccessTo = e => {
    const stateVar = 'accessTo';
    const stateValue = e.selectedItem.id;
    this.setState(prevState => {
      const newInvalidFields = prevState.invalidFields;
      if (validateInputs(stateValue, stateVar)) {
        delete newInvalidFields[stateVar];
      } else {
        newInvalidFields[stateVar] = true;
      }
      const annotations = prevState.annotations.map((annotation, index) => {
        const gitExampleText = 'https://github.com';
        const gitKeyPlaceholder = 'tekton.dev/git-';
        const dockerExampleText = 'https://index.docker.io/v1/';
        const dockerKeyPlaceholder = 'tekton.dev/docker-';
        let toSearch;
        let toExampleText;
        let toKeyPlaceholder;
        let annotationValue;
        delete newInvalidFields[`${annotation.id}-value`];
        if (stateValue === 'git') {
          toSearch = 'docker';
          toExampleText = gitExampleText;
          toKeyPlaceholder = gitKeyPlaceholder.concat(index);
        } else {
          toSearch = 'git';
          toExampleText = dockerExampleText;
          toKeyPlaceholder = dockerKeyPlaceholder.concat(index);
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
          id: annotation.id,
          key: annotation.key.split(toSearch).join(stateValue),
          value: annotationValue,
          keyPlaceholder: toKeyPlaceholder,
          valuePlaceholder: toExampleText
        };
      });
      return {
        [stateVar]: stateValue,
        annotations,
        invalidFields: newInvalidFields
      };
    });
  };

  handleAnnotationChange = ({ type, index, value }) => {
    this.setState(prevState => {
      const annotations = [...prevState.annotations];
      annotations[index][type] = value;

      const newInvalidFields = { ...prevState.invalidFields };
      const { id } = annotations[index];
      if (!validateInputs(value, id)) {
        newInvalidFields[`${id}-${type}`] = true;
      } else {
        delete newInvalidFields[`${id}-${type}`];
      }

      return {
        annotations,
        invalidFields: newInvalidFields
      };
    });
  };

  handleAdd = () => {
    this.setState(prevState => {
      const { accessTo, annotations } = prevState;
      let example;
      if (accessTo === 'git') {
        example = 'https://github.com';
      } else {
        example = 'https://index.docker.io/v1/';
      }
      const key = `tekton.dev/${accessTo}-${annotations.length}`;
      return {
        annotations: [
          ...annotations,
          {
            key,
            keyPlaceholder: key,
            value: example,
            valuePlaceholder: example,
            id: generateId(`annotation${annotations.length}-`)
          }
        ]
      };
    });
  };

  handleRemove = () => {
    this.setState(prevState => {
      const annotations = [...prevState.annotations];
      const invalidFields = { ...prevState.invalidFields };
      let removedAnnotation;
      if (annotations.length - 1 !== 0) {
        removedAnnotation = annotations.pop();
        if (removedAnnotation) {
          delete invalidFields[`${removedAnnotation.id}-key`];
          delete invalidFields[`${removedAnnotation.id}-value`];
        }
      }
      return { annotations, invalidFields };
    });
  };

  render() {
    const { open, handleHideModal, errorMessage, intl } = this.props;
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
      <Modal
        open={open}
        className="modal"
        data-testid="modal"
        primaryButtonText={intl.formatMessage({
          id: 'dashboard.actions.createButton',
          defaultMessage: 'Create'
        })}
        secondaryButtonText={intl.formatMessage({
          id: 'dashboard.modal.cancelButton',
          defaultMessage: 'Cancel'
        })}
        modalHeading={intl.formatMessage({
          id: 'dashboard.secretsModal.heading',
          defaultMessage: 'Create Secret'
        })}
        onSecondarySubmit={handleHideModal}
        onRequestSubmit={this.handleSubmit}
        onRequestClose={handleHideModal}
      >
        <form>
          {errorMessage &&
            (open && (
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
                className="notificationComponent"
                data-testid="errorNotificationComponent"
                onCloseButtonClick={this.props.clearNotification}
                lowContrast
              />
            ))}
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
          <KeyValueList
            legendText={intl.formatMessage({
              id: 'dashboard.secretsModal.annotations.legendText',
              defaultMessage: 'Server URL'
            })}
            invalidText={intl.formatMessage({
              id: 'dashboard.secretsModal.annotations.invalidText',
              defaultMessage: 'Server URL required.'
            })}
            ariaLabelKey={intl.formatMessage({
              id: 'dashboard.secretsModal.annotations.ariaLabelKey',
              defaultMessage: 'This is the tag Tekton uses for its resources.'
            })}
            ariaLabelValue={intl.formatMessage({
              id: 'dashboard.secretsModal.annotations.ariaLabelValue',
              defaultMessage: 'This is the URL for the given Tekton resource.'
            })}
            keyValues={annotations}
            minKeyValues={1}
            invalidFields={invalidFields}
            onChange={this.handleAnnotationChange}
            onRemove={this.handleRemove}
            onAdd={this.handleAdd}
          />
          <div
            ref={el => {
              this.annotationsEnd = el;
            }}
          />
        </form>
      </Modal>
    );
  }
}

SecretsModal.defaultProps = {
  open: false
};

function mapStateToProps(state) {
  return {
    errorMessage: getSecretsErrorMessage(state),
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
)(injectIntl(SecretsModal));
