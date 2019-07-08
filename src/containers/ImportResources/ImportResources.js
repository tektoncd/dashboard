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

import {
  Button,
  Form,
  TextInput,
  ToastNotification
} from 'carbon-components-react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { ALL_NAMESPACES } from '../../constants';
import { createPipelineRun, getInstallProperties } from '../../api';
import { getSelectedNamespace } from '../../reducers';
import { NamespacesDropdown, ServiceAccountsDropdown } from '..';

import './ImportResources.scss';

export class ImportResources extends Component {
  constructor(props) {
    super(props);
    this.state = {
      directory: '',
      invalidInput: false,
      invalidNamespace: false,
      logsURL: '',
      namespace: props.navNamespace !== ALL_NAMESPACES && props.navNamespace,
      repositoryURL: '',
      serviceAccount: '',
      submitSuccess: false
    };
  }

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

  handleSubmit = event => {
    event.preventDefault();

    const {
      directory: applydirectory,
      namespace,
      repositoryURL: repourl,
      serviceAccount: serviceaccount
    } = this.state;
    const pipelinename = 'pipeline0';
    const gitresourcename = 'git-source';
    const gitcommit = 'master';

    const payload = {
      applydirectory,
      gitcommit,
      gitresourcename,
      pipelinename,
      repourl,
      serviceaccount
    };

    if (repourl === '' || !namespace) {
      this.setState({
        invalidInput: repourl === '',
        invalidNamespace: !namespace
      });
      return;
    }

    const promise = createPipelineRun({ namespace, payload });
    promise
      .then(headers => {
        const props = getInstallProperties();
        props
          .then(properties => {
            const logsURL = headers.get('Content-Location');
            const pipelineRunName = logsURL.substring(
              logsURL.lastIndexOf('/') + 1
            );

            const finalURL = `/namespaces/${
              properties.InstallNamespace
            }/pipelines/pipeline0/runs/${pipelineRunName}`;
            this.setState({
              logsURL: finalURL,
              submitSuccess: true,
              invalidInput: false
            });
          })
          .catch(() => {
            this.setState({
              logsURL: `/pipelineruns`,
              submitSuccess: true,
              invalidInput: false
            });
          });
      })
      .catch(error => {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 500:
            this.setState({
              submitSuccess: false,
              invalidInput: true
            });
            break;
          default:
        }
      });
  };

  render() {
    const { namespace } = this.state;
    const selectedNamespace = namespace
      ? {
          id: namespace,
          text: namespace
        }
      : undefined;

    return (
      <div className="outer">
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
            placeholder="Enter repository URL"
            required
            type="URL"
            value={this.state.repositoryURL}
          />
          <NamespacesDropdown
            id="import-namespaces-dropdown"
            helperText="The namespace that the PipelineRun applying resources will run under"
            invalid={this.state.invalidNamespace}
            invalidText="Please select a namespace"
            onChange={this.handleNamespace}
            required
            selectedItem={selectedNamespace}
          />
          <TextInput
            data-testid="directory-field"
            helperText="The path from which resources will be applied at the specified repository"
            id="import-directory"
            labelText="Repository directory (optional)"
            name="directory"
            onChange={this.handleTextInput}
            placeholder="Enter repository directory"
            value={this.state.directory}
          />
          <ServiceAccountsDropdown
            className="saDropdown"
            helperText="The SA that the PipelineRun applying resources will run under"
            id="import-service-accounts-dropdown"
            namespace={namespace}
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

export default connect(mapStateToProps)(ImportResources);
