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
import { fetchNamespaces } from '../../actions/namespaces';
import { getNamespaces } from '../../reducers';

/* istanbul ignore next */
function validateK8sResources(value, id) {
  if (value.trim() === '') return false;

  const trimmed = value.trim();

  if (id === 'name' || id === 'serviceAccount') {
    if (trimmed.length > 253) return false;

    if (/[^-.a-z1-9]/.test(trimmed)) return false;
  }

  return true;
}

const initialState = {
  name: '',
  namespace: '',
  accessTo: '',
  username: '',
  password: '',
  serviceAccount: '',
  annotations: [`tekton.dev/git-0`, ''],
  invalidFields: []
};

export /* istanbul ignore next */ class SecretsModal extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentDidMount() {
    this.props.fetchNamespaces();
  }

  componentWillUnmount() {
    this.setState(initialState);
  }

  handleSubmit = () => {
    const invalidFields = [];
    const postData = { type: 'userpass' };
    const {
      name,
      namespace,
      username,
      password,
      annotations,
      accessTo,
      serviceAccount
    } = this.state;

    if (validateK8sResources(name, 'name')) postData.name = name;
    else invalidFields.push('name');

    if (validateK8sResources(namespace, 'namespace'))
      postData.namespace = namespace;
    else invalidFields.push('namespace');

    if (accessTo === '') invalidFields.push('accessTo');

    if (validateK8sResources(username, 'username'))
      postData.username = username;
    else invalidFields.push('username');

    if (validateK8sResources(password, 'password'))
      postData.password = password;
    else invalidFields.push('password');

    if (validateK8sResources(serviceAccount, 'serviceAccount'))
      postData.serviceAccount = serviceAccount;
    else invalidFields.push('serviceAccount');

    const annotationsObject = {};
    for (let i = 0; i < annotations.length; i += 2) {
      if (
        !validateK8sResources(annotations[i], `annotation${i}`) ||
        !validateK8sResources(annotations[i + 1], `annotation${i + 1}`)
      ) {
        if (!validateK8sResources(annotations[i], `annotation${i}`))
          invalidFields.push(`annotation${i}`);
        if (!validateK8sResources(annotations[i + 1], `annotation${i + 1}`))
          invalidFields.push(`annotation${i + 1}`);
      } else annotationsObject[annotations[i]] = annotations[i + 1];
    }
    postData.url = annotationsObject;

    if (invalidFields.length === 0) {
      this.props.createSecret(postData, namespace);
      this.props.handleNew();
    } else this.setState({ invalidFields });
  };

  handleChange = e => {
    const { id, value } = e.target;
    this.setState(function(prevState) {
      const newInvalidFields = prevState.invalidFields;
      const idIndex = newInvalidFields.indexOf(id);
      if (validateK8sResources(value, id)) {
        if (idIndex !== -1) newInvalidFields.splice(idIndex, 1);
      } else if (idIndex === -1) newInvalidFields.push(id);

      if (id === 'accessTo') {
        const annotations = prevState.annotations.map((annotation, index) => {
          if (index % 2 === 0) {
            let toSearch;
            if (value === 'git') toSearch = 'docker';
            else toSearch = 'git';
            return annotation.split(toSearch).join(value);
          }
          return annotation;
        });
        return { [id]: value, annotations, invalidFields: newInvalidFields };
      }
      return { [id]: value, invalidFields: newInvalidFields };
    });
  };

  handleAnnotationChange = e => {
    e.persist();
    this.setState(function(prevState) {
      const { id, value } = e.target;
      const newInvalidFields = prevState.invalidFields;
      const idIndex = newInvalidFields.indexOf(id);
      if (idIndex !== -1) {
        newInvalidFields.splice(idIndex, 1);
      }

      const annotations = prevState.annotations.map((annotation, index) => {
        if (`annotation${index}` === id) {
          if (!validateK8sResources(value, id)) newInvalidFields.push(id);
          return value;
        }
        return annotation;
      });

      return {
        annotations,
        invalidFields: newInvalidFields
      };
    });
  };

  handleAdd = () => {
    this.setState(function(prevState) {
      if (prevState.serviceAccount.trim() !== '') {
        const { annotations, accessTo } = prevState;
        annotations.push(`tekton.dev/${accessTo}-${annotations.length / 2}`);
        annotations.push('');
        return {
          annotations
        };
      }
      return prevState;
    });
  };

  handleRemove = () => {
    this.setState(function(prevState) {
      if (prevState.serviceAccount.trim() !== '') {
        const { annotations } = prevState;
        if (annotations.length / 2 - 1 !== 0) {
          annotations.pop();
          annotations.pop();
        }
        return {
          annotations
        };
      }
      return prevState;
    });
  };

  render() {
    const { open, namespaces, handleNew } = this.props;
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
            namespaces={namespaces}
            accessTo={accessTo}
            handleChange={this.handleChange}
            invalidFields={invalidFields}
          />
          <BasicAuthFields
            username={username}
            password={password}
            serviceAccount={serviceAccount}
            handleChange={this.handleChange}
            invalidFields={invalidFields}
            disabled={accessTo.trim() === ''}
          />
          <Annotations
            annotations={annotations}
            handleChange={this.handleAnnotationChange}
            handleRemove={this.handleRemove}
            handleAdd={this.handleAdd}
            invalidFields={invalidFields}
            disabled={serviceAccount.trim() === ''}
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
    namespaces: getNamespaces(state)
  };
}

const mapDispatchToProps = {
  createSecret,
  fetchNamespaces
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SecretsModal);
