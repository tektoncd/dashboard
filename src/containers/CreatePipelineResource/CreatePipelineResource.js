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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Button, InlineNotification } from 'carbon-components-react';
import {
  ALL_NAMESPACES,
  getErrorMessage,
  getTitle,
  urls
} from '@tektoncd/dashboard-utils';

import GitResourceFields from '../../components/CreatePipelineResource/GitResourceFields';
import UniversalFields from '../../components/CreatePipelineResource/UniversalFields';
import { createPipelineResource } from '../../api';
import { getSelectedNamespace } from '../../reducers';

import '../../scss/Create.scss';

/* istanbul ignore next */
function validateInputs(value, id) {
  const trimmed = value.trim();

  if (trimmed === '') {
    return false;
  }
  if (id === 'name') {
    if (trimmed.length >= 64) {
      return false;
    }

    if (/[^-a-z0-9]/.test(trimmed)) {
      return false;
    }

    if (trimmed.startsWith('-', 0) || trimmed.endsWith('-')) {
      return false;
    }
  }

  return true;
}

export /* istanbul ignore next */ class CreatePipelineResource extends Component {
  constructor(props) {
    super(props);
    const { defaultNamespace } = props;
    this.state = {
      creating: false,
      name: '',
      namespace: defaultNamespace === ALL_NAMESPACES ? '' : defaultNamespace,
      type: 'Git',
      url: '',
      revision: '',
      invalidFields: {},
      submitError: ''
    };
  }

  componentDidMount() {
    const { intl } = this.props;
    document.title = getTitle({
      page: intl.formatMessage({
        id: 'dashboard.createPipelineResource.title',
        defaultMessage: 'Create PipelineResource'
      })
    });
  }

  handleClose = () => {
    const { history } = this.props;
    history.push(urls.pipelineResources.all());
  };

  resetError = () => {
    this.setState({ submitError: '' });
  };

  handleSubmit = () => {
    const { name, namespace, type, url, revision } = this.state;
    const invalidFields = {};
    let resource;

    this.setState({ creating: true });

    if (this.state.type === 'Git') {
      resource = {
        apiVersion: 'tekton.dev/v1alpha1',
        kind: 'PipelineResource',
        metadata: {
          name: '',
          namespace
        },
        spec: {
          type: '',
          params: [
            {
              name: 'url',
              value: ''
            },
            {
              name: 'revision',
              value: ''
            }
          ]
        }
      };
    } else {
      resource = {
        apiVersion: 'tekton.dev/v1alpha1',
        kind: 'PipelineResource',
        metadata: {
          name: '',
          namespace
        },
        spec: {
          type: '',
          params: [
            {
              name: 'url',
              value: ''
            }
          ]
        }
      };
    }

    if (!validateInputs(namespace, 'namespace')) {
      invalidFields.namespace = true;
    } else {
      resource.metadata.namespace = namespace;
    }

    if (validateInputs(name, 'name')) {
      resource.metadata.name = name.trim();
    } else {
      invalidFields.name = true;
    }

    if (validateInputs(url, 'url')) {
      resource.spec.params[0].value = url.trim();
    } else {
      invalidFields.url = true;
    }

    resource.spec.type = type.toLowerCase();

    if (this.state.type === 'Git') {
      if (validateInputs(revision, 'revision')) {
        resource.spec.params[1].value = revision;
      } else {
        invalidFields.revision = true;
      }
    }

    if (Object.keys(invalidFields).length) {
      this.setState({ creating: false, invalidFields });
      return;
    }

    createPipelineResource({ namespace, resource })
      .then(() => {
        const { history } = this.props;
        history.push(urls.pipelineResources.byNamespace({ namespace }));
      })
      .catch(error => {
        error.response.text().then(text => {
          const statusCode = error.response.status;
          let errorMessage = `error code ${statusCode}`;
          if (text) {
            errorMessage = `${text} (error code ${statusCode})`;
          }
          this.setState({ creating: false, submitError: errorMessage });
        });
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

  handleChangeNamespace = ({ selectedItem }) => {
    const stateVar = 'namespace';
    const { text: stateValue = '' } = selectedItem || {};
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

  handleChangeType = e => {
    const stateVar = 'type';
    const stateValue = e.selectedItem.text;
    this.setState(prevState => {
      const gitSource = stateValue === 'Git';
      const newInvalidFields = prevState.invalidFields;
      if (validateInputs(stateValue, stateVar)) {
        delete newInvalidFields[stateVar];
      } else {
        newInvalidFields[stateVar] = true;
      }
      return {
        [stateVar]: stateValue,
        invalidFields: newInvalidFields,
        gitSource
      };
    });
  };

  render() {
    const { intl } = this.props;
    const {
      creating,
      gitSource = true,
      invalidFields,
      name,
      namespace,
      revision,
      type,
      url
    } = this.state;

    return (
      <div className="tkn--create">
        <div className="tkn--create--heading">
          <h1>
            {intl.formatMessage({
              id: 'dashboard.createPipelineResource.heading',
              defaultMessage: 'Create PipelineResource'
            })}
          </h1>
          <Button
            iconDescription={intl.formatMessage({
              id: 'dashboard.modal.cancelButton',
              defaultMessage: 'Cancel'
            })}
            kind="secondary"
            onClick={this.handleClose}
            disabled={creating}
          >
            {intl.formatMessage({
              id: 'dashboard.modal.cancelButton',
              defaultMessage: 'Cancel'
            })}
          </Button>
          <Button
            iconDescription={intl.formatMessage({
              id: 'dashboard.actions.createButton',
              defaultMessage: 'Create'
            })}
            onClick={this.handleSubmit}
            disabled={creating}
          >
            {intl.formatMessage({
              id: 'dashboard.actions.createButton',
              defaultMessage: 'Create'
            })}
          </Button>
        </div>

        <form>
          {this.state.submitError && (
            <InlineNotification
              kind="error"
              title={intl.formatMessage({
                id: 'dashboard.error.title',
                defaultMessage: 'Error:'
              })}
              subtitle={getErrorMessage(this.state.submitError)}
              iconDescription={intl.formatMessage({
                id: 'dashboard.notification.clear',
                defaultMessage: 'Clear Notification'
              })}
              onCloseButtonClick={this.resetError}
              lowContrast
            />
          )}
          <UniversalFields
            name={name}
            selectedNamespace={namespace}
            type={type}
            handleChangeTextInput={this.handleChangeTextInput}
            handleChangeType={this.handleChangeType}
            handleChangeNamespace={this.handleChangeNamespace}
            url={url}
            invalidFields={invalidFields}
          />
          {gitSource && (
            <GitResourceFields
              revision={revision}
              handleChangeTextInput={this.handleChangeTextInput}
              invalidFields={invalidFields}
            />
          )}
        </form>
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    defaultNamespace: getSelectedNamespace(state)
  };
}

const mapDispatchToProps = {
  createPipelineResource
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CreatePipelineResource));
