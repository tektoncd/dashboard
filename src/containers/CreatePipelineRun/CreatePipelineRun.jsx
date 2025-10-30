/*
Copyright 2019-2025 The Tekton Authors
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
import yaml from 'yaml';
import {
  Button,
  Form,
  FormGroup,
  InlineNotification,
  TextArea,
  TextInput,
  Toggle
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
import PipelinesDropdown from '../PipelinesDropdown';
import ServiceAccountsDropdown from '../ServiceAccountsDropdown';
import {
  createPipelineRun,
  createPipelineRunRaw,
  generateNewPipelineRunPayload,
  getPipelineRunPayload,
  usePipeline,
  usePipelineRun,
  useSelectedNamespace
} from '../../api';
import { isValidLabel, keyBy } from '../../utils';

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
  pipelinePendingStatus: '',
  pipelineError: false,
  pipelineRef: '',
  pipelineRunName: '',
  serviceAccount: '',
  submitError: '',
  timeoutsFinally: '',
  timeoutsPipeline: '',
  timeoutsTasks: '',
  validationError: false,
  validPipelineRunName: true
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

function CreatePipelineRun() {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedNamespace: defaultNamespace } = useSelectedNamespace();

  function getPipelineName() {
    const urlSearchParams = new URLSearchParams(location.search);
    return urlSearchParams.get('pipelineName') || '';
  }

  function getPipelineRunName() {
    const urlSearchParams = new URLSearchParams(location.search);
    return urlSearchParams.get('pipelineRunName') || '';
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
      pipelineRunName,
      serviceAccount,
      submitError,
      timeoutsFinally,
      timeoutsPipeline,
      timeoutsTasks,
      validationError,
      validPipelineRunName
    },
    setState
  ] = useState({
    ...initialState,
    namespace: getNamespace(),
    pipelineRef: getPipelineName(),
    params: initialParamsState(null)
  });

  const { data: pipeline, error: pipelineError } = usePipeline(
    { name: pipelineRef, namespace },
    { enabled: !!pipelineRef }
  );

  let paramSpecs;
  if (pipeline?.spec) {
    ({ params: paramSpecs } = pipeline.spec);
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

  function switchToYamlMode() {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('mode', 'yaml');
    const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
    navigate(browserURL);
  }

  function checkFormValidation() {
    // Namespace, PipelineRef, and Params must all have values
    const validNamespace = !!namespace;
    const validPipelineRef = !!pipelineRef;
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

    // PipelineRun name
    const pipelineRunNameTest =
      !pipelineRunName ||
      (resourceNameRegex.test(pipelineRunName) && pipelineRunName.length < 64);
    setState(state => ({
      ...state,
      validPipelineRunName: pipelineRunNameTest
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
      validPipelineRef &&
      validParams &&
      validLabels &&
      validNodeSelector &&
      pipelineRunNameTest
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
    if (pipelineName && namespace && namespace !== ALL_NAMESPACES) {
      url = urls.pipelineRuns.byPipeline({
        namespace,
        pipelineName
      });
    } else if (namespace && namespace !== ALL_NAMESPACES) {
      url = urls.pipelineRuns.byNamespace({ namespace });
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
    let url = urls.pipelineRuns.all();
    if (defaultNamespace && defaultNamespace !== ALL_NAMESPACES) {
      url = urls.pipelineRuns.byNamespace({ namespace: defaultNamespace });
    }
    navigate(url);
  }

  function handleCreate({ resource }) {
    const resourceNamespace = resource?.metadata?.namespace;
    return createPipelineRunRaw({
      namespace: resourceNamespace,
      payload: resource
    }).then(() => {
      navigate(urls.pipelineRuns.byNamespace({ namespace: resourceNamespace }));
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

      const queryParams = new URLSearchParams(location.search);
      if (text) {
        queryParams.set('namespace', text);
      } else {
        queryParams.delete('namespace');
      }
      queryParams.delete('pipelineName');
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

  function handlePipelineChange({ selectedItem }) {
    const { text } = selectedItem || {};

    const queryParams = new URLSearchParams(location.search);
    if (text) {
      queryParams.set('pipelineName', text);
    } else {
      queryParams.delete('pipelineName');
    }
    const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
    navigate(browserURL);

    if (text && text !== pipelineRef) {
      setState(state => {
        return {
          ...state,
          pipelineRef: text,
          params: initialParamsState(paramSpecs)
        };
      });
      return;
    }
    // Reset params when no Pipeline is selected
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
    setState(state => ({
      ...state,
      validationError: !valid
    }));
    if (!valid) {
      return;
    }

    setState(state => ({ ...state, creating: true }));

    createPipelineRun({
      namespace,
      pipelineName: pipelineRef,
      pipelineRunName: pipelineRunName || undefined,
      params,
      pipelinePendingStatus,
      serviceAccount,
      timeoutsFinally,
      timeoutsPipeline,
      timeoutsTasks,
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
        navigate(urls.pipelineRuns.byNamespace({ namespace }));
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
    const externalPipelineRunName = getPipelineRunName();
    if (externalPipelineRunName) {
      const { data: pipelineRunObject, isPending } = usePipelineRun(
        {
          name: externalPipelineRunName,
          namespace: getNamespace()
        },
        { disableWebSocket: true }
      );
      let payloadYaml = null;
      if (pipelineRunObject) {
        const { payload } = generateNewPipelineRunPayload({
          pipelineRun: pipelineRunObject,
          rerun: false
        });
        payloadYaml = yaml.stringify(payload, { singleQuote: true });
      }
      const loadingMessage = intl.formatMessage(
        {
          id: 'dashboard.loading.resource',
          defaultMessage: 'Loading {kind}…'
        },
        { kind: 'PipelineRun' }
      );

      return (
        <Suspense fallback={<Loading />}>
          <YAMLEditor
            code={payloadYaml || ''}
            handleClose={handleCloseYAMLEditor}
            handleCreate={handleCreate}
            kind="PipelineRun"
            loading={isPending}
            loadingMessage={loadingMessage}
          />
        </Suspense>
      );
    }
    const pipelineRun = getPipelineRunPayload({
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
      pipelineName: pipelineRef,
      pipelineRunName: pipelineRunName || undefined,
      params,
      pipelinePendingStatus,
      serviceAccount,
      timeoutsFinally,
      timeoutsPipeline,
      timeoutsTasks
    });

    return (
      <Suspense fallback={<Loading />}>
        <YAMLEditor
          code={yaml.stringify(pipelineRun, { singleQuote: true })}
          handleClose={handleCloseYAMLEditor}
          handleCreate={handleCreate}
          kind="PipelineRun"
        />
      </Suspense>
    );
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
        <div className="tkn--create--yaml-mode">
          <Button
            kind="tertiary"
            id="create-pipelinerun--mode-button"
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
        {paramSpecs && paramSpecs.length !== 0 && (
          <FormGroup legendText="Params">
            {paramSpecs.map(paramSpec => (
              <TextArea
                helperText={paramSpec.description}
                id={`create-pipelinerun--param-${paramSpec.name}`}
                invalid={
                  validationError &&
                  !params[paramSpec.name] &&
                  paramSpec.default !== ''
                }
                invalidText={intl.formatMessage({
                  id: 'dashboard.createRun.invalidParams',
                  defaultMessage: 'Params cannot be empty'
                })}
                key={`create-pipelinerun--param-${paramSpec.name}`}
                labelText={paramSpec.name}
                onChange={({ target: { value } }) =>
                  handleParamChange(paramSpec.name, value)
                }
                placeholder={paramSpec.default || paramSpec.name}
                value={params[paramSpec.name] || ''}
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
            titleText="ServiceAccount"
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
            id="create-pipelinerun--pipelinerunname"
            labelText={intl.formatMessage({
              id: 'dashboard.createRun.pipelineRunNameLabel',
              defaultMessage: 'PipelineRun name'
            })}
            invalid={validationError && !validPipelineRunName}
            invalidText={intl.formatMessage({
              id: 'dashboard.createResource.nameError',
              defaultMessage:
                "Must consist of lower case alphanumeric characters, '-' or '.', start and end with an alphanumeric character, and be at most 63 characters"
            })}
            value={pipelineRunName}
            onChange={({ target: { value } }) =>
              setState(state => ({ ...state, pipelineRunName: value.trim() }))
            }
          />
          <FormGroup
            legendText={intl.formatMessage({
              id: 'dashboard.createRun.optional.timeouts',
              defaultMessage: 'Timeouts'
            })}
          >
            <TextInput
              id="create-pipelinerun--timeouts--pipeline"
              labelText="Pipeline"
              value={timeoutsPipeline}
              onChange={({ target: { value } }) =>
                setState(state => ({ ...state, timeoutsPipeline: value }))
              }
            />
            <TextInput
              id="create-pipelinerun--timeouts--tasks"
              labelText="Tasks"
              value={timeoutsTasks}
              onChange={({ target: { value } }) =>
                setState(state => ({ ...state, timeoutsTasks: value }))
              }
            />
            <TextInput
              id="create-pipelinerun--timeouts--finally"
              labelText="Finally"
              value={timeoutsFinally}
              onChange={({ target: { value } }) =>
                setState(state => ({ ...state, timeoutsFinally: value }))
              }
            />
          </FormGroup>
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

export default CreatePipelineRun;
