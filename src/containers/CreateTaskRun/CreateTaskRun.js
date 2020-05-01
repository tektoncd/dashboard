/*
Copyright 2020 The Tekton Authors
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
  Dropdown,
  Form,
  FormGroup,
  InlineNotification,
  Modal,
  TextInput
} from 'carbon-components-react';
import { ALL_NAMESPACES, generateId } from '@tektoncd/dashboard-utils';
import { KeyValueList } from '@tektoncd/dashboard-components';
import { injectIntl } from 'react-intl';
import {
  ClusterTasksDropdown,
  NamespacesDropdown,
  PipelineResourcesDropdown,
  ServiceAccountsDropdown,
  TasksDropdown
} from '..';
import { getClusterTask, getTask } from '../../reducers';
import { createTaskRun } from '../../api';
import { getStore } from '../../store/index';
import { isValidLabel } from '../../utils';

import '../../scss/CreateRun.scss';

const parseTaskInfo = (state, taskRef, kind, namespace) => {
  if (taskRef) {
    const task =
      kind === 'ClusterTask'
        ? getClusterTask(state, taskRef)
        : getTask(state, { name: taskRef, namespace });
    const paramSpecs = task?.spec?.params;
    const resourceSpecs = task?.spec?.resources;
    const taskError = !task;
    return { resourceSpecs, paramSpecs, taskError };
  }
  return {};
};

const initialTaskInfoState = () => {
  return {
    namespace: '',
    paramSpecs: [],
    resourceSpecs: [],
    taskError: false,
    taskRef: ''
  };
};

const initialParamsState = paramSpecs => {
  if (!paramSpecs) {
    return {};
  }
  return paramSpecs.reduce(
    (acc, param) => ({ ...acc, [param.name]: param.default || '' }),
    {}
  );
};

const initialResourcesState = resourceSpecs => {
  if (!resourceSpecs) {
    return {};
  }
  const resources = {
    inputs: {},
    outputs: {}
  };
  if (resourceSpecs.inputs) {
    resources.inputs = resourceSpecs.inputs.reduce(
      (acc, res) => ({ ...acc, [res.name]: '' }),
      {}
    );
  }
  if (resourceSpecs.outputs) {
    resources.outputs = resourceSpecs.outputs.reduce(
      (acc, res) => ({ ...acc, [res.name]: '' }),
      {}
    );
  }
  return resources;
};

const itemToString = item => (item ? item.text : '');

class CreateTaskRun extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initialState(props);
  }

  componentDidUpdate(prevProps) {
    // Catch instances when the Task is loaded after the constructor is called
    if (this.props.resourceSpecs !== prevProps.resourceSpecs) {
      this.resetResourcesState();
    }
    if (this.props.paramSpecs !== prevProps.paramSpecs) {
      this.resetParamsState();
    }
    // Reset the form if the namespace changes
    if (this.props.namespace !== prevProps.namespace) {
      this.resetForm();
    }
  }

  getTaskInfo = (key, { state = this.state, props = this.props } = {}) => {
    if (key === 'disabled') {
      // Disable task info selection when taskRef is supplied
      return !!props.taskRef;
    }
    // Use props when taskRef is supplied
    return props.taskRef ? props[key] : state[key];
  };

  checkFormValidation = () => {
    // Namespace, PipelineRef, Resources, and Params must all have values
    const validNamespace = !!this.getTaskInfo('namespace');
    const validTaskRef = !!this.getTaskInfo('taskRef');
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
    const validTimeout =
      !Number.isNaN(this.state.timeout) &&
      this.state.timeout < 525600 &&
      this.state.timeout.trim() !== '';
    this.setState(() => ({ validTimeout }));

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
      validTaskRef &&
      validResources &&
      validParams &&
      validTimeout &&
      validLabels
    );
  };

  handleClose = () => {
    this.resetForm();
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
    // Reset task and ServiceAccount when namespace changes
    if (text !== this.state.namespace) {
      this.setState({
        ...initialTaskInfoState(),
        namespace: text,
        serviceAccount: ''
      });
    }
  };

  handleKindChange = ({ selectedItem }) => {
    const { text = '' } = selectedItem || {};
    if (text !== this.state.kind) {
      this.setState({
        ...initialTaskInfoState(),
        kind: text,
        serviceAccount: ''
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

  handleTaskChange = ({ selectedItem }) => {
    const { text } = selectedItem || {};
    if (text !== this.state.taskRef) {
      this.setState(state => {
        const taskInfo = parseTaskInfo(
          getStore().getState(),
          text,
          state.kind,
          this.getTaskInfo('namespace')
        );
        return {
          taskRef: text,
          ...taskInfo,
          resources: initialResourcesState(taskInfo.resourceSpecs),
          params: initialParamsState(taskInfo.paramSpecs)
        };
      });
    }
  };

  handleResourceChange = (kind, key, value) => {
    this.setState(state => {
      const next = { ...state };
      next.resources[kind][key] = value;
      return next;
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    // Check form validation
    const valid = this.checkFormValidation();
    this.setState({ validationError: !valid });
    if (!valid) {
      return;
    }

    // Send API request to create TaskRun
    const taskRef = this.getTaskInfo('taskRef');
    const namespace = this.getTaskInfo('namespace');
    const {
      params,
      resources,
      serviceAccount,
      timeout,
      labels,
      kind
    } = this.state;
    const timeoutInMins = `${timeout}m`;
    createTaskRun({
      namespace,
      kind,
      taskName: taskRef,
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
        this.resetForm();
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

  initialState = props => {
    const { namespace, kind } = props;
    return {
      ...initialTaskInfoState(),
      params: initialParamsState(
        this.getTaskInfo('paramSpecs', { state: {}, props })
      ),
      resources: initialResourcesState(
        this.getTaskInfo('resourceSpecs', { state: {}, props })
      ),
      namespace: namespace !== ALL_NAMESPACES ? namespace : '',
      serviceAccount: '',
      timeout: '60',
      validationError: false,
      submitError: '',
      validTimeout: true,
      labels: [],
      invalidLabels: {},
      kind
    };
  };

  resetForm = () => {
    this.setState((state, props) => this.initialState(props));
  };

  resetParamsState = () => {
    this.setState(() => ({
      params: initialParamsState(this.getTaskInfo('paramSpecs'))
    }));
  };

  resetResourcesState = () => {
    this.setState(() => ({
      resources: initialResourcesState(this.getTaskInfo('resourceSpecs'))
    }));
  };

  render() {
    const { open, intl } = this.props;
    const {
      serviceAccount,
      validationError,
      validTimeout,
      labels,
      invalidLabels
    } = this.state;
    const namespace = this.getTaskInfo('namespace');
    const taskRef = this.getTaskInfo('taskRef');
    const taskInfoDisabled = this.getTaskInfo('disabled');
    const resourceSpecs = this.getTaskInfo('resourceSpecs');
    const paramSpecs = this.getTaskInfo('paramSpecs');
    return (
      <Form>
        <Modal
          className="create-taskrun"
          open={open}
          modalHeading={intl.formatMessage({
            id: 'dashboard.createTaskRun.heading',
            defaultMessage: 'Create TaskRun'
          })}
          modalLabel={this.getTaskInfo('taskRef')}
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
          {this.getTaskInfo('taskError') && (
            <InlineNotification
              kind="error"
              title={intl.formatMessage({
                id: 'dashboard.createTaskRun.errorLoading',
                defaultMessage: 'Error retrieving Task information'
              })}
              lowContrast
            />
          )}
          {validationError && (
            <InlineNotification
              kind="error"
              title={intl.formatMessage({
                id: 'dashboard.createTaskRun.validationError',
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
                id: 'dashboard.createTaskRun.createError',
                defaultMessage: 'Error creating TaskRun'
              })}
              subtitle={this.state.submitError}
              onCloseButtonClick={() => this.setState({ submitError: '' })}
              lowContrast
            />
          )}
          {!taskInfoDisabled && (
            <FormGroup legendText="">
              <Dropdown
                id="create-taskrun--kind-dropdown"
                titleText="Kind"
                label=""
                initialSelectedItem={{ id: 'task', text: 'Task' }}
                items={[
                  { id: 'task', text: 'Task' },
                  { id: 'clustertask', text: 'ClusterTask' }
                ]}
                itemToString={itemToString}
                onChange={this.handleKindChange}
              />
              <NamespacesDropdown
                id="create-taskrun--namespaces-dropdown"
                invalid={validationError && !namespace}
                invalidText={intl.formatMessage({
                  id: 'dashboard.createTaskRun.invalidNamespace',
                  defaultMessage: 'Namespace cannot be empty'
                })}
                selectedItem={
                  namespace ? { id: namespace, text: namespace } : ''
                }
                onChange={this.handleNamespaceChange}
              />
              {this.state.kind === 'Task' && (
                <TasksDropdown
                  id="create-taskrun--tasks-dropdown"
                  namespace={namespace}
                  invalid={validationError && !taskRef}
                  invalidText={intl.formatMessage({
                    id: 'dashboard.createTaskRun.invalidTask',
                    defaultMessage: 'Task cannot be empty'
                  })}
                  selectedItem={taskRef ? { id: taskRef, text: taskRef } : ''}
                  disabled={this.state.namespace === ''}
                  onChange={this.handleTaskChange}
                />
              )}
              {this.state.kind === 'ClusterTask' && (
                <ClusterTasksDropdown
                  id="create-taskrun--clustertasks-dropdown"
                  namespace={namespace}
                  invalid={validationError && !taskRef}
                  invalidText={intl.formatMessage({
                    id: 'dashboard.createTaskRun.invalidTask',
                    defaultMessage: 'Task cannot be empty'
                  })}
                  selectedItem={taskRef ? { id: taskRef, text: taskRef } : ''}
                  onChange={this.handleTaskChange}
                />
              )}
            </FormGroup>
          )}
          <FormGroup legendText="">
            <KeyValueList
              legendText={intl.formatMessage({
                id: 'dashboard.createTaskRun.labels.legendText',
                defaultMessage: 'Labels'
              })}
              invalidText={
                <span
                  dangerouslySetInnerHTML /* eslint-disable-line react/no-danger */={{
                    __html: intl.formatMessage(
                      {
                        id: 'dashboard.createTaskRun.labels.invalidText',
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
          {resourceSpecs?.inputs?.length > 0 && (
            <FormGroup legendText="Input PipelineResources">
              {resourceSpecs.inputs.map(spec => (
                <PipelineResourcesDropdown
                  id={`create-taskrun--pr-dropdown-${spec.name}`}
                  key={`create-taskrun--pr-dropdown-${spec.name}`}
                  titleText={spec.name}
                  helperText={spec.type}
                  type={spec.type}
                  namespace={namespace}
                  invalid={
                    validationError && !this.state.resources.inputs[spec.name]
                  }
                  invalidText={intl.formatMessage({
                    id: 'dashboard.createTaskRun.invalidPipelineResources',
                    defaultMessage: 'PipelineResources cannot be empty'
                  })}
                  selectedItem={(() => {
                    const value = this.state.resources.inputs[spec.name];
                    return value ? { id: value, text: value } : '';
                  })()}
                  onChange={({ selectedItem }) => {
                    const { text } = selectedItem || {};
                    this.handleResourceChange('inputs', spec.name, text);
                  }}
                />
              ))}
            </FormGroup>
          )}
          {resourceSpecs?.outputs?.length > 0 && (
            <FormGroup legendText="Output PipelineResources">
              {resourceSpecs.outputs.map(spec => (
                <PipelineResourcesDropdown
                  id={`create-taskrun--pr-dropdown-${spec.name}`}
                  key={`create-taskrun--pr-dropdown-${spec.name}`}
                  titleText={spec.name}
                  helperText={spec.type}
                  type={spec.type}
                  namespace={namespace}
                  invalid={
                    validationError && !this.state.resources.outputs[spec.name]
                  }
                  invalidText={intl.formatMessage({
                    id: 'dashboard.createTaskRun.invalidPipelineResources',
                    defaultMessage: 'PipelineResources cannot be empty'
                  })}
                  selectedItem={(() => {
                    const value = this.state.resources.outputs[spec.name];
                    return value ? { id: value, text: value } : '';
                  })()}
                  onChange={({ selectedItem }) => {
                    const { text } = selectedItem || {};
                    this.handleResourceChange('outputs', spec.name, text);
                  }}
                />
              ))}
            </FormGroup>
          )}
          {paramSpecs && paramSpecs.length !== 0 && (
            <FormGroup legendText="Params">
              {paramSpecs.map(paramSpec => (
                <TextInput
                  id={`create-taskrun--param-${paramSpec.name}`}
                  key={`create-taskrun--param-${paramSpec.name}`}
                  labelText={paramSpec.name}
                  helperText={paramSpec.description}
                  placeholder={paramSpec.default || paramSpec.name}
                  invalid={
                    validationError && !this.state.params[paramSpec.name]
                  }
                  invalidText={intl.formatMessage({
                    id: 'dashboard.createTaskRun.invalidParams',
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
              id: 'dashboard.createTaskRun.optional.legendText',
              defaultMessage: 'Optional values'
            })}
          >
            <ServiceAccountsDropdown
              id="create-taskrun--sa-dropdown"
              titleText={intl.formatMessage({
                id: 'dashboard.createTaskRun.serviceAccountLabel',
                defaultMessage: 'ServiceAccount (optional)'
              })}
              namespace={namespace}
              selectedItem={
                serviceAccount
                  ? { id: serviceAccount, text: serviceAccount }
                  : ''
              }
              disabled={this.state.namespace === ''}
              onChange={({ selectedItem }) => {
                const { text } = selectedItem || {};
                this.setState({ serviceAccount: text });
              }}
            />
            <TextInput
              id="create-taskrun--timeout"
              labelText={intl.formatMessage({
                id: 'dashboard.createTaskRun.timeoutLabel',
                defaultMessage: 'Timeout'
              })}
              helperText={intl.formatMessage({
                id: 'dashboard.createTaskRun.timeoutHelperText',
                defaultMessage: 'TaskRun timeout in minutes'
              })}
              invalid={validationError && !validTimeout}
              invalidText={intl.formatMessage({
                id: 'dashboard.createTaskRun.invalidTimeout',
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

CreateTaskRun.defaultProps = {
  open: false,
  onClose: () => {},
  onSuccess: () => {}
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { taskRef, namespace, kind } = ownProps;
  return parseTaskInfo(state, taskRef, kind, namespace);
}

export const CreateTaskRunWithIntl = injectIntl(CreateTaskRun);
export default connect(mapStateToProps)(CreateTaskRunWithIntl);
