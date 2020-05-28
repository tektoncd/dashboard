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

import React from 'react';
import {
  Form,
  FormGroup,
  InlineNotification,
  TextInput
} from 'carbon-components-react';
import { ALL_NAMESPACES, generateId } from '@tektoncd/dashboard-utils';
import { KeyValueList, Modal } from '@tektoncd/dashboard-components';
import { injectIntl } from 'react-intl';
import {
  NamespacesDropdown,
  PipelineResourcesDropdown,
  PipelinesDropdown,
  ServiceAccountsDropdown
} from '..';
import { getPipeline } from '../../reducers';
import { createPipelineRun } from '../../api';
import { getStore } from '../../store/index';
import { isValidLabel } from '../../utils';

import '../../scss/CreateRun.scss';

const initialState = {
  invalidLabels: {},
  labels: [],
  namespace: '',
  paramSpecs: [],
  pipelineError: false,
  pipelineRef: '',
  resourceSpecs: [],
  serviceAccount: '',
  submitError: '',
  timeout: '60',
  validationError: false,
  validTimeout: true
};

const parsePipelineInfo = (pipelineRef, namespace) => {
  if (!pipelineRef) {
    return {};
  }

  let resourceSpecs;
  let paramSpecs;
  const pipeline = getPipeline(getStore().getState(), {
    name: pipelineRef,
    namespace
  });
  if (pipeline) {
    ({ resources: resourceSpecs, params: paramSpecs } = pipeline.spec);
  }
  return {
    resourceSpecs,
    paramSpecs,
    pipelineError: !pipeline
  };
};

const initialParamsState = paramSpecs => {
  if (!paramSpecs) {
    return {};
  }
  const paramsReducer = (acc, param) => ({
    ...acc,
    [param.name]: param.default || ''
  });
  return paramSpecs.reduce(paramsReducer, {});
};

const initialResourcesState = resourceSpecs => {
  if (!resourceSpecs) {
    return {};
  }
  const resourcesReducer = (acc, resource) => ({
    ...acc,
    [resource.name]: ''
  });
  return resourceSpecs.reduce(resourcesReducer, {});
};

class CreatePipelineRun extends React.Component {
  state = initialState;

  componentDidUpdate(prevProps) {
    const { open, namespace } = this.props;
    const { open: prevOpen, namespace: prevNamespace } = prevProps;

    if ((open && !prevOpen) || namespace !== prevNamespace) {
      this.resetForm();
    }
  }

  resetError = () => {
    this.setState({ submitError: '' });
  };

  isDisabled = () => {
    if (this.state.namespace === '') {
      return true;
    }
    return false;
  };

  checkFormValidation = () => {
    // Namespace, PipelineRef, Resources, and Params must all have values
    const validNamespace = !!this.state.namespace;
    const validPipelineRef = !!this.state.pipelineRef;
    const validResources =
      !this.state.resources ||
      Object.keys(this.state.resources).reduce(
        (acc, name) => acc && !!this.state.resources[name],
        true
      );
    const validParams =
      !this.state.params ||
      Object.keys(this.state.params).reduce(
        (acc, name) => acc && !!this.state.params[name],
        true
      );

    // Timeout is a number and less than 1 year in minutes
    const timeoutTest =
      !Number.isNaN(this.state.timeout) &&
      this.state.timeout < 525600 &&
      this.state.timeout.trim() !== '';
    if (!timeoutTest) {
      this.setState({ validTimeout: false });
    } else {
      this.setState({ validTimeout: true });
    }

    // Labels
    let validLabels = true;
    this.state.labels.forEach(label => {
      ['key', 'value'].forEach(type => {
        if (!isValidLabel(type, label[type])) {
          validLabels = false;
          this.setState(prevState => ({
            invalidLabels: {
              ...prevState.invalidLabels,
              [`${label.id}-${type}`]: true
            }
          }));
        }
      });
    });

    return (
      validNamespace &&
      validPipelineRef &&
      validResources &&
      validParams &&
      timeoutTest &&
      validLabels
    );
  };

