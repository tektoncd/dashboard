/*
Copyright 2022-2025 The Tekton Authors
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
import { useIntl } from 'react-intl';
import { Button, Form, FormGroup, InlineNotification } from '@carbon/react';
import yaml from 'yaml';
import { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { yaml as yamlMode } from '@codemirror/legacy-modes/mode/yaml';
import { Loading } from '@tektoncd/dashboard-components';

export default function YAMLEditor({
  code: initialCode,
  handleClose,
  handleCreate,
  kind,
  loading = false,
  loadingMessage = ''
}) {
  const intl = useIntl();

  const [code, setCode] = useState(initialCode);
  const [isCreating, setIsCreating] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [validationErrorMessage, setValidationErrorMessage] = useState('');

  useEffect(() => {
    if (!loading) {
      setCode(initialCode);
    }
  }, [loading]);

  function validateNamespace(obj) {
    if (!obj?.metadata?.namespace) {
      return {
        valid: false,
        message: intl.formatMessage({
          id: 'dashboard.createRun.invalidNamespace',
          defaultMessage: 'Namespace cannot be empty'
        })
      };
    }
    return null;
  }

  function validateEmptyYAML() {
    if (!code) {
      return {
        valid: false,
        message: intl.formatMessage({
          id: 'dashboard.editor.empty',
          defaultMessage: 'Editor cannot be empty'
        })
      };
    }
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    // Check form validation
    let validationResult = validateEmptyYAML();
    if (validationResult && !validationResult.valid) {
      setValidationErrorMessage(validationResult.message);
      return;
    }

    let resource;
    try {
      resource = yaml.parse(code);
    } catch (e) {
      setValidationErrorMessage(e.message);
      return;
    }

    validationResult = validateNamespace(resource);
    if (validationResult && !validationResult.valid) {
      setValidationErrorMessage(validationResult.message);
      return;
    }

    setIsCreating(true);
    handleCreate({ resource }).catch(error => {
      error.response.text().then(text => {
        const statusCode = error.response.status;
        let errorMessage = `error code ${statusCode}`;
        if (text) {
          errorMessage = `${text} (error code ${statusCode})`;
        }
        setIsCreating(false);
        setSubmitError(errorMessage);
      });
    });
  }

  function onChange(newValue, _viewUpdate) {
    setCode(newValue);
  }

  function resetError() {
    setSubmitError('');
  }

  return (
    <div className="tkn--create tkn--create-yaml">
      <div className="tkn--create--heading">
        <h1 id="main-content-header" tabIndex={-1}>
          {intl.formatMessage(
            {
              id: 'dashboard.editor.create.title',
              defaultMessage: 'Create {kind}'
            },
            { kind }
          )}
        </h1>
      </div>
      <Form>
        {validationErrorMessage && (
          <InlineNotification
            kind="error"
            title={intl.formatMessage({
              id: 'dashboard.editor.validationError',
              defaultMessage: 'Please fix errors, then resubmit'
            })}
            subtitle={validationErrorMessage}
            lowContrast
          />
        )}
        {submitError && (
          <InlineNotification
            kind="error"
            title={intl.formatMessage(
              {
                id: 'dashboard.editor.createError',
                defaultMessage: 'Error creating {kind}'
              },
              { kind }
            )}
            subtitle={submitError}
            onCloseButtonClick={resetError}
            lowContrast
          />
        )}
        <FormGroup legendText="">
          {loading ? (
            <Loading message={loadingMessage} />
          ) : (
            <CodeMirror
              className="tkn--editor"
              editable={!loading}
              height="800px"
              onChange={onChange}
              theme="dark"
              value={code}
              // there's an issue with CodeMirror in the unit tests when loading certain extensions
              // but they're not relevant for the purposes of the tests so skip adding them
              {...(import.meta.env.MODE === 'test'
                ? null
                : { extensions: [StreamLanguage.define(yamlMode)] })}
            />
          )}
        </FormGroup>
        <Button
          iconDescription={intl.formatMessage({
            id: 'dashboard.actions.createButton',
            defaultMessage: 'Create'
          })}
          onClick={handleSubmit}
          disabled={isCreating || loading}
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
          disabled={isCreating}
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
