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
import { getErrorMessage } from '@tektoncd/dashboard-utils';
import { Modal } from '@tektoncd/dashboard-components';

import GitResourceFields from '../../components/PipelineResourcesModal/GitResourceFields';
import UniversalFields from '../../components/PipelineResourcesModal/UniversalFields';
import { isWebSocketConnected } from '../../reducers';
import { fetchServiceAccounts } from '../../actions/serviceAccounts';
import { createPipelineResource } from '../../api';

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

export /* istanbul ignore next */ class PipelineResourcesModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      namespace: '',
      type: 'Git',
      url: '',
      revision: '',
      invalidFields: {},
      submitError: ''
    };
  }

  componentDidUpdate(prevProps) {
    const { webSocketConnected } = this.props;
    const { webSocketConnected: prevWebSocketConnected } = prevProps;
    if (webSocketConnected && prevWebSocketConnected === false) {
      this.props.fetchServiceAccounts();
    }
  }

  handleClose = () => {
    this.props.onClose();
  };

  resetError = () => {
    this.setState({ submitError: '' });
  };

  resetForm = () => {
    this.setState({
      name: '',
      namespace: '',
      type: 'Git',
      url: '',
      revision: '',
      invalidFields: {},
      submitError: ''
    });
  };

  handleSubmit = async () => {
    const { name, namespace, type, url, revision } = this.state;
    const invalidFields = {};
    let resource;
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

    if (Object.keys(invalidFields).length === 0) {
      const result = await createPipelineResource({ namespace, resource })
        .then(response => {
          this.resetForm();
          this.props.onSuccess(response);
          this.props.handleCreatePipelineResource(result);
        })
        .catch(error => {
          error.response.text().then(text => {
            const statusCode = error.response.status;
            let errorMessage = `error code ${statusCode}`;
            if (text) {
              errorMessage = `${text} (error code ${statusCode})`;
            }
            this.setState({ submitError: errorMessage });
          });
        });
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
    let gitSource;
    const stateVar = 'type';
    const stateValue = e.selectedItem.text;
    this.setState(prevState => {
      if (stateValue === 'Git') {
        gitSource = true;
      } else {
        gitSource = false;
      }
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
    const { open, intl } = this.props;
    const {
      name,
      namespace,
      type,
      url,
      revision,
      invalidFields,
      gitSource = true
    } = this.state;

    return (
      <Modal
        open={open}
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
          id: 'dashboard.pipelineResourcesModal.heading',
          defaultMessage: 'Create PipelineResource'
        })}
        onSecondarySubmit={this.handleClose}
        onRequestSubmit={this.handleSubmit}
        onRequestClose={this.handleClose}
      >
        <form>
          {this.state.submitError && open && (
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
              data-testid="errorNotificationComponent"
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
      </Modal>
    );
  }
}

PipelineResourcesModal.defaultProps = {
  open: false,
  onClose: () => {}
};

function mapStateToProps(state) {
  return {
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  createPipelineResource,
  fetchServiceAccounts
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PipelineResourcesModal));
