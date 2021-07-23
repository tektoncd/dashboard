/*
Copyright 2019-2021 The Tekton Authors
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
  Form,
  FormGroup,
  InlineNotification,
  TextInput,
  Toggle
} from 'carbon-components-react';
import {
  ALL_NAMESPACES,
  generateId,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
import { KeyValueList } from '@tektoncd/dashboard-components';
import { injectIntl } from 'react-intl';
import {
  NamespacesDropdown,
  PipelineResourcesDropdown,
  PipelinesDropdown,
  ServiceAccountsDropdown
} from '..';
import {
  createPipelineRun,
  usePipeline,
  useSelectedNamespace
} from '../../api';
import { isValidLabel } from '../../utils';

const initialState = {
  creating: false,
  invalidLabels: {},
  invalidNodeSelector: {},
  labels: [],
  namespace: '',
  nodeSelector: [],
  params: [],
  paramSpecs: [],
  pendingPipelineStatus: '',
  pipelineError: false,
  pipelineRef: '',
  resources: [],
  resourceSpecs: [],
  serviceAccount: '',
  submitError: '',
  timeout: '60',
  validationError: false,
  validTimeout: true
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

function CreatePipelineRun(props) {
  const { history, intl, location } = props;

  function getPipelineName() {
    const urlSearchParams = new URLSearchParams(location.search);
    return urlSearchParams.get('pipelineName') || '';
  }

  const { selectedNamespace: defaultNamespace } = useSelectedNamespace();
  const [
    {
      creating,
      invalidLabels,
      invalidNodeSelector,
      labels,
      namespace,
      nodeSelector,
      params,
      pipelinePendingStatus,
      pipelineRef,
      resources,
      serviceAccount,
      submitError,
      timeout,
      validationError,
      validTimeout
    },
    setState
  ] = useState({
    ...initialState,
    namespace: defaultNamespace !== ALL_NAMESPACES ? defaultNamespace : '',
    pipelineRef: getPipelineName() || '',
    params: initialParamsState(null),
    resources: initialResourcesState(null)
  });

  const { data: pipeline, error: pipelineError } = usePipeline(
    { name: pipelineRef, namespace },
    { enabled: !!pipelineRef }
  );

  let paramSpecs;
  let resourceSpecs;
  if (pipeline?.spec) {
    ({ resources: resourceSpecs, params: paramSpecs } = pipeline.spec);
  }

  useTitleSync({
    page: intl.formatMessage({
      id: 'dashboard.createPipelineRun.title',
      defaultMessage: 'Create PipelineRun'
    })
  });

  const checked = isPending => {
    setState(state => ({
      ...state,
      pipelinePendingStatus: isPending ? 'PipelineRunPending' : ''
    }));
  };
  function checkFormValidation() {
    // Namespace, PipelineRef, Resources, and Params must all have values
    const validNamespace = !!namespace;
    const validPipelineRef = !!pipelineRef;
    const validResources =
      !resources ||
      Object.keys(resources).reduce(
        (acc, name) => acc && !!resources[name],
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
    const timeoutTest =
      !Number.isNaN(timeout) && timeout < 525600 && timeout.trim() !== '';
    if (!timeoutTest) {
      setState(state => ({ ...state, validTimeout: false }));
    } else {
      setState(state => ({ ...state, validTimeout: true }));
    }

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
      validPipelineRef &&
      validResources &&
      validParams &&
      timeoutTest &&
      validLabels &&
      validNodeSelector
    );
  }

  function isDisabled() {
    if (namespace === '') {
      return true;
    }
    return false;
  }

  function resetError() {
    setState(state => ({ ...state, submitError: '' }));
  }

  function handleClose() {
    const pipelineName = getPipelineName();
    let url = urls.pipelineRuns.all();
    if (pipelineName && defaultNamespace !== ALL_NAMESPACES) {
      url = urls.pipelineRuns.byPipeline({
        namespace: defaultNamespace,
        pipelineName
      });
    } else if (defaultNamespace !== ALL_NAMESPACES) {
      url = urls.pipelineRuns.byNamespace({ namespace: defaultNamespace });
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
    // Reset pipeline and ServiceAccount when namespace changes
    if (text !== namespace) {
      setState(state => ({
        ...state,
        ...initialState,
        namespace: text
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

  function handlePipelineChange({ selectedItem }) {
    const { text } = selectedItem || {};
    if (text && text !== pipelineRef) {
      setState(state => {
        return {
          ...state,
          pipelineRef: text,
          resources: initialResourcesState(resourceSpecs),
          params: initialParamsState(paramSpecs)
        };
      });
      return;
    }
    // Reset pipelineresources and params when no Pipeline is selected
    setState(state => ({
      ...state,
      ...initialState,
      namespace: state.namespace
    }));
  }

  function handleResourceChange(key, value) {
    setState(state => ({
      ...state,
      resources: {
        ...state.resources,
        [key]: value
      }
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    // Check form validation
    const valid = checkFormValidation();
    setState(state => ({
      ...state,
      validationError: !valid
    }));
    if (!valid) {
      return;
    }

    setState(state => ({ ...state, creating: true }));

    const timeoutInMins = `${timeout}m`;
    createPipelineRun({
      namespace,
      pipelineName: pipelineRef,
      resources,
      params,
      pipelinePendingStatus,
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
        history.push(urls.pipelineRuns.byNamespace({ namespace }));
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
            id: 'dashboard.createPipelineRun.title',
            defaultMessage: 'Create PipelineRun'
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
        {pipelineError && (
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
              id: 'dashboard.createPipelineRun.createError',
              defaultMessage: 'Error creating PipelineRun'
            })}
            subtitle={submitError}
            onCloseButtonClick={resetError}
            lowContrast
          />
        )}
        <FormGroup legendText="">
          <NamespacesDropdown
            id="create-pipelinerun--namespaces-dropdown"
            invalid={validationError && !namespace}
            invalidText={intl.formatMessage({
              id: 'dashboard.createRun.invalidNamespace',
              defaultMessage: 'Namespace cannot be empty'
            })}
            selectedItem={namespace ? { id: namespace, text: namespace } : ''}
            onChange={handleNamespaceChange}
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
            disabled={isDisabled()}
            onChange={handlePipelineChange}
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
                invalid={validationError && !resources[resourceSpec.name]}
                invalidText={intl.formatMessage({
                  id: 'dashboard.createRun.invalidPipelineResources',
                  defaultMessage: 'PipelineResources cannot be empty'
                })}
                selectedItem={(() => {
                  const value = resources[resourceSpec.name];
                  return value ? { id: value, text: value } : '';
                })()}
                onChange={({ selectedItem }) => {
                  const { text } = selectedItem || {};
                  handleResourceChange(resourceSpec.name, text);
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
            id="create-pipelinerun--sa-dropdown"
            titleText={intl.formatMessage({
              id: 'dashboard.serviceAccountLabel.optional',
              defaultMessage: 'ServiceAccount (optional)'
            })}
            helperText={intl.formatMessage({
              id: 'dashboard.createPipelineRun.serviceAccountHelperText',
              defaultMessage:
                'Ensure the selected ServiceAccount (or the default if none selected) has permissions for creating PipelineRuns and for anything else your PipelineRun interacts with.'
            })}
            namespace={namespace}
            selectedItem={
              serviceAccount ? { id: serviceAccount, text: serviceAccount } : ''
            }
            disabled={isDisabled()}
            onChange={({ selectedItem }) => {
              const { text } = selectedItem || {};
              setState(state => ({ ...state, serviceAccount: text }));
            }}
          />
          <TextInput
            id="create-pipelinerun--timeout"
            labelText={intl.formatMessage({
              id: 'dashboard.createRun.timeoutLabel',
              defaultMessage: 'Timeout'
            })}
            helperText={intl.formatMessage({
              id: 'dashboard.createPipelineRun.timeoutHelperText',
              defaultMessage: 'PipelineRun timeout in minutes'
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
          <Toggle
            defaultToggled={false}
            id="pending-pipeline-toggle"
            labelText={intl.formatMessage({
              id: 'dashboard.createPipelineRun.status.pending',
              defaultMessage: 'Create PipelineRun in pending state'
            })}
            onToggle={checked}
            labelA={intl.formatMessage({
              id: 'dashboard.createPipelineRun.disabled',
              defaultMessage: 'Disabled'
            })}
            labelB={intl.formatMessage({
              id: 'dashboard.createPipelineRun.enabled',
              defaultMessage: 'Enabled'
            })}
          />
        </FormGroup>
      </Form>
    </div>
  );
}

export default injectIntl(CreatePipelineRun);
