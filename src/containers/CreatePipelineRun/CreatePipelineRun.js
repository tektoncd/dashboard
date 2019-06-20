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

import React from 'react';
import { connect } from 'react-redux';
import {
  Button,
  ComposedModal,
  Form,
  FormGroup,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
  Toggle
} from 'carbon-components-react';
import {
  NamespacesDropdown,
  PipelinesDropdown,
  ServiceAccountsDropdown
} from '..';
import { getSelectedNamespace } from '../../reducers';
import { createPipelineRun } from '../../api';

import './CreatePipelineRun.scss';
import { ALL_NAMESPACES } from '../../constants';

const resourceNameRegExp = /^[-.a-z0-9]{1,253}$/;
const resourceNameInvalidText =
  'Must consist of only lower case alphanumeric characters, -, and . with at most 253 characters';
const noSpacesRegExp = /^\S*$/;
const noSpacesInvalidText = 'Must contain no spaces';
const urlRegExp = /^https?:\/\/.+/;
const urlInvalidText = 'Must be a valid URL';

const formValidation = {
  namespace: {
    required: true
  },
  pipeline: {
    required: true
  },
  serviceAccount: {
    required: true
  },
  gitName: {
    required: false,
    regexp: resourceNameRegExp
  },
  gitRepoURL: {
    required: false,
    regexp: urlRegExp
  },
  gitRevision: {
    required: false,
    regexp: noSpacesRegExp
  },
  imageName: {
    required: false,
    regexp: resourceNameRegExp
  },
  imageRegistryName: {
    required: false,
    regexp: noSpacesRegExp
  },
  imageRepoName: {
    required: false,
    regexp: noSpacesRegExp
  },
  helmPipeline: {
    required: false
  },
  helmSecret: {
    required: false,
    regexp: resourceNameRegExp
  }
};

const initialState = {
  namespace: {
    value: '',
    invalid: false
  },
  pipeline: {
    value: '',
    invalid: false
  },
  serviceAccount: {
    value: '',
    invalid: false
  },
  gitName: {
    value: '',
    invalid: false
  },
  gitRevision: {
    value: '',
    invalid: false
  },
  gitRepoURL: {
    value: '',
    invalid: false
  },
  imageName: {
    value: '',
    invalid: false
  },
  imageRegistryName: {
    value: '',
    invalid: false
  },
  imageRepoName: {
    value: '',
    invalid: false
  },
  helmPipeline: {
    value: false,
    invalid: false
  },
  helmSecret: {
    value: '',
    invalid: false
  },
  errorMessage: '',
  submitValidationError: false
};

