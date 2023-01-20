/*
Copyright 2022-2023 The Tekton Authors
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
import { ALL_NAMESPACES, urls } from '@tektoncd/dashboard-utils';
import {
  Button,
  Form,
  FormGroup,
  InlineNotification,
  Loading
} from 'carbon-components-react';
import yaml from 'js-yaml';
import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { yaml as codeMirrorYAML } from '@codemirror/legacy-modes/mode/yaml';
import { useNavigate } from 'react-router-dom-v5-compat';
import { createPipelineRunRaw, useSelectedNamespace } from '../../api';

export function CreateYAMLEditor({
  code: initialCode,
  loading = false,
  loadingMessage = ''
}) {
  const intl = useIntl();
  const navigate = useNavigate();
  const { selectedNamespace } = useSelectedNamespace();

  const [{ code, isCreating, submitError, validationErrorMessage }, setState] =
    useState({
      code: initialCode,
      isCreating: false,
      submitError: '',
      validationErrorMessage: ''
    });

  useEffect(() => {
    if (!loading) {
      setState(state => ({
        ...state,
        code: initialCode
      }));
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

  function validateEmptyYaml() {
    if (!code) {
      return {
        valid: false,
        message: intl.formatMessage({
          id: 'dashboard.createPipelineRun.empty',
          defaultMessage: 'PipelineRun cannot be empty'
        })
      };
    }
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    // Check form validation
    let validationResult = validateEmptyYaml();
    if (validationResult && !validationResult.valid) {
      setState(state => ({
        ...state,
        validationErrorMessage: validationResult.message
      }));
      return;
    }

    let pipelineRun;
    try {
      pipelineRun = yaml.load(code);
    } catch (e) {
      setState(state => ({
        ...state,
        validationErrorMessage: e.message
      }));
      return;
    }

    validationResult = validateNamespace(pipelineRun);
    if (validationResult && !validationResult.valid) {
      setState(state => ({
        ...state,
        validationErrorMessage: validationResult.message
      }));
      return;
    }

    setState(state => ({ ...state, isCreating: true }));
    const namespace = pipelineRun?.metadata?.namespace;

    createPipelineRunRaw({
      namespace,
      payload: pipelineRun
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
            isCreating: false,
            submitError: errorMessage
          }));
        });
      });
  }

  function onChange(newValue, _viewUpdate) {
    setState(state => ({
      ...state,
      code: newValue
    }));
  }

  function resetError() {
    setState(state => ({ ...state, submitError: '' }));
  }

  function handleClose() {
    let url = urls.pipelineRuns.all();
    if (selectedNamespace && selectedNamespace !== ALL_NAMESPACES) {
      url = urls.pipelineRuns.byNamespace({ namespace: selectedNamespace });
    }
    navigate(url);
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
      </div>
      <Form>
        {validationErrorMessage && (
          <InlineNotification
            kind="error"
            title={intl.formatMessage({
              id: 'dashboard.createRun.yaml.validationError',
              defaultMessage: 'Please fix errors, then resubmit'
            })}
            subtitle={validationErrorMessage}
            lowContrast
          />
        )}
        {submitError && (
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
        <FormGroup legendText="" className="tkn--codemirror--form">
          {loading ? (
            <div className="tkn--data-loading-overlay">
              <Loading description={loadingMessage} withOverlay={false} />
              <span className="tkn--data-loading-text">{loadingMessage}</span>
            </div>
          ) : (
            <CodeMirror
              value={code}
              height="800px"
              theme="dark"
              extensions={[StreamLanguage.define(codeMirrorYAML)]}
              onChange={onChange}
              editable={!loading}
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
