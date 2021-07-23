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
import {
  Accordion,
  AccordionItem,
  Button,
  Dropdown,
  Form,
  InlineNotification,
  TextInput,
  ToastNotification,
  TooltipIcon
} from 'carbon-components-react';
import { Information16 } from '@carbon/icons-react';
import { Link } from 'react-router-dom';
import {
  ALL_NAMESPACES,
  getErrorMessage,
  getTranslateWithId,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
import parseGitURL from 'git-url-parse';
import {
  importResources,
  useDashboardNamespace,
  useSelectedNamespace
} from '../../api';
import { NamespacesDropdown, ServiceAccountsDropdown } from '..';

const itemToString = ({ text }) => text;

function isValidGitURL(url) {
  if (!url || !url.trim()) {
    return false;
  }
  const { name, owner, resource } = parseGitURL(url);
  return !!(name && owner && resource);
}

const initialMethod = 'apply';

const HelpIcon = ({ title }) => (
  <TooltipIcon direction="top" align="start" tooltipText={title}>
    <Information16 />
  </TooltipIcon>
);

export function ImportResources(props) {
  const { intl } = props;

  const { selectedNamespace: navNamespace } = useSelectedNamespace();
  const dashboardNamespace = useDashboardNamespace();

  const [importerNamespace, setImporterNamespace] = useState(
    dashboardNamespace
  );
  const [invalidImporterNamespace, setInvalidImporterNamespace] = useState(
    false
  );
  const [invalidInput, setInvalidInput] = useState(false);
  const [invalidNamespace, setInvalidNamespace] = useState(false);
  const [logsURL, setLogsURL] = useState('');
  const [method, setMethod] = useState(initialMethod);
  const [namespace, setNamespace] = useState(
    navNamespace !== ALL_NAMESPACES && navNamespace
  );
  const [path, setPath] = useState('');
  const [repositoryURL, setRepositoryURL] = useState('');
  const [revision, setRevision] = useState('');
  const [serviceAccount, setServiceAccount] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useTitleSync({
    page: intl.formatMessage({
      id: 'dashboard.importResources.title',
      defaultMessage: 'Import resources'
    })
  });

  function resetError() {
    setSubmitError('');
  }

  function resetSuccess() {
    setSubmitSuccess(false);
  }

  function handleMethod({ selectedItem }) {
    setMethod(selectedItem.text);
  }

  function handleNamespace({ selectedItem }) {
    if (selectedItem) {
      setInvalidNamespace(false);
      setNamespace(selectedItem.id);
    } else {
      setInvalidNamespace(true);
      setNamespace('');
    }
  }

  function handleImporterNamespace({ selectedItem }) {
    if (selectedItem) {
      setInvalidImporterNamespace(false);
      setImporterNamespace(selectedItem.id);
    } else {
      setInvalidImporterNamespace(true);
      setImporterNamespace('');
    }
  }

  function handleServiceAccount({ selectedItem }) {
    setServiceAccount(selectedItem ? selectedItem.text : null);
  }

  function handleTextInput(event, updateState) {
    const inputValue = event.target.value;
    updateState(inputValue);
    setInvalidInput(false);
  }

  function handleSubmit() {
    const repourlValid = isValidGitURL(repositoryURL);
    if (repourlValid === false || !namespace) {
      if (!repourlValid) {
        setInvalidInput(true);
      }
      setInvalidNamespace(!namespace);
      return;
    }

    const { resource: gitServer, owner: gitOrg, name: gitRepo } = parseGitURL(
      repositoryURL
    );
    const labels = { gitServer, gitOrg, gitRepo };

    importResources({
      importerNamespace,
      labels,
      method,
      namespace,
      path,
      repositoryURL,
      revision,
      serviceAccount
    })
      .then(body => {
        const pipelineRunName = body.metadata.name;

        const finalURL = urls.pipelineRuns.byName({
          namespace: importerNamespace,
          pipelineRunName
        });

        setLogsURL(finalURL);
        setSubmitSuccess(true);
        setInvalidInput(false);
      })
      .catch(error => {
        error.response.text().then(text => {
          const statusCode = error.response.status;
          let errorMessage = `error code ${statusCode}`;
          if (text) {
            errorMessage = `${text} (error code ${statusCode})`;
          }
          setSubmitError(errorMessage);
        });
      });
  }

  const selectedNamespace = namespace
    ? {
        id: namespace,
        text: namespace
      }
    : undefined;

  const selectedImporterNamespace = importerNamespace
    ? {
        id: importerNamespace,
        text: importerNamespace
      }
    : undefined;

  return (
    <div className="tkn--importresources">
      <h1 id="main-content-header" className="tkn--importresources-header">
        {intl.formatMessage({
          id: 'dashboard.importResources.heading',
          defaultMessage: 'Import resources from repository'
        })}
      </h1>
      {submitError && (
        <InlineNotification
          iconDescription={intl.formatMessage({
            id: 'dashboard.notification.clear',
            defaultMessage: 'Clear notification'
          })}
          kind="error"
          lowContrast
          onCloseButtonClick={resetError}
          subtitle={getErrorMessage(submitError)}
          title={intl.formatMessage({
            id: 'dashboard.error.title',
            defaultMessage: 'Error:'
          })}
        />
      )}
      <Form>
        <TextInput
          id="import-repository-url"
          invalid={invalidInput}
          invalidText={intl.formatMessage({
            id: 'dashboard.importResources.repo.invalidText',
            defaultMessage: 'Please enter a valid Git URL'
          })}
          labelText={
            <>
              {intl.formatMessage({
                id: 'dashboard.importResources.repo.labelText',
                defaultMessage: 'Repository URL'
              })}
              <HelpIcon
                title={intl.formatMessage({
                  id: 'dashboard.importResources.repo.helperText',
                  defaultMessage:
                    'The location of the YAML definitions to be applied (Git URLs supported)'
                })}
              />
            </>
          }
          name="repositoryURL"
          onChange={event => handleTextInput(event, setRepositoryURL)}
          placeholder="https://github.com/my-repository"
          required
          type="URL"
          value={repositoryURL}
        />
        <TextInput
          id="import-path"
          labelText={
            <>
              {intl.formatMessage({
                id: 'dashboard.importResources.path.labelText',
                defaultMessage: 'Repository path (optional)'
              })}
              <HelpIcon
                title={intl.formatMessage({
                  id: 'dashboard.importResources.path.helperText',
                  defaultMessage:
                    'The path of the Tekton resources to import from the repository. Leave blank if the resources are at the top-level directory.'
                })}
              />
            </>
          }
          name="path"
          onChange={event => handleTextInput(event, setPath)}
          placeholder={intl.formatMessage({
            id: 'dashboard.importResources.path.placeholder',
            defaultMessage: 'Enter repository path'
          })}
          value={path}
        />
        <TextInput
          id="import-revision"
          labelText={
            <>
              {intl.formatMessage({
                id: 'dashboard.importResources.revision.labelText',
                defaultMessage: 'Revision (optional)'
              })}
              <HelpIcon
                title={intl.formatMessage({
                  id: 'dashboard.importResources.revision.helperText',
                  defaultMessage:
                    'The git revision (branch, tag, commit SHA or ref) of the repository to clone. Leave blank to use the default branch.'
                })}
              />
            </>
          }
          name="revision"
          onChange={event => handleTextInput(event, setRevision)}
          placeholder={intl.formatMessage({
            id: 'dashboard.importResources.revision.placeholder',
            defaultMessage: 'Enter revision'
          })}
          value={revision}
        />
        <NamespacesDropdown
          id="import-namespaces-dropdown"
          titleText={
            <>
              {intl.formatMessage({
                id: 'dashboard.importResources.targetNamespace.titleText',
                defaultMessage: 'Target namespace'
              })}
              <HelpIcon
                title={intl.formatMessage({
                  id: 'dashboard.importResources.targetNamespace.helperText',
                  defaultMessage:
                    'The namespace in which the resources will be created'
                })}
              />
            </>
          }
          invalid={invalidNamespace}
          invalidText={intl.formatMessage({
            id: 'dashboard.namespacesDropdown.invalidText',
            defaultMessage: 'Please select a Namespace'
          })}
          onChange={handleNamespace}
          required
          selectedItem={selectedNamespace}
        />
        <Accordion align="start">
          <AccordionItem
            title={intl.formatMessage({
              id: 'dashboard.importResources.advanced.accordionText',
              defaultMessage:
                'Advanced configuration for the Import PipelineRun'
            })}
          >
            <NamespacesDropdown
              id="import-install-namespaces-dropdown"
              titleText={
                <>
                  Namespace
                  <HelpIcon
                    title={intl.formatMessage({
                      id:
                        'dashboard.importResources.importerNamespace.helperText',
                      defaultMessage:
                        'The namespace in which the PipelineRun fetching the repository and creating the resources will run'
                    })}
                  />
                </>
              }
              invalid={invalidImporterNamespace}
              invalidText={intl.formatMessage({
                id: 'dashboard.namespacesDropdown.invalidText',
                defaultMessage: 'Please select a Namespace'
              })}
              onChange={handleImporterNamespace}
              required
              selectedItem={selectedImporterNamespace}
            />
            <ServiceAccountsDropdown
              id="import-service-accounts-dropdown"
              namespace={importerNamespace}
              onChange={handleServiceAccount}
              titleText={
                <>
                  {intl.formatMessage({
                    id: 'dashboard.serviceAccountLabel.optional',
                    defaultMessage: 'ServiceAccount (optional)'
                  })}
                  <HelpIcon
                    title={intl.formatMessage({
                      id: 'dashboard.importResources.serviceAccount.helperText',
                      defaultMessage:
                        'The ServiceAccount that the PipelineRun applying resources will run under (from the namespace above). Ensure the selected ServiceAccount (or the default if none selected) has permissions for creating PipelineRuns and for anything else your PipelineRun interacts with, including any Tekton resources in the Git repository.'
                    })}
                  />
                </>
              }
            />
            <Dropdown
              id="import-method"
              initialSelectedItem={{ id: initialMethod, text: initialMethod }}
              items={[
                { id: 'apply', text: 'apply' },
                { id: 'create', text: 'create' }
              ]}
              itemToString={itemToString}
              label=""
              onChange={handleMethod}
              titleText={
                <>
                  {intl.formatMessage({
                    id: 'dashboard.importResources.method.label',
                    defaultMessage: 'Method'
                  })}
                  <HelpIcon
                    title={intl.formatMessage({
                      id: 'dashboard.importResources.method.helperText',
                      defaultMessage:
                        "If any of the resources being imported use 'generateName' rather than 'name' in their metadata, select 'create' so they can be imported correctly."
                    })}
                  />
                </>
              }
              translateWithId={getTranslateWithId(intl)}
            />
          </AccordionItem>
        </Accordion>
        {submitSuccess && (
          <ToastNotification
            caption={<Link to={logsURL}>View status of this run</Link>}
            kind="success"
            lowContrast
            title={intl.formatMessage({
              id: 'dashboard.importResources.triggeredNotification',
              defaultMessage: 'Triggered PipelineRun to import Tekton resources'
            })}
            subtitle=""
            onCloseButtonClick={resetSuccess}
          />
        )}
        <Button kind="primary" onClick={handleSubmit}>
          {intl.formatMessage({
            id: 'dashboard.importResources.importApplyButton',
            defaultMessage: 'Import'
          })}
        </Button>
      </Form>
    </div>
  );
}

export default injectIntl(ImportResources);