class CreatePipelineRun extends React.Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.onChange = this.onChange.bind(this);
    this.onNamespaceChange = this.onNamespaceChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onHelmToggleChange = this.onHelmToggleChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onClose = this.onClose.bind(this);
    this.reset = this.reset.bind(this);
    this.getPipeline = this.getPipeline.bind(this);
    this.checkFormValidation = this.checkFormValidation.bind(this);
    this.checkValidation = this.checkValidation.bind(this);
  }

  onChange({ name, value }) {
    this.checkValidation(name, value);
    this.setState(state => {
      return {
        [name]: {
          ...state[name],
          value
        }
      };
    });
  }

  onNamespaceChange({ name, value }) {
    if (this.getNamespace() !== value) {
      this.setState(state => {
        return {
          pipeline: {
            ...state.pipeline,
            value: ''
          },
          serviceAccount: {
            ...state.serviceAccount,
            value: ''
          }
        };
      });
    }
    this.onChange({ name, value });
  }

  onInputChange(event) {
    const { name, value } = event.target;
    this.onChange({ name, value });
  }

  onHelmToggleChange(value) {
    this.checkValidation('helmPipeline', value);
    this.setState(state => {
      return {
        helmPipeline: {
          ...state.helmPipeline,
          value
        }
      };
    });
  }

  onSubmit(event) {
    event.preventDefault();

    if (!this.checkFormValidation()) {
      this.setState({
        submitValidationError: true
      });
      return;
    }
    this.setState({
      errorMessage: '',
      submitValidationError: false
    });

    const namespace = this.getNamespace();
    const pipelineValue = this.getPipeline();
    const payload = {
      pipelinename: pipelineValue,
      serviceaccount: this.state.serviceAccount.value,
      repourl: this.state.gitRepoURL.value,
      gitresourcename: this.state.gitName.value,
      gitcommit: this.state.gitRevision.value,
      registrylocation: this.state.imageRegistryName.value,
      reponame: this.state.imageRepoName.value,
      imageresourcename: this.state.imageName.value,
      pipelineruntype: this.state.helmPipeline.value ? 'helm' : '',
      helmsecret: this.state.helmSecret.value
    };
    const promise = createPipelineRun({ namespace, payload });
    promise
      .then(headers => {
        const url = headers.get('Content-Location');
        const pipelineRunName = url.substring(url.lastIndexOf('/') + 1);
        const finalURL = `/namespaces/${namespace}/pipelines/${pipelineValue}/runs/${pipelineRunName}`;
        this.reset();
        this.props.onSuccess({ name: pipelineRunName, url: finalURL });
      })
      .catch(error => {
        error.response.text().then(text => {
          let errorMessage = text;
          if (text === '') {
            const statusCode = error.response.status;
            switch (statusCode) {
              case 400:
                errorMessage = 'bad request';
                break;
              case 412:
                errorMessage = 'pipeline not found';
                break;
              default:
                errorMessage = `error code ${statusCode}`;
            }
          }
          this.setState({ errorMessage });
        });
      });
  }

  onClose() {
    this.reset();
    this.props.onClose();
  }

  getPipeline() {
    return this.props.pipelineName || this.state.pipeline.value;
  }

  getNamespace() {
    if (this.props.namespace) {
      return this.props.namespace;
    }
    if (this.state.namespace.value !== '') {
      return this.state.namespace.value;
    }
    if (this.props.selectedNamespace !== ALL_NAMESPACES) {
      return this.props.selectedNamespace;
    }
    return '';
  }

  checkValidation(key, value) {
    const { required, regexp } = formValidation[key];
    const invalid =
      (required && value === '') ||
      (regexp && !regexp.test(value) && (required || value !== ''));
    this.setState(state => {
      return {
        [key]: {
          ...state[key],
          invalid
        }
      };
    });
    return !invalid;
  }

  checkFormValidation() {
    const reducer = (acc, key) => {
      if (key === 'namespace') {
        return this.checkValidation(key, this.getNamespace()) && acc;
      }
      if (key === 'pipeline') {
        return this.checkValidation(key, this.getPipeline()) && acc;
      }
      return this.checkValidation(key, this.state[key].value) && acc;
    };
    return Object.keys(formValidation).reduce(reducer, true);
  }

  reset() {
    this.setState(initialState);
  }

  render() {
    const { pipelineName, open, namespace } = this.props;
    const { errorMessage } = this.state;
    const namespaceValue = this.getNamespace();
    const pipelineValue = this.getPipeline();

    return (
      <Form onSubmit={this.onSubmit}>
        <ComposedModal
          className="create-pipelinerun"
          onClose={this.onClose}
          open={open}
        >
          <ModalHeader
            id="create-pipelinerun--header"
            title="Create PipelineRun"
            label={pipelineName}
            closeModal={this.onClose}
          />
          <ModalBody>
            {errorMessage !== '' && (
              <InlineNotification
                kind="error"
                title="Error creating PipelineRun"
                subtitle={errorMessage}
              />
            )}
            {this.state.submitValidationError && (
              <InlineNotification
                kind="error"
                title="Unable to submit"
                subtitle="Please fix the fields with errors"
              />
            )}
            <NamespacesDropdown
              id="namespaces-dropdown"
              selectedItem={
                namespaceValue !== ''
                  ? { id: namespaceValue, text: namespaceValue }
                  : ''
              }
              onChange={({ selectedItem }) =>
                this.onNamespaceChange({
                  name: 'namespace',
                  value: selectedItem.text
                })
              }
              disabled={!!namespace}
              invalid={this.state.namespace.invalid}
              invalidText="Namespace cannot be empty"
            />
            <PipelinesDropdown
              id="dropdown-pipeline"
              namespace={namespaceValue}
              selectedItem={
                pipelineValue !== ''
                  ? { id: pipelineValue, text: pipelineValue }
                  : ''
              }
              onChange={({ selectedItem }) =>
                this.onChange({
                  name: 'pipeline',
                  value: selectedItem.text
                })
              }
              disabled={!!pipelineName}
              invalid={this.state.pipeline.invalid}
              invalidText="Pipeline cannot be empty"
            />
            <ServiceAccountsDropdown
              id="dropdown-service-account"
              namespace={namespaceValue}
              selectedItem={
                this.state.serviceAccount.value !== ''
                  ? {
                      id: this.state.serviceAccount.value,
                      text: this.state.serviceAccount.value
                    }
                  : ''
              }
              onChange={({ selectedItem }) =>
                this.onChange({
                  name: 'serviceAccount',
                  value: selectedItem.text
                })
              }
              invalid={this.state.serviceAccount.invalid}
              invalidText="Service Account cannot be empty"
            />

            <FormGroup legendText="Git Resource (optional)">
              <TextInput
                id="git-resource-name-text-input"
                labelText="Name"
                placeholder="git-source"
                name="gitName"
                invalidText={resourceNameInvalidText}
                invalid={this.state.gitName.invalid}
                value={this.state.gitName.value}
                onChange={this.onInputChange}
              />
              <TextInput
                id="git-repo-url-text-input"
                labelText="Repository URL"
                placeholder="https://github.com/user/project"
                name="gitRepoURL"
                invalidText={urlInvalidText}
                invalid={this.state.gitRepoURL.invalid}
                value={this.state.gitRepoURL.value}
                onChange={this.onInputChange}
              />
              <TextInput
                id="git-revision-text-input"
                labelText="Revision"
                helperText="Branch name or commit ID"
                placeholder="master"
                name="gitRevision"
                invalidText={noSpacesInvalidText}
                invalid={this.state.gitRevision.invalid}
                value={this.state.gitRevision.value}
                onChange={this.onInputChange}
              />
            </FormGroup>

            <FormGroup legendText="Image Resource (optional)">
              <TextInput
                id="image-name-text-input"
                labelText="Name"
                placeholder="docker-image"
                name="imageName"
                invalidText={resourceNameInvalidText}
                invalid={this.state.imageName.invalid}
                value={this.state.imageName.value}
                onChange={this.onInputChange}
              />
              <TextInput
                id="image-registry-text-input"
                labelText="Registry"
                placeholder="registryname"
                name="imageRegistryName"
                invalidText={noSpacesInvalidText}
                invalid={this.state.imageRegistryName.invalid}
                value={this.state.imageRegistryName.value}
                onChange={this.onInputChange}
              />
              <TextInput
                id="image-repo-text-input"
                labelText="Repository"
                placeholder="reponame"
                name="imageRepoName"
                invalidText={noSpacesInvalidText}
                invalid={this.state.imageRepoName.invalid}
                value={this.state.imageRepoName.value}
                onChange={this.onInputChange}
              />
            </FormGroup>

            <FormGroup legendText="Helm (optional)">
              <Toggle
                id="helm-pipeline-toggle"
                data-testid="helm-pipeline-toggle"
                labelText="Toggle On when using a Helm pipeline"
                name="helmPipeline"
                toggled={this.state.helmPipeline.value}
                onToggle={this.onHelmToggleChange}
              />
              <TextInput
                id="helm-secret-text-input"
                labelText="Secret"
                placeholder="helm-secret"
                name="helmSecret"
                invalidText={resourceNameInvalidText}
                invalid={this.state.helmSecret.invalid}
                value={this.state.helmSecret.value}
                onChange={this.onInputChange}
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button kind="secondary" onClick={this.onClose}>
              Cancel
            </Button>
            <Button kind="primary" type="submit">
              Submit
            </Button>
          </ModalFooter>
        </ComposedModal>
      </Form>
    );
  }
}

CreatePipelineRun.defaultProps = {
  open: false,
  onClose: () => {},
  onSuccess: () => {}
};

const mapStateToProps = state => {
  return {
    selectedNamespace: getSelectedNamespace(state)
  };
};

export default connect(mapStateToProps)(CreatePipelineRun);
