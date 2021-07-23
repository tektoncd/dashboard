/*
Copyright 2020-2021 The Tekton Authors
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
/* istanbul ignore file */

import React, { useState } from 'react';
import keyBy from 'lodash.keyby';
import {
  Button,
  Dropdown,
  Form,
  FormGroup,
  InlineNotification,
  TextInput
} from 'carbon-components-react';
import {
  ALL_NAMESPACES,
  generateId,
  getTranslateWithId,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
import { KeyValueList } from '@tektoncd/dashboard-components';
import { injectIntl } from 'react-intl';
import {
  ClusterTasksDropdown,
  NamespacesDropdown,
  PipelineResourcesDropdown,
  ServiceAccountsDropdown,
  TasksDropdown
} from '..';
import { createTaskRun, useSelectedNamespace, useTaskByKind } from '../../api';
import { isValidLabel } from '../../utils';

const clusterTaskItem = { id: 'clustertask', text: 'ClusterTask' };
const taskItem = { id: 'task', text: 'Task' };

const initialState = {
  creating: false,
  invalidLabels: {},
  invalidNodeSelector: {},
  kind: 'Task',
  labels: [],
  namespace: '',
  nodeSelector: [],
  params: [],
  paramSpecs: [],
  resources: [],
  resourceSpecs: [],
  serviceAccount: '',
  submitError: '',
  taskRef: '',
  timeout: '60',
  validationError: false,
  validTimeout: true
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

const itemToString = ({ text }) => text;

function CreateTaskRun(props) {
  const { history, intl, location } = props;

  function getTaskDetails() {
    const urlSearchParams = new URLSearchParams(location.search);
    return {
      kind: urlSearchParams.get('kind') || 'Task',
      taskName: urlSearchParams.get('taskName') || ''
    };
  }

  const { selectedNamespace: defaultNamespace } = useSelectedNamespace();
  const {
    kind: initialTaskKind,
    taskName: taskRefFromDetails
  } = getTaskDetails();
  const [
    {
      creating,
      invalidLabels,
      invalidNodeSelector,
      kind,
      labels,
      namespace,
      nodeSelector,
      params,
      resources,
      serviceAccount,
      submitError,
      taskRef,
      timeout,
      validationError,
      validTimeout
    },
    setState
  ] = useState({
    ...initialState,
    kind: initialTaskKind || 'Task',
    namespace: defaultNamespace !== ALL_NAMESPACES ? defaultNamespace : '',
    taskRef: taskRefFromDetails,
    params: initialParamsState(null),
    resources: initialResourcesState(null)
  });

  const { data: task, error: taskError } = useTaskByKind(
    { kind, name: taskRef, namespace },
    { enabled: !!taskRef }
  );

  const paramSpecs = task?.spec?.params;
  const resourceSpecs = task?.spec?.resources;

  useTitleSync({
    page: intl.formatMessage({
      id: 'dashboard.createTaskRun.title',
      defaultMessage: 'Create TaskRun'
    })
  });

  function checkFormValidation() {
    // Namespace, PipelineRef, Resources, and Params must all have values
    const validNamespace = !!namespace;
    const validTaskRef = !!taskRef;
    const validInputResources =
      !resources ||
      !resources.inputs ||
      Object.keys(resources.inputs).reduce(
        (acc, name) => acc && !!resources.inputs[name],
        true
      );
    const validOutputResources =
      !resources ||
      !resources.outputs ||
      Object.keys(resources.outputs).reduce(
        (acc, name) => acc && !!resources.outputs[name],
        true
      );

    const paramSpecMap = keyBy(paramSpecs, 'name');
    const validParams =
      !params ||
      Object.keys(params).reduce(
        (acc, name) =>
          acc &&
          (!!params[name] ||
            typeof paramSpecMap[name]?.default !== 'undefined'),
        true
      );

    // Timeout is a number and less than 1 year in minutes
    const isValidTimeout =
      !Number.isNaN(timeout) && timeout < 525600 && timeout.trim() !== '';
    setState(state => ({
      ...state,
      validTimeout: isValidTimeout
    }));

    // Labels
    let validLabels = true;
    labels.forEach(label => {
      ['key', 'value'].forEach(type => {
        if (!isValidLabel(type, label[type])) {
          validLabels = false;
          setState(prevState => ({
            ...prevState,
            invalidLabels: {
              ...prevState.invalidLabels,
              [`${label.id}-${type}`]: true
            }
          }));
        }
      });
    });

    // Node selector
    let validNodeSelector = true;
    nodeSelector.forEach(label => {
      ['key', 'value'].forEach(type => {
        if (!isValidLabel(type, label[type])) {
          validNodeSelector = false;
          setState(prevState => ({
            ...prevState,
            invalidNodeSelector: {
              ...prevState.invalidNodeSelector,
              [`${label.id}-${type}`]: true
            }
          }));
        }
      });
    });

    return (
      validNamespace &&
      validTaskRef &&
      validInputResources &&
      validOutputResources &&
      validParams &&
      isValidTimeout &&
      validLabels &&
      validNodeSelector
    );
  }

  function handleClose() {
    const { kind: taskKind, taskName } = getTaskDetails();
    let url = urls.taskRuns.all();
    if (taskName && defaultNamespace !== ALL_NAMESPACES) {
      url = urls.taskRuns[
        taskKind === 'ClusterTask' ? 'byClusterTask' : 'byTask'
      ]({
        namespace: defaultNamespace,
        taskName
      });
    } else if (defaultNamespace !== ALL_NAMESPACES) {
      url = urls.taskRuns.byNamespace({ namespace: defaultNamespace });
    }
    history.push(url);
  }

  function handleAddLabel(prop) {
    setState(prevState => ({
      ...prevState,
      [prop]: [
        ...prevState[prop],
        {
          id: generateId(`label${prevState[prop].length}-`),
          key: '',
          keyPlaceholder: 'key',
          value: '',
          valuePlaceholder: 'value'
        }
      ]
    }));
  }

  function handleRemoveLabel(prop, invalidProp, index) {
    setState(prevState => {
      const newLabels = [...prevState[prop]];
      const newInvalidLabels = { ...prevState[invalidProp] };
      const removedLabel = newLabels[index];
      newLabels.splice(index, 1);
      if (removedLabel.id in newInvalidLabels) {
        delete newInvalidLabels[`${removedLabel.id}-key`];
        delete newInvalidLabels[`${removedLabel.id}-value`];
      }
      return {
        ...prevState,
        [prop]: newLabels,
        [invalidProp]: newInvalidLabels
      };
    });
  }

  function handleChangeLabel(prop, invalidProp, { type, index, value }) {
    setState(prevState => {
      const newLabels = [...prevState[prop]];
      newLabels[index][type] = value;
      const newInvalidLabels = { ...prevState[invalidProp] };
      if (!isValidLabel(type, value)) {
        newInvalidLabels[`${newLabels[index].id}-${type}`] = true;
      } else {
        delete newInvalidLabels[`${newLabels[index].id}-${type}`];
      }
      return {
        ...prevState,
        [prop]: newLabels,
        [invalidProp]: newInvalidLabels
      };
    });
  }

  function handleNamespaceChange({ selectedItem }) {
    const { text = '' } = selectedItem || {};
    if (text !== namespace) {
      setState(state => ({
        ...state,
        ...initialState,
        kind: state.kind,
        namespace: text
      }));
    }
  }

  function handleKindChange({ selectedItem }) {
    const { text = '' } = selectedItem || {};
    if (text !== kind) {
      setState(state => ({
        ...state,
        ...initialState,
        kind: text
      }));
    }
  }

  function handleParamChange(key, value) {
    setState(state => ({
      ...state,
      params: {
        ...state.params,
        [key]: value
      }
    }));
  }

  function handleTaskChange({ selectedItem }) {
    const { text } = selectedItem || {};
    if (text && text !== taskRef) {
      setState(state => {
        return {
          ...state,
          taskRef: text,
          resources: initialResourcesState(resourceSpecs),
          params: initialParamsState(paramSpecs)
        };
      });
      return;
    }
    // Reset pipelineresources and params when no Task is selected
    setState(state => ({
      ...state,
      ...initialState,
      namespace: state.namespace
    }));
  }

  function handleResourceChange(resourceKind, key, value) {
    setState(state => {
      const next = { ...state };
      next.resources[resourceKind][key] = value;
      return next;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    // Check form validation
    const valid = checkFormValidation();
    setState(state => ({ ...state, validationError: !valid }));
    if (!valid) {
      return;
    }

    setState(state => ({ ...state, creating: true }));

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
      }, {}),
      nodeSelector: nodeSelector.length
        ? nodeSelector.reduce((acc, { key, value }) => {
            acc[key] = value;
            return acc;
          }, {})
        : null
    })
      .then(() => {
        history.push(urls.taskRuns.byNamespace({ namespace }));
      })
      .catch(error => {
        error.response.text().then(text => {
          const statusCode = error.response.status;
          let errorMessage = `error code ${statusCode}`;
          if (text) {
            errorMessage = `${text} (error code ${statusCode})`;
          }
          setState(state => ({
            ...state,
            creating: false,
            submitError: errorMessage
          }));
        });
      });
  }

  return (
    <div className="tkn--create">
      <div className="tkn--create--heading">
        <h1 id="main-content-header">
          {intl.formatMessage({
            id: 'dashboard.createTaskRun.title',
            defaultMessage: 'Create TaskRun'
          })}
        </h1>
        <Button
          iconDescription={intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
          })}
          kind="secondary"
          onClick={handleClose}
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
          onClick={handleSubmit}
          disabled={creating}
        >
          {intl.formatMessage({
            id: 'dashboard.actions.createButton',
            defaultMessage: 'Create'
          })}
        </Button>
      </div>
      <Form>
        {taskError && (
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
              id: 'dashboard.createRun.validationError',
              defaultMessage: 'Please fix the fields with errors, then resubmit'
            })}
            lowContrast
          />
        )}
        {submitError !== '' && (
          <InlineNotification
            kind="error"
            title={intl.formatMessage({
              id: 'dashboard.createTaskRun.createError',
              defaultMessage: 'Error creating TaskRun'
            })}
            subtitle={submitError}
            onCloseButtonClick={() =>
              setState(state => ({ ...state, submitError: '' }))
            }
            lowContrast
          />
        )}
        <FormGroup legendText="">
          <Dropdown
            id="create-taskrun--kind-dropdown"
            titleText="Kind"
            label=""
            initialSelectedItem={
              kind === 'ClusterTask' ? clusterTaskItem : taskItem
            }
            items={[taskItem, clusterTaskItem]}
            itemToString={itemToString}
            onChange={handleKindChange}
            translateWithId={getTranslateWithId(intl)}
          />
          <NamespacesDropdown
            id="create-taskrun--namespaces-dropdown"
            invalid={validationError && !namespace}
            invalidText={intl.formatMessage({
              id: 'dashboard.createRun.invalidNamespace',
              defaultMessage: 'Namespace cannot be empty'
            })}
            selectedItem={namespace ? { id: namespace, text: namespace } : ''}
            onChange={handleNamespaceChange}
          />
          {kind === 'Task' && (
            <TasksDropdown
              id="create-taskrun--tasks-dropdown"
              namespace={namespace}
              invalid={validationError && !taskRef}
              invalidText={intl.formatMessage({
                id: 'dashboard.createTaskRun.invalidTask',
                defaultMessage: 'Task cannot be empty'
              })}
              selectedItem={taskRef ? { id: taskRef, text: taskRef } : ''}
              disabled={namespace === ''}
              onChange={handleTaskChange}
            />
          )}
          {kind === 'ClusterTask' && (
            <ClusterTasksDropdown
              id="create-taskrun--clustertasks-dropdown"
              namespace={namespace}
              invalid={validationError && !taskRef}
              invalidText={intl.formatMessage({
                id: 'dashboard.createTaskRun.invalidTask',
                defaultMessage: 'Task cannot be empty'
              })}
              selectedItem={taskRef ? { id: taskRef, text: taskRef } : ''}
              onChange={handleTaskChange}
            />
          )}
        </FormGroup>
        <FormGroup legendText="">
          <KeyValueList
            legendText={intl.formatMessage({
              id: 'dashboard.createRun.labels.legendText',
              defaultMessage: 'Labels'
            })}
            invalidText={
              <span
                dangerouslySetInnerHTML /* eslint-disable-line react/no-danger */={{
                  __html: intl.formatMessage(
                    {
                      id: 'dashboard.createRun.label.invalidText',
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
            onChange={label =>
              handleChangeLabel('labels', 'invalidLabels', label)
            }
            onRemove={index =>
              handleRemoveLabel('labels', 'invalidLabels', index)
            }
            onAdd={() => handleAddLabel('labels')}
          />
        </FormGroup>
        <FormGroup legendText="">
          <KeyValueList
            legendText={intl.formatMessage({
              id: 'dashboard.createRun.nodeSelector.legendText',
              defaultMessage: 'Node selector'
            })}
            invalidText={
              <span
                dangerouslySetInnerHTML /* eslint-disable-line react/no-danger */={{
                  __html: intl.formatMessage(
                    {
                      id: 'dashboard.createRun.label.invalidText',
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
            keyValues={nodeSelector}
            minKeyValues={0}
            invalidFields={invalidNodeSelector}
            onChange={label =>
              handleChangeLabel('nodeSelector', 'invalidNodeSelector', label)
            }
            onRemove={index =>
              handleRemoveLabel('nodeSelector', 'invalidNodeSelector', index)
            }
            onAdd={() => handleAddLabel('nodeSelector')}
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
                invalid={validationError && !resources.inputs[spec.name]}
                invalidText={intl.formatMessage({
                  id: 'dashboard.createRun.invalidPipelineResources',
                  defaultMessage: 'PipelineResources cannot be empty'
                })}
                selectedItem={(() => {
                  let value = '';
                  if (resources.inputs !== undefined) {
                    value = resources.inputs[spec.name];
                  }
                  return value ? { id: value, text: value } : '';
                })()}
                onChange={({ selectedItem }) => {
                  const { text } = selectedItem || {};
                  handleResourceChange('inputs', spec.name, text);
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
                invalid={validationError && !resources.outputs[spec.name]}
                invalidText={intl.formatMessage({
                  id: 'dashboard.createRun.invalidPipelineResources',
                  defaultMessage: 'PipelineResources cannot be empty'
                })}
                selectedItem={(() => {
                  let value = '';
                  if (resources.outputs !== undefined) {
                    value = resources.outputs[spec.name];
                  }
                  return value ? { id: value, text: value } : '';
                })()}
                onChange={({ selectedItem }) => {
                  const { text } = selectedItem || {};
                  handleResourceChange('outputs', spec.name, text);
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
                  validationError &&
                  !params[paramSpec.name] &&
                  paramSpec.default !== ''
                }
                invalidText={intl.formatMessage({
                  id: 'dashboard.createRun.invalidParams',
                  defaultMessage: 'Params cannot be empty'
                })}
                value={params[paramSpec.name] || ''}
                onChange={({ target: { value } }) =>
                  handleParamChange(paramSpec.name, value)
                }
              />
            ))}
          </FormGroup>
        )}
        <FormGroup
          legendText={intl.formatMessage({
            id: 'dashboard.createRun.optional.legendText',
            defaultMessage: 'Optional values'
          })}
        >
          <ServiceAccountsDropdown
            id="create-taskrun--sa-dropdown"
            titleText={intl.formatMessage({
              id: 'dashboard.serviceAccountLabel.optional',
              defaultMessage: 'ServiceAccount (optional)'
            })}
            helperText={intl.formatMessage({
              id: 'dashboard.createTaskRun.serviceAccountHelperText',
              defaultMessage:
                'Ensure the selected ServiceAccount (or the default if none selected) has permissions for creating TaskRuns and for anything else your TaskRun interacts with.'
            })}
            namespace={namespace}
            selectedItem={
              serviceAccount ? { id: serviceAccount, text: serviceAccount } : ''
            }
            disabled={namespace === ''}
            onChange={({ selectedItem }) => {
              const { text } = selectedItem || {};
              setState(state => ({ ...state, serviceAccount: text }));
            }}
          />
          <TextInput
            id="create-taskrun--timeout"
            labelText={intl.formatMessage({
              id: 'dashboard.createRun.timeoutLabel',
              defaultMessage: 'Timeout'
            })}
            helperText={intl.formatMessage({
              id: 'dashboard.createTaskRun.timeoutHelperText',
              defaultMessage: 'TaskRun timeout in minutes'
            })}
            invalid={validationError && !validTimeout}
            invalidText={intl.formatMessage({
              id: 'dashboard.createRun.invalidTimeout',
              defaultMessage: 'Timeout must be a valid number less than 525600'
            })}
            placeholder="60"
            value={timeout}
            onChange={({ target: { value } }) =>
              setState(state => ({ ...state, timeout: value }))
            }
          />
        </FormGroup>
      </Form>
    </div>
  );
}

export default injectIntl(CreateTaskRun);
