/*
Copyright 2023 The Tekton Authors
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

import React, { Suspense, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import keyBy from 'lodash.keyby';
import yaml from 'js-yaml';
import {
  ALL_NAMESPACES,
  generateId,
  getTranslateWithId,
  resourceNameRegex,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
import { KeyValueList, Loading } from '@tektoncd/dashboard-components';
import { useIntl } from 'react-intl';
import {
  createCustomRun,
  createCustomRunRaw,
  generateNewCustomRunPayload,
  getCustomRunPayload,
  useSelectedNamespace,
  useTaskByKind,
  useCustomRun
} from '../../api';
import { isValidLabel } from '../../utils';

const YAMLEditor = React.lazy(() => import('../YAMLEditor'));

const initialState = {
  creating: false,
  customRef: '',
  customRunName: '',
  customSpec: '',
  invalidLabels: {},
  kind: 'CustomRun',
  labels: [],
  namespace: '',
  params: {},
  paramSpecs: [],
  retries: '',
  serviceAccountName: '',
  submitError: '',
  timeout: '',
  validationError: false,
  validCustomRunName: true,
  workspaces: ''
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

const itemToString = ({ text }) => text;

function CreateCustomRun() {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedNamespace: defaultNamespace } = useSelectedNamespace();

  function getCustomDetails() {
    const urlSearchParams = new URLSearchParams(location.search);
    return {
      kind: urlSearchParams.get('kind') || 'Custom',
      customName: urlSearchParams.get('customName') || ''
    };
  }

  function getCustomRunName() {
    const urlSearchParams = new URLSearchParams(location.search);
    return urlSearchParams.get('customRunName') || '';
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

  const { kind: initialCustomKind, customName: customRefFromDetails } =
    getCustomDetails();
  const [
    {
      creating,
      customRef,
      customRunName,
      customSpec,
      invalidLabels,
      kind,
      labels,
      namespace,
      params,
      retries,
      serviceAccountName,
      submitError,
      timeout,
      validationError,
      validCustomRunName,
      workspaces
    },
    setState
  ] = useState({
    ...initialState,
    kind: initialCustomKind || 'Custom',
    namespace: getNamespace(),
    customRef: customRefFromDetails,
    params: initialParamsState(null)
  });

  const { data: custom, error: customError } = useTaskByKind(
    { kind, name: customRef, namespace },
    { enabled: !!customRef }
  );

  const paramSpecs = custom?.spec?.params;

  useTitleSync({
    page: intl.formatMessage({
      id: 'dashboard.createCustomRun.title',
      defaultMessage: 'Create CustomRun'
    })
  });

  function switchToYamlMode() {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('mode', 'yaml');
    const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
    navigate(browserURL);
  }

  function checkFormValidation() {
    // Namespace, customRef, and Params must all have values
    const validNamespace = !!namespace;
    const validCustomRef = !!customRef;

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

    // CustomRun name
    const customRunNameTest =
      !customRunName ||
      (resourceNameRegex.test(customRunName) && customRunName.length < 64);
    setState(state => ({ ...state, validCustomRunName: customRunNameTest }));

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

    return (
      validNamespace &&
      validCustomRef &&
      validParams &&
      validLabels &&
      customRunNameTest
    );
  }

  function handleClose() {
    const { kind: customKind, customName } = getCustomDetails();
    let url = urls.customRuns.all();
    if (customName && namespace && namespace !== ALL_NAMESPACES) {
      url = urls.customRuns[
        customKind === 'ClusterTask' ? 'byClusterTask' : 'byTask'
      ]({
        namespace,
        customName
      });
    } else if (namespace && namespace !== ALL_NAMESPACES) {
      url = urls.customRuns.byNamespace({ namespace });
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
    let url = urls.customRuns.all();
    if (defaultNamespace && defaultNamespace !== ALL_NAMESPACES) {
      url = urls.customRuns.byNamespace({ namespace: defaultNamespace });
    }
    navigate(url);
  }

  function handleCreate({ resource }) {
    const resourceNamespace = resource?.metadata?.namespace;
    return createCustomRunRaw({
      namespace: resourceNamespace,
      payload: resource
    }).then(() => {
      navigate(urls.customRuns.byNamespace({ namespace: resourceNamespace }));
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

      const queryParams = new URLSearchParams(location.search);
      if (text) {
        queryParams.set('namespace', text);
      } else {
        queryParams.delete('namespace');
      }
      queryParams.delete('customName');
      const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
      navigate(browserURL);
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

      const queryParams = new URLSearchParams(location.search);
      queryParams.set('kind', text);
      queryParams.delete('namespace');
      queryParams.delete('customName');
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

  function handleCustomChange({ selectedItem }) {
    const { text } = selectedItem || {};

    const queryParams = new URLSearchParams(location.search);
    if (text) {
      queryParams.set('customName', text);
    } else {
      queryParams.delete('customName');
    }
    const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
    navigate(browserURL);

    if (text && text !== customRef) {
      setState(state => {
        return {
          ...state,
          customRef: text,
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

    createCustomRun({
      customName: customRef,
      customRunName: customRunName || undefined,
      kind,
      labels: labels.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {}),
      namespace,
      params,
      retries,
      serviceAccountName,
      timeout,
      workspaces
    })
      .then(() => {
        navigate(urls.customRuns.byNamespace({ namespace }));
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

  const externalCustomRunName = getCustomRunName();
  if (externalCustomRunName) {
    const { data: customRunObject, isLoading } = useCustomRun(
      {
        name: externalCustomRunName,
        namespace: getNamespace()
      },
      { disableWebSocket: true }
    );
    let payloadYaml = null;
    if (customRunObject) {
      const { payload } = generateNewCustomRunPayload({
        customRun: customRunObject,
        rerun: false
      });
      payloadYaml = yaml.dump(payload);
    }
    const loadingMessage = intl.formatMessage(
      {
        id: 'dashboard.loading.resource',
        defaultMessage: 'Loading {kind}…'
      },
      { kind: 'CustomRun' }
    );

    return (
      <Suspense fallback={<Loading />}>
        <YAMLEditor
          code={payloadYaml || ''}
          handleClose={handleCloseYAMLEditor}
          handleCreate={handleCreate}
          kind="CustomRun"
          loading={isLoading}
          loadingMessage={loadingMessage}
        />
      </Suspense>
    );
  }

  const customRun = getCustomRunPayload({
    customName: customRef,
    customRunName: customRunName || undefined,
    kind,
    labels: labels.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {}),
    namespace,
    params,
    retries,
    serviceAccountName,
    timeout,
    workspaces
  });

  return (
    <Suspense fallback={<Loading />}>
      <YAMLEditor
        code={yaml.dump(customRun)}
        handleClose={handleCloseYAMLEditor}
        handleCreate={handleCreate}
        kind="CustomRun"
      />
    </Suspense>
  );
}

export default CreateCustomRun;
