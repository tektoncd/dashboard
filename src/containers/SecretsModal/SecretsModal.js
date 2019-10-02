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
import { Modal } from 'carbon-components-react';
import UniversalFields from '../../components/SecretsModal/UniversalFields';
import Annotations from '../../components/SecretsModal/Annotations';
import BasicAuthFields from '../../components/SecretsModal/BasicAuthFields';
import '../../components/SecretsModal/SecretsModal.scss';
import { createSecret } from '../../actions/secrets';
import { isWebSocketConnected } from '../../reducers';
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
          value: '',
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
    const postData = { type: 'userpass' };
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
      postData.name = name.trim();
    } else {
      invalidFields.push('name');
    }

    if (validateInputs(username, 'username')) {
      postData.username = username;
    } else {
      invalidFields.push('username');
    }

    if (validateInputs(password, 'password')) {
      postData.password = password;
    } else {
      invalidFields.push('password');
    }

    if (validateInputs(serviceAccount, 'serviceAccount')) {
      postData.serviceAccount = serviceAccount;
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
    postData.url = annotationsObject;

    if (invalidFields.length === 0) {
      this.props.createSecret(postData, namespace);
      this.props.handleNew();
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
        let toSearch;
        let toExampleText;
        if (stateValue === 'git') {
          toSearch = 'docker';
          toExampleText = 'https://github.com';
        } else {
          toSearch = 'git';
          toExampleText = 'https://index.docker.io/v1/';
        }
        return {
          label: annotation.label.split(toSearch).join(stateValue),
          value: annotation.value,
          id: annotation.id,
          placeholder: toExampleText
        };
      });
      return {
        [stateVar]: stateValue,
        annotations,
        invalidFields: newInvalidFields
      };
    });
  };

  handleAnnotationChange = e => {
    e.persist();
    this.setState(prevState => {
      let { id } = e.target;
      const { value } = e.target;
      const newInvalidFields = prevState.invalidFields;
      const idIndex = newInvalidFields.indexOf(id);
      if (idIndex !== -1) {
        newInvalidFields.splice(idIndex, 1);
      }

      if (!validateInputs(value, id)) {
        newInvalidFields.push(id);
      }

      id = id
        .split('-')
        .splice(1, 2)
        .join();
      const index = id.substring(id.length - 1);
      id = id.slice(0, -1);

      const { annotations } = prevState;
      annotations[index][id] = value;

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
        value: '',
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
    const { open, handleNew } = this.props;
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
        primaryButtonText="Submit"
        secondaryButtonText="Close"
        modalHeading="Create Secret"
        onSecondarySubmit={handleNew}
        onRequestSubmit={this.handleSubmit}
        onRequestClose={handleNew}
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
