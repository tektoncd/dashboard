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

import React, { useState } from 'react';
import { injectIntl } from 'react-intl';
import { Button, InlineNotification } from 'carbon-components-react';
import {
  ALL_NAMESPACES,
  getErrorMessage,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';

import GitResourceFields from './GitResourceFields';
import UniversalFields from './UniversalFields';
import { createPipelineResource, useSelectedNamespace } from '../../api';

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

export /* istanbul ignore next */ function CreatePipelineResource(props) {
  const { history, intl } = props;

  const { selectedNamespace: defaultNamespace } = useSelectedNamespace();
  const [creating, setCreating] = useState(false);
  const [gitSource, setGitSource] = useState(true);
  const [invalidFields, setInvalidFields] = useState({});
  const [name, setName] = useState('');
  const [namespace, setNamespace] = useState(
    defaultNamespace === ALL_NAMESPACES ? '' : defaultNamespace
  );
  const [revision, setRevision] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [type, setType] = useState('Git');
  const [url, setURL] = useState('');

  useTitleSync({
    page: intl.formatMessage({
      id: 'dashboard.createPipelineResource.title',
      defaultMessage: 'Create PipelineResource'
    })
  });

  function handleClose() {
    history.push(urls.pipelineResources.all());
  }

  function resetError() {
    setSubmitError('');
  }

  function handleSubmit() {
    const newInvalidFields = {};
    let resource;

    setCreating(true);

    if (type === 'Git') {
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
      newInvalidFields.namespace = true;
    } else {
      resource.metadata.namespace = namespace;
    }

    if (validateInputs(name, 'name')) {
      resource.metadata.name = name.trim();
    } else {
      newInvalidFields.name = true;
    }

    if (validateInputs(url, 'url')) {
      resource.spec.params[0].value = url.trim();
    } else {
      newInvalidFields.url = true;
    }

    resource.spec.type = type.toLowerCase();

    if (type === 'Git') {
      if (validateInputs(revision, 'revision')) {
        resource.spec.params[1].value = revision;
      } else {
        newInvalidFields.revision = true;
      }
    }

    if (Object.keys(newInvalidFields).length) {
      setCreating(false);
      setInvalidFields(newInvalidFields);
      return;
    }

    createPipelineResource({ namespace, resource })
      .then(() => {
        history.push(urls.pipelineResources.byNamespace({ namespace }));
      })
      .catch(error => {
        error.response.text().then(text => {
          const statusCode = error.response.status;
          let errorMessage = `error code ${statusCode}`;
          if (text) {
            errorMessage = `${text} (error code ${statusCode})`;
          }
          setCreating(false);
          setSubmitError(errorMessage);
        });
      });
  }

  function handleChangeTextInput(e) {
    const updaters = {
      name: setName,
      revision: setRevision,
      url: setURL
    };

    const stateVar = e.target.id;
    const stateValue = e.target.value;
    const newInvalidFields = { ...invalidFields };
    if (validateInputs(stateValue, stateVar)) {
      delete newInvalidFields[stateVar];
    } else {
      newInvalidFields[stateVar] = true;
    }
    updaters[stateVar](stateValue);
    setInvalidFields(newInvalidFields);
  }

  function handleChangeNamespace({ selectedItem }) {
    const stateVar = 'namespace';
    const { text: stateValue = '' } = selectedItem || {};
    const newInvalidFields = { ...invalidFields };
    if (validateInputs(stateValue, stateVar)) {
      delete newInvalidFields[stateVar];
    } else {
      newInvalidFields[stateVar] = true;
    }
    setNamespace(stateValue);
    setInvalidFields(newInvalidFields);
  }

  function handleChangeType(e) {
    const stateVar = 'type';
    const stateValue = e.selectedItem.text;
    const newInvalidFields = { ...invalidFields };
    if (validateInputs(stateValue, stateVar)) {
      delete newInvalidFields[stateVar];
    } else {
      newInvalidFields[stateVar] = true;
    }
    setType(stateValue);
    setInvalidFields(newInvalidFields);
    setGitSource(stateValue === 'Git');
  }

  return (
    <div className="tkn--create">
      <div className="tkn--create--heading">
        <h1 id="main-content-header">
          {intl.formatMessage({
            id: 'dashboard.createPipelineResource.title',
            defaultMessage: 'Create PipelineResource'
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

      <form>
        {submitError && (
          <InlineNotification
            kind="error"
            title={intl.formatMessage({
              id: 'dashboard.error.title',
              defaultMessage: 'Error:'
            })}
            subtitle={getErrorMessage(submitError)}
            iconDescription={intl.formatMessage({
              id: 'dashboard.notification.clear',
              defaultMessage: 'Clear notification'
            })}
            onCloseButtonClick={resetError}
            lowContrast
          />
        )}
        <UniversalFields
          name={name}
          selectedNamespace={namespace}
          type={type}
          handleChangeTextInput={handleChangeTextInput}
          handleChangeType={handleChangeType}
          handleChangeNamespace={handleChangeNamespace}
          url={url}
          invalidFields={invalidFields}
        />
        {gitSource && (
          <GitResourceFields
            revision={revision}
            handleChangeTextInput={handleChangeTextInput}
            invalidFields={invalidFields}
          />
        )}
      </form>
    </div>
  );
}

export default injectIntl(CreatePipelineResource);
