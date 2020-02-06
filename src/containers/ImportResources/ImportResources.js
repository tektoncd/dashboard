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
  Button,
  Form,
  InlineNotification,
  TextInput,
  ToastNotification
} from 'carbon-components-react';

import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  ALL_NAMESPACES,
  getErrorMessage,
  urls
} from '@tektoncd/dashboard-utils';
import { getGitValues } from '../../utils';

import {
  createPipelineResource,
  createPipelineRun,
  determineInstallNamespace
} from '../../api';
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
      installNamespace: '',
      installNamespaceError: false,
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
      .then(foundInstallNamespace => {
        this.setState({
          installNamespace: foundInstallNamespace
        });
      })
      .catch(() => {
        this.setState({
          installNamespaceError: true
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
    this.setState({ invalidNamespace: false, namespace: selectedItem.id });
  };

  handleServiceAccount = data => {
    this.setState({
      serviceAccount: data.selectedItem.text
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
      directory: applydirectory,
      namespace,
      repositoryURL: repourl,
      serviceAccount,
      installNamespace
    } = this.state;
    const pipelineName = 'pipeline0';
    const gitresourcename = 'git-source';
    const gitcommit = 'master';

    // Without the if statement it will not display errors for both the namespace and the url at the same time
    // The if / else statement inside is because the repourl needs different parameters set for invalidInput
    // for the error to display when Submit is pressed. If set to the same then the errors dont appear on the page
    const repourlValid = validateURL(repourl);
    if (repourlValid === false || !namespace) {
      if (repourlValid === false && repourl === '') {
        this.setState({
          invalidInput: repourl === ''
        });
      } else if (repourlValid === false) {
        this.setState({
          invalidInput: repourl
        });
      }
      this.setState({
        invalidNamespace: !namespace
      });
      return;
    }

    const resource = {
      apiVersion: 'tekton.dev/v1alpha1',
      kind: 'PipelineResource',
      metadata: {
        generateName: gitresourcename,
        namespace: installNamespace
      },
      spec: {
        type: 'git',
        params: [
          {
            name: 'url',
            value: repourl
          },
          {
            name: 'revision',
            value: gitcommit
          }
        ]
      }
    };
    createPipelineResource({ namespace: installNamespace, resource })
      .then(data => {
        const labels = getGitValues(repourl);
        const pipelineRun = {
          pipelineName,
          serviceAccount,
          resources: { 'git-source': data.metadata.name },
          params: {
            'apply-directory': applydirectory,
            'target-namespace': namespace
          },
          namespace: installNamespace,
          labels
        };
        const promise = createPipelineRun(pipelineRun);
        promise
          .then(headers => {
            const pipelineRunName = headers.metadata.name;

            const finalURL = urls.pipelineRuns.byName({
              namespace: installNamespace,
              pipelineRunName
            });

            if (this.state.installNamespaceError === false) {
              this.setState({
                logsURL: finalURL,
                submitSuccess: true,
                invalidInput: false
              });
            } else {
              this.setState({
                logsURL: urls.pipelineRuns.all(),
                submitSuccess: true,
                invalidInput: false
              });
            }
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
    const { namespace } = this.state;
    const selectedNamespace = namespace
      ? {
          id: namespace,
          text: namespace
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
        <h1 className="ImportHeader">
          Import Tekton resources from repository
        </h1>
        <Form>
          <TextInput
            data-testid="repository-url-field"
            helperText="The location of the YAML definitions to be applied (Git URL's supported)"
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
          <NamespacesDropdown
            id="import-namespaces-dropdown"
            helperText="The namespace in which the resources will be created"
            invalid={this.state.invalidNamespace}
            invalidText="Please select a namespace"
            onChange={this.handleNamespace}
            required
            selectedItem={selectedNamespace}
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
          <ServiceAccountsDropdown
            className="saDropdown"
            helperText="The service account that the PipelineRun applying resources will run under (must be in the install namespace of the Tekton Dashboard)"
            id="import-service-accounts-dropdown"
            namespace={this.state.installNamespace}
            onChange={this.handleServiceAccount}
            titleText="Service Account (optional)"
          />
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