  handleClose = () => {
    this.props.onClose();
  };

  handleAddLabel = () => {
    this.setState(prevState => ({
      labels: [
        ...prevState.labels,
        {
          id: generateId(`label${prevState.labels.length}-`),
          key: '',
          keyPlaceholder: 'key',
          value: '',
          valuePlaceholder: 'value'
        }
      ]
    }));
  };

  handleRemoveLabel = index => {
    this.setState(prevState => {
      const labels = [...prevState.labels];
      const invalidLabels = { ...prevState.invalidLabels };
      const removedLabel = labels[index];
      labels.splice(index, 1);
      if (removedLabel.id in invalidLabels) {
        delete invalidLabels[`${removedLabel.id}-key`];
        delete invalidLabels[`${removedLabel.id}-value`];
      }
      return { labels, invalidLabels };
    });
  };

  handleChangeLabel = ({ type, index, value }) => {
    this.setState(prevState => {
      const labels = [...prevState.labels];
      labels[index][type] = value;
      const invalidLabels = { ...prevState.invalidLabels };
      if (!isValidLabel(type, value)) {
        invalidLabels[`${labels[index].id}-${type}`] = true;
      } else {
        delete invalidLabels[`${labels[index].id}-${type}`];
      }
      return { labels, invalidLabels };
    });
  };

  handleNamespaceChange = ({ selectedItem }) => {
    const { text = '' } = selectedItem || {};
    // Reset pipeline and ServiceAccount when namespace changes
    if (text !== this.state.namespace) {
      this.setState({
        ...initialState,
        namespace: text
      });
    }
  };

  handleParamChange = (key, value) => {
    this.setState(state => ({
      params: {
        ...state.params,
        [key]: value
      }
    }));
  };

  handlePipelineChange = ({ selectedItem }) => {
    const { text } = selectedItem || {};
    if (text && text !== this.state.pipelineRef) {
      this.setState(state => {
        const pipelineInfo = parsePipelineInfo(text, state.namespace);
        return {
          ...pipelineInfo,
          pipelineRef: text,
          resources: initialResourcesState(pipelineInfo.resourceSpecs),
          params: initialParamsState(pipelineInfo.paramSpecs)
        };
      });
      return;
    }
    // Reset pipelineresources and params when no Pipeline is selected
    this.setState(state => ({
      ...initialState,
      namespace: state.namespace
    }));
  };

  handleResourceChange = (key, value) => {
    this.setState(state => ({
      resources: {
        ...state.resources,
        [key]: value
      }
    }));
  };

