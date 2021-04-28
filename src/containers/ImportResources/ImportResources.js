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

import React, { Component } from 'react';
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
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  ALL_NAMESPACES,
  getErrorMessage,
  getTitle,
  getTranslateWithId,
  urls
} from '@tektoncd/dashboard-utils';
import parseGitURL from 'git-url-parse';
import { importResources } from '../../api';
import { getDashboardNamespace, getSelectedNamespace } from '../../reducers';
import { NamespacesDropdown, ServiceAccountsDropdown } from '..';

const itemToString = item => (item ? item.text : '');

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

export class ImportResources extends Component {
  constructor(props) {
    super(props);
    this.state = {
      importerNamespace: '',
      invalidImporterNamespace: false,
      invalidInput: false,
      invalidNamespace: false,
      logsURL: '',
      method: initialMethod,
      namespace: props.navNamespace !== ALL_NAMESPACES && props.navNamespace,
      path: '',
      repositoryURL: '',
      revision: '',
      serviceAccount: '',
      submitError: '',
      submitSuccess: false
    };
  }

  componentDidMount() {
    const { intl, dashboardNamespace } = this.props;
    document.title = getTitle({
      page: intl.formatMessage({
        id: 'dashboard.importResources.title',
        defaultMessage: 'Import resources'
      })
    });
    this.setState({
      importerNamespace: dashboardNamespace
    });
  }

  resetError = () => {
    this.setState({ submitError: '' });
  };

  resetSuccess = () => {
    this.setState({ submitSuccess: false });
  };

  handleMethod = ({ selectedItem }) => {
    this.setState({ method: selectedItem.text });
  };

  handleNamespace = ({ selectedItem }) => {
    if (selectedItem) {
      this.setState({ invalidNamespace: false, namespace: selectedItem.id });
    } else {
      this.setState({ invalidNamespace: true, namespace: '' });
    }
  };

  handleImporterNamespace = ({ selectedItem }) => {
    if (selectedItem) {
      this.setState({
        invalidImporterNamespace: false,
        importerNamespace: selectedItem.id
      });
    } else {
      this.setState({ invalidImporterNamespace: true, importerNamespace: '' });
    }
  };

  handleServiceAccount = ({ selectedItem }) => {
    this.setState({
      serviceAccount: selectedItem ? selectedItem.text : null
    });
  };

  handleTextInput = event => {
    const identifier = event.target.name;
    const inputValue = event.target.value;
    this.setState({
      [identifier]: inputValue,
      invalidInput: false
    });
  };

  handleSubmit = () => {
    const {
      importerNamespace,
      method,
      namespace,
      path,
      repositoryURL,
      revision,
      serviceAccount
    } = this.state;

    const repourlValid = isValidGitURL(repositoryURL);
    if (repourlValid === false || !namespace) {
      if (!repourlValid) {
        this.setState({
          invalidInput: true
        });
      }
      this.setState({
        invalidNamespace: !namespace
      });
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

        this.setState({
          logsURL: finalURL,
          submitSuccess: true,
          invalidInput: false
        });
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

  render() {
    const { intl } = this.props;
    const { namespace, importerNamespace } = this.state;
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
        <h1 className="tkn--importresources-header">
          {intl.formatMessage({
            id: 'dashboard.importResources.heading',
            defaultMessage: 'Import resources from repository'
          })}
        </h1>
        {this.state.submitError && (
          <InlineNotification
            iconDescription={intl.formatMessage({
              id: 'dashboard.notification.clear',
              defaultMessage: 'Clear Notification'
            })}
            kind="error"
            lowContrast
            onCloseButtonClick={this.resetError}
            subtitle={getErrorMessage(this.state.submitError)}
            title={intl.formatMessage({
              id: 'dashboard.error.title',
              defaultMessage: 'Error:'
            })}
          />
        )}
        <Form>
          <TextInput
            data-testid="repository-url-field"
            id="import-repository-url"
            invalid={this.state.invalidInput}
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
            onChange={this.handleTextInput}
            placeholder="https://github.com/my-repository"
            required
            type="URL"
            value={this.state.repositoryURL}
          />
          <TextInput
            data-testid="path-field"
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
            onChange={this.handleTextInput}
            placeholder={intl.formatMessage({
              id: 'dashboard.importResources.path.placeholder',
              defaultMessage: 'Enter repository path'
            })}
            value={this.state.path}
          />
          <TextInput
            data-testid="revision-field"
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
            onChange={this.handleTextInput}
            placeholder={intl.formatMessage({
              id: 'dashboard.importResources.revision.placeholder',
              defaultMessage: 'Enter revision'
            })}
            value={this.state.revision}
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
            invalid={this.state.invalidNamespace}
            invalidText={intl.formatMessage({
              id: 'dashboard.namespacesDropdown.invalidText',
              defaultMessage: 'Please select a namespace'
            })}
            onChange={this.handleNamespace}
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
                invalid={this.state.invalidImporterNamespace}
                invalidText={intl.formatMessage({
                  id: 'dashboard.namespacesDropdown.invalidText',
                  defaultMessage: 'Please select a namespace'
                })}
                onChange={this.handleImporterNamespace}
                required
                selectedItem={selectedImporterNamespace}
              />
              <ServiceAccountsDropdown
                id="import-service-accounts-dropdown"
                namespace={this.state.importerNamespace}
                onChange={this.handleServiceAccount}
                titleText={
                  <>
                    {intl.formatMessage({
                      id: 'dashboard.serviceAccountLabel.optional',
                      defaultMessage: 'ServiceAccount (optional)'
                    })}
                    <HelpIcon
                      title={intl.formatMessage({
                        id:
                          'dashboard.importResources.serviceAccount.helperText',
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
                onChange={this.handleMethod}
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
          {this.state.submitSuccess && (
            <ToastNotification
              caption={
                <Link to={this.state.logsURL}>View status of this run</Link>
              }
              kind="success"
              lowContrast
              title={intl.formatMessage({
                id: 'dashboard.importResources.triggeredNotification',
                defaultMessage:
                  'Triggered PipelineRun to import Tekton resources'
              })}
              subtitle=""
              onCloseButtonClick={this.resetSuccess}
            />
          )}
          <Button kind="primary" onClick={this.handleSubmit}>
            {intl.formatMessage({
              id: 'dashboard.importResources.importApplyButton',
              defaultMessage: 'Import and Apply'
            })}
          </Button>
        </Form>
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    navNamespace: getSelectedNamespace(state),
    dashboardNamespace: getDashboardNamespace(state)
  };
}

export default connect(mapStateToProps)(injectIntl(ImportResources));
