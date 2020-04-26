/*
Copyright 2019 The Tekton Authors
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
  Form,
  FormGroup,
  InlineNotification,
  TextInput,
  ToastNotification,
  Tooltip
} from 'carbon-components-react';

import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  ALL_NAMESPACES,
  getErrorMessage,
  urls
} from '@tektoncd/dashboard-utils';
import { getGitValues } from '../../utils';

import { determineInstallNamespace, importResources } from '../../api';
import { getSelectedNamespace } from '../../reducers';
import { NamespacesDropdown, ServiceAccountsDropdown } from '..';

import './ImportResources.scss';

async function getInstallNamespace() {
  return determineInstallNamespace();
}

function validateURL(url) {
  if (!url.trim().startsWith('http://') && !url.trim().startsWith('https://')) {
    return false;
  }

  if (url.trim() === '') {
    return false;
  }

  if (url.includes('github') === false) {
    return false;
  }
  if (url.includes('.') === false) {
    return false;
  }

  return true;
}

export class ImportResources extends Component {
  constructor(props) {
    super(props);
    this.state = {
      directory: '',
      invalidInput: false,
      invalidNamespace: false,
      invalidImporterNamespace: false,
      importerNamespace: '',
      importerNamespaceError: false,
      logsURL: '',
      namespace: props.navNamespace !== ALL_NAMESPACES && props.navNamespace,
      repositoryURL: '',
      serviceAccount: '',
      submitSuccess: false,
      submitError: ''
    };
  }

  componentDidMount() {
    getInstallNamespace()
      .then(foundImporterNamespace => {
        this.setState({
          importerNamespace: foundImporterNamespace
        });
      })
      .catch(() => {
        this.setState({
          importerNamespaceError: true
        });
      });
  }

  resetError = () => {
    this.setState({ submitError: '' });
  };

  resetSuccess = () => {
    this.setState({ submitSuccess: false });
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
      directory: applyDirectory,
      namespace,
      repositoryURL,
      serviceAccount,
      importerNamespace
    } = this.state;

    // Without the if statement it will not display errors for both the namespace and the url at the same time
    // The if / else statement inside is because the repositoryURL needs different parameters set for invalidInput
    // for the error to display when Submit is pressed. If set to the same then the errors dont appear on the page
    const repourlValid = validateURL(repositoryURL);
    if (repourlValid === false || !namespace) {
      if (repourlValid === false && repositoryURL === '') {
        this.setState({
          invalidInput: repositoryURL === ''
        });
      } else if (repourlValid === false) {
        this.setState({
          invalidInput: repositoryURL
        });
      }
      this.setState({
        invalidNamespace: !namespace
      });
      return;
    }

    const labels = getGitValues(repositoryURL);

    importResources({
      repositoryURL,
      applyDirectory,
      namespace,
      labels,
      serviceAccount,
      importerNamespace
    })
      .then(headers => {
        const pipelineRunName = headers.metadata.name;

        const finalURL = urls.pipelineRuns.byName({
          namespace: importerNamespace,
          pipelineRunName
        });

        this.setState(prevState => {
          return {
            logsURL:
              prevState.importerNamespaceError === false
                ? finalURL
                : urls.pipelineRuns.all(),
            submitSuccess: true,
            invalidInput: false
          };
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
      <div className="outer">
        {this.state.submitError && (
          <InlineNotification
            kind="error"
            title={intl.formatMessage({
              id: 'dashboard.error.title',
              defaultMessage: 'Error:'
            })}
            subtitle={getErrorMessage(this.state.submitError)}
            iconDescription={intl.formatMessage({
              id: 'dashboard.notification.clear',
              defaultMessage: 'Clear Notification'
            })}
            data-testid="errorNotificationComponent"
            onCloseButtonClick={this.resetError}
            lowContrast
          />
        )}
        <h1 className="importHeader">
          Import Tekton resources from repository
        </h1>
        <Form>
          <FormGroup legendText="Source repository and target namespace">
            <TextInput
              data-testid="repository-url-field"
              helperText="The location of the YAML definitions to be applied (Git URLs supported)"
              id="import-repository-url"
              invalid={this.state.invalidInput}
              invalidText="Please submit a valid URL"
              labelText="Repository URL"
              name="repositoryURL"
              onChange={this.handleTextInput}
              placeholder="https://github.com/my-repository"
              required
              type="URL"
              value={this.state.repositoryURL}
            />
            <TextInput
              data-testid="directory-field"
              helperText="The location of the Tekton resources to import from the repository. Leave blank if the resources are at the top-level directory."
              id="import-directory"
              labelText="Repository directory (optional)"
              name="directory"
              onChange={this.handleTextInput}
              placeholder="Enter repository directory"
              value={this.state.directory}
            />
            <NamespacesDropdown
              id="import-namespaces-dropdown"
              helperText="The namespace in which the resources will be created"
              titleText="Target namespace"
              invalid={this.state.invalidNamespace}
              invalidText="Please select a namespace"
              onChange={this.handleNamespace}
              required
              selectedItem={selectedNamespace}
            />
          </FormGroup>
          <Accordion>
            <AccordionItem
              title={
                <Tooltip
                  direction="right"
                  triggerText="Advanced configuration for the Import PipelineRun"
                >
                  <div>
                    Change these parameters if you want the PipelineRun that
                    will do the importing, to run in a different namespace from
                    the Dashboard&apos;s.
                    <br />
                    <br />
                    You can optionally provide a different ServiceAccount too.
                  </div>
                </Tooltip>
              }
            >
              <NamespacesDropdown
                id="import-install-namespaces-dropdown"
                helperText="The namespace in which the PipelineRun fetching the repository and creating the resources will run"
                titleText="Namespace"
                invalid={this.state.invalidImporterNamespace}
                invalidText="Please select a namespace"
                onChange={this.handleImporterNamespace}
                required
                selectedItem={selectedImporterNamespace}
              />
              <ServiceAccountsDropdown
                className="saDropdown"
                helperText="The ServiceAccount that the PipelineRun will run under (from the namespace above)"
                id="import-service-accounts-dropdown"
                namespace={this.state.importerNamespace}
                onChange={this.handleServiceAccount}
                titleText="ServiceAccount (optional)"
              />
            </AccordionItem>
          </Accordion>
          <Button kind="primary" onClick={this.handleSubmit}>
            Import and Apply
          </Button>
          {this.state.submitSuccess && (
            <ToastNotification
              caption={
                <Link to={this.state.logsURL}>View status of this run</Link>
              }
              kind="success"
              lowContrast
              title="Triggered PipelineRun to apply Tekton resources"
              subtitle=""
              onCloseButtonClick={this.resetSuccess}
            />
          )}
        </Form>
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    navNamespace: getSelectedNamespace(state)
  };
}

export default connect(mapStateToProps)(injectIntl(ImportResources));