  handleSubmit = event => {
    event.preventDefault();

    // Check form validation
    const valid = this.checkFormValidation();
    this.setState({
      validationError: !valid
    });
    if (!valid) {
      return;
    }

    // Send API request to create PipelineRun
    const {
      labels,
      namespace,
      params,
      pipelineRef,
      resources,
      serviceAccount,
      timeout
    } = this.state;
    const timeoutInMins = `${timeout}m`;
    createPipelineRun({
      namespace,
      pipelineName: pipelineRef,
      resources,
      params,
      serviceAccount,
      timeout: timeoutInMins,
      labels: labels.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {})
    })
      .then(response => {
        this.props.onSuccess(response);
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
  };

  initialState = () => {
    const { namespace } = this.props;
    let { pipelineRef } = this.props;
    const pipelineInfo = parsePipelineInfo(pipelineRef, namespace);
    if (pipelineInfo.pipelineError) {
      pipelineRef = '';
    }
    return {
      ...initialState,
      ...pipelineInfo,
      namespace: namespace !== ALL_NAMESPACES ? namespace : '',
      pipelineRef: pipelineRef || '',
      params: initialParamsState(pipelineInfo.paramSpecs),
      resources: initialResourcesState(pipelineInfo.resourceSpecs),
      pipelineError: ''
    };
  };

  resetForm = () => {
    this.setState(this.initialState());
  };

  render() {
    const { open, intl } = this.props;
    const {
      invalidLabels,
      labels,
      namespace,
      paramSpecs,
      pipelineRef,
      resourceSpecs,
      serviceAccount,
      validationError,
      validTimeout
    } = this.state;

    return (
      <Form>
        <Modal
          className="create-pipelinerun"
          open={open}
          modalHeading={intl.formatMessage({
            id: 'dashboard.createPipelineRun.heading',
            defaultMessage: 'Create PipelineRun'
          })}
          primaryButtonText={intl.formatMessage({
            id: 'dashboard.actions.createButton',
            defaultMessage: 'Create'
          })}
          secondaryButtonText={intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
          })}
          onRequestSubmit={this.handleSubmit}
          onRequestClose={this.handleClose}
          onSecondarySubmit={this.handleClose}
        >
          {this.state.pipelineError && (
            <InlineNotification
              kind="error"
              title={intl.formatMessage({
                id: 'dashboard.createPipelineRun.errorLoading',
                defaultMessage: 'Error retrieving Pipeline information'
              })}
              lowContrast
            />
          )}
          {validationError && (
            <InlineNotification
              kind="error"
              title={intl.formatMessage({
                id: 'dashboard.createPipelineRun.validationError',
                defaultMessage:
                  'Please fix the fields with errors, then resubmit'
              })}
              lowContrast
            />
          )}
          {this.state.submitError !== '' && (
            <InlineNotification
              kind="error"
              title={intl.formatMessage({
                id: 'dashboard.createPipelineRun.createError',
                defaultMessage: 'Error creating PipelineRun'
              })}
              subtitle={this.state.submitError}
              onCloseButtonClick={this.resetError}
              lowContrast
            />
          )}
          <FormGroup legendText="">
            <NamespacesDropdown
              id="create-pipelinerun--namespaces-dropdown"
              invalid={validationError && !namespace}
              invalidText={intl.formatMessage({
                id: 'dashboard.createPipelineRun.invalidNamespace',
                defaultMessage: 'Namespace cannot be empty'
              })}
              selectedItem={namespace ? { id: namespace, text: namespace } : ''}
              onChange={this.handleNamespaceChange}
            />
            <PipelinesDropdown
              id="create-pipelinerun--pipelines-dropdown"
              namespace={namespace}
              invalid={validationError && !pipelineRef}
              invalidText={intl.formatMessage({
                id: 'dashboard.createPipelineRun.invalidPipeline',
                defaultMessage: 'Pipeline cannot be empty'
              })}
              selectedItem={
                pipelineRef ? { id: pipelineRef, text: pipelineRef } : ''
              }
              disabled={this.isDisabled()}
              onChange={this.handlePipelineChange}
            />
          </FormGroup>
          <FormGroup legendText="">
            <KeyValueList
              legendText={intl.formatMessage({
                id: 'dashboard.createPipelineRun.labels.legendText',
                defaultMessage: 'Labels'
              })}
              invalidText={
                <span
                  dangerouslySetInnerHTML /* eslint-disable-line react/no-danger */={{
                    __html: intl.formatMessage(
                      {
                        id: 'dashboard.createPipelineRun.labels.invalidText',
                        defaultMessage:
                          'Labels must follow the {0}kubernetes labels syntax{1}.'
                      },
                      [
                        `<a
                            href="https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set"
                            target="_blank"
                            rel="noopener noreferrer"
                          >`,
                        '</a>'
                      ]
                    )
                  }}
                />
              }
              keyValues={labels}
              minKeyValues={0}
              invalidFields={invalidLabels}
              onChange={this.handleChangeLabel}
              onRemove={this.handleRemoveLabel}
              onAdd={this.handleAddLabel}
            />
          </FormGroup>
          {resourceSpecs && resourceSpecs.length !== 0 && (
            <FormGroup legendText="PipelineResources">
              {resourceSpecs.map(resourceSpec => (
                <PipelineResourcesDropdown
                  id={`create-pipelinerun--pr-dropdown-${resourceSpec.name}`}
                  key={`create-pipelinerun--pr-dropdown-${resourceSpec.name}`}
                  titleText={resourceSpec.name}
                  helperText={resourceSpec.type}
                  type={resourceSpec.type}
                  namespace={namespace}
                  invalid={
                    validationError && !this.state.resources[resourceSpec.name]
                  }
                  invalidText={intl.formatMessage({
                    id: 'dashboard.createPipelineRun.invalidPipelineResources',
                    defaultMessage: 'PipelineResources cannot be empty'
                  })}
                  selectedItem={(() => {
                    const value = this.state.resources[resourceSpec.name];
                    return value ? { id: value, text: value } : '';
                  })()}
                  onChange={({ selectedItem }) => {
                    const { text } = selectedItem || {};
                    this.handleResourceChange(resourceSpec.name, text);
                  }}
                />
              ))}
            </FormGroup>
          )}
          {paramSpecs && paramSpecs.length !== 0 && (
            <FormGroup legendText="Params">
              {paramSpecs.map(paramSpec => (
                <TextInput
                  id={`create-pipelinerun--param-${paramSpec.name}`}
                  key={`create-pipelinerun--param-${paramSpec.name}`}
                  labelText={paramSpec.name}
                  helperText={paramSpec.description}
                  placeholder={paramSpec.default || paramSpec.name}
                  invalid={
                    validationError && !this.state.params[paramSpec.name]
                  }
                  invalidText={intl.formatMessage({
                    id: 'dashboard.createPipelineRun.invalidParams',
                    defaultMessage: 'Params cannot be empty'
                  })}
                  value={this.state.params[paramSpec.name] || ''}
                  onChange={({ target: { value } }) =>
                    this.handleParamChange(paramSpec.name, value)
                  }
                />
              ))}
            </FormGroup>
          )}
          <FormGroup
            legendText={intl.formatMessage({
              id: 'dashboard.createPipelineRun.optional.legendText',
              defaultMessage: 'Optional values'
            })}
          >
            <ServiceAccountsDropdown
              id="create-pipelinerun--sa-dropdown"
              titleText={intl.formatMessage({
                id: 'dashboard.createPipelineRun.serviceAccountLabel',
                defaultMessage: 'ServiceAccount (optional)'
              })}
              namespace={namespace}
              selectedItem={
                serviceAccount
                  ? { id: serviceAccount, text: serviceAccount }
                  : ''
              }
              disabled={this.isDisabled()}
              onChange={({ selectedItem }) => {
                const { text } = selectedItem || {};
                this.setState({ serviceAccount: text });
              }}
            />
            <TextInput
              id="create-pipelinerun--timeout"
              labelText={intl.formatMessage({
                id: 'dashboard.createPipelineRun.timeoutLabel',
                defaultMessage: 'Timeout'
              })}
              helperText={intl.formatMessage({
                id: 'dashboard.createPipelineRun.timeoutHelperText',
                defaultMessage: 'PipelineRun timeout in minutes'
              })}
              invalid={validationError && !validTimeout}
              invalidText={intl.formatMessage({
                id: 'dashboard.createPipelineRun.invalidTimeout',
                defaultMessage:
                  'Timeout must be a valid number less than 525600'
              })}
              placeholder="60"
              value={this.state.timeout}
              onChange={({ target: { value } }) =>
                this.setState({ timeout: value })
              }
            />
          </FormGroup>
        </Modal>
      </Form>
    );
  }
}

CreatePipelineRun.defaultProps = {
  open: false,
  onClose: () => {},
  onSuccess: () => {}
};

export default injectIntl(CreatePipelineRun);
