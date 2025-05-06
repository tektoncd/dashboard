/*
Copyright 2020-2025 The Tekton Authors
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

import { lazy, Suspense, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import keyBy from 'lodash.keyby';
import yaml from 'js-yaml';
import {
  Button,
  Form,
  FormGroup,
  InlineNotification,
  TextInput
} from '@carbon/react';
import {
  ALL_NAMESPACES,
  generateId,
  resourceNameRegex,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
import { KeyValueList, Loading } from '@tektoncd/dashboard-components';
import { useIntl } from 'react-intl';

import NamespacesDropdown from '../NamespacesDropdown';
import ServiceAccountsDropdown from '../ServiceAccountsDropdown';
import TasksDropdown from '../TasksDropdown';
import {
  createTaskRun,
  createTaskRunRaw,
  generateNewTaskRunPayload,
  getTaskRunPayload,
  useSelectedNamespace,
  useTask,
  useTaskRun
} from '../../api';
import { isValidLabel } from '../../utils';

const YAMLEditor = lazy(() => import('../YAMLEditor'));

const initialState = {
  creating: false,
  invalidLabels: {},
  invalidNodeSelector: {},
  labels: [],
  namespace: '',
  nodeSelector: [],
  params: {},
  paramSpecs: [],
  serviceAccount: '',
  submitError: '',
  taskRef: '',
  taskRunName: '',
  timeout: '',
  validationError: false,
  validTaskRunName: true
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

function CreateTaskRun() {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedNamespace: defaultNamespace } = useSelectedNamespace();

  function getTaskDetails() {
    const urlSearchParams = new URLSearchParams(location.search);
    return {
      taskName: urlSearchParams.get('taskName') || ''
    };
  }

  function getTaskRunName() {
    const urlSearchParams = new URLSearchParams(location.search);
    return urlSearchParams.get('taskRunName') || '';
  }

  function getNamespace() {
    const urlSearchParams = new URLSearchParams(location.search);
    return (
      urlSearchParams.get('namespace') ||
      (defaultNamespace !== ALL_NAMESPACES ? defaultNamespace : '')
    );
  }

  function isYAMLMode() {
    const urlSearchParams = new URLSearchParams(location.search);
    return urlSearchParams.get('mode') === 'yaml';
  }

  const { taskName: taskRefFromDetails } = getTaskDetails();
  const [
    {
      creating,
      invalidLabels,
      invalidNodeSelector,
      labels,
      namespace,
      nodeSelector,
      params,
      serviceAccount,
      submitError,
      taskRef,
      taskRunName,
      timeout,
      validationError,
      validTaskRunName
    },
    setState
  ] = useState({
    ...initialState,
    namespace: getNamespace(),
    taskRef: taskRefFromDetails,
    params: initialParamsState(null)
  });

  const { data: task, error: taskError } = useTask(
    { name: taskRef, namespace },
    { enabled: !!taskRef }
  );

  const paramSpecs = task?.spec?.params;

  useTitleSync({
    page: intl.formatMessage({
      id: 'dashboard.createTaskRun.title',
      defaultMessage: 'Create TaskRun'
    })
  });

  function switchToYamlMode() {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('mode', 'yaml');
    const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
    navigate(browserURL);
  }

  function checkFormValidation() {
    // Namespace, taskRef, and Params must all have values
    const validNamespace = !!namespace;
    const validTaskRef = !!taskRef;

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

    // TaskRun name
    const taskRunNameTest =
      !taskRunName ||
      (resourceNameRegex.test(taskRunName) && taskRunName.length < 64);
    setState(state => ({ ...state, validTaskRunName: taskRunNameTest }));

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
      validParams &&
      validLabels &&
      validNodeSelector &&
      taskRunNameTest
    );
  }

  function handleClose() {
    const { taskName } = getTaskDetails();
    let url = urls.taskRuns.all();
    if (taskName && namespace && namespace !== ALL_NAMESPACES) {
      url = urls.taskRuns.byTask({
        namespace,
        taskName
      });
    } else if (namespace && namespace !== ALL_NAMESPACES) {
      url = urls.taskRuns.byNamespace({ namespace });
    }
    navigate(url);
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

  function handleCloseYAMLEditor() {
    let url = urls.taskRuns.all();
    if (defaultNamespace && defaultNamespace !== ALL_NAMESPACES) {
      url = urls.taskRuns.byNamespace({ namespace: defaultNamespace });
    }
    navigate(url);
  }

  function handleCreate({ resource }) {
    const resourceNamespace = resource?.metadata?.namespace;
    return createTaskRunRaw({
      namespace: resourceNamespace,
      payload: resource
    }).then(() => {
      navigate(urls.taskRuns.byNamespace({ namespace: resourceNamespace }));
    });
  }

  function handleNamespaceChange({ selectedItem }) {
    const { text = '' } = selectedItem || {};
    if (text !== namespace) {
      setState(state => ({
        ...state,
        ...initialState,
        namespace: text
      }));

      const queryParams = new URLSearchParams(location.search);
      if (text) {
        queryParams.set('namespace', text);
      } else {
        queryParams.delete('namespace');
      }
      queryParams.delete('taskName');
      const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
      navigate(browserURL);
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

    const queryParams = new URLSearchParams(location.search);
    if (text) {
      queryParams.set('taskName', text);
    } else {
      queryParams.delete('taskName');
    }
    const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
    navigate(browserURL);

    if (text && text !== taskRef) {
      setState(state => {
        return {
          ...state,
          taskRef: text,
          params: initialParamsState(paramSpecs)
        };
      });
      return;
    }
    // Reset params when no Task is selected
    setState(state => ({
      ...state,
      ...initialState,
      namespace: state.namespace
    }));
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

    createTaskRun({
      labels: labels.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {}),
      namespace,
      nodeSelector: nodeSelector.length
        ? nodeSelector.reduce((acc, { key, value }) => {
            acc[key] = value;
            return acc;
          }, {})
        : null,
      params,
      serviceAccount,
      taskName: taskRef,
      taskRunName: taskRunName || undefined,
      timeout
    })
      .then(() => {
        navigate(urls.taskRuns.byNamespace({ namespace }));
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

  if (isYAMLMode()) {
    const externalTaskRunName = getTaskRunName();
    if (externalTaskRunName) {
      const { data: taskRunObject, isLoading } = useTaskRun(
        {
          name: externalTaskRunName,
          namespace: getNamespace()
        },
        { disableWebSocket: true }
      );
      let payloadYaml = null;
      if (taskRunObject) {
        const { payload } = generateNewTaskRunPayload({
          taskRun: taskRunObject,
          rerun: false
        });
        payloadYaml = yaml.dump(payload);
      }
      const loadingMessage = intl.formatMessage(
        {
          id: 'dashboard.loading.resource',
          defaultMessage: 'Loading {kind}…'
        },
        { kind: 'TaskRun' }
      );

      return (
        <Suspense fallback={<Loading />}>
          <YAMLEditor
            code={payloadYaml || ''}
            handleClose={handleCloseYAMLEditor}
            handleCreate={handleCreate}
            kind="TaskRun"
            loading={isLoading}
            loadingMessage={loadingMessage}
          />
        </Suspense>
      );
    }

    const taskRun = getTaskRunPayload({
      labels: labels.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {}),
      namespace,
      nodeSelector: nodeSelector.length
        ? nodeSelector.reduce((acc, { key, value }) => {
            acc[key] = value;
            return acc;
          }, {})
        : null,
      params,
      serviceAccount,
      taskName: taskRef,
      taskRunName: taskRunName || undefined,
      timeout
    });

    return (
      <Suspense fallback={<Loading />}>
        <YAMLEditor
          code={yaml.dump(taskRun)}
          handleClose={handleCloseYAMLEditor}
          handleCreate={handleCreate}
          kind="TaskRun"
        />
      </Suspense>
    );
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
        <div className="tkn--create--yaml-mode">
          <Button
            kind="tertiary"
            id="create-taskrun--mode-button"
            onClick={switchToYamlMode}
          >
            {intl.formatMessage({
              id: 'dashboard.create.yamlModeButton',
              defaultMessage: 'YAML Mode'
            })}
          </Button>
        </div>
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
            titleText="ServiceAccount"
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
            value={timeout}
            onChange={({ target: { value } }) =>
              setState(state => ({ ...state, timeout: value }))
            }
          />
          <TextInput
            id="create-taskrun--taskrunname"
            labelText={intl.formatMessage({
              id: 'dashboard.createRun.taskRunNameLabel',
              defaultMessage: 'TaskRun name'
            })}
            invalid={validationError && !validTaskRunName}
            invalidText={intl.formatMessage({
              id: 'dashboard.createResource.nameError',
              defaultMessage:
                "Must consist of lower case alphanumeric characters, '-' or '.', start and end with an alphanumeric character, and be at most 63 characters"
            })}
            value={taskRunName}
            onChange={({ target: { value } }) =>
              setState(state => ({ ...state, taskRunName: value.trim() }))
            }
          />
        </FormGroup>

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
      </Form>
    </div>
  );
}

export default CreateTaskRun;
