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
  ToastNotification,
  TextInput,
  Button,
  Form
} from 'carbon-components-react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import './ImportResources.scss';

import { createPipelineRun } from '../../api';
import ServiceAccountsDropdown from '../ServiceAccountsDropdown';
import { getSelectedNamespace } from '../../reducers';

export class ImportResources extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repositoryURL: '',
      serviceAccount: '',
      submitSuccess: false,
      invalidInput: false,
      logsURL: '',
      directory: ''
    };
  }

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
    const { namespace } = this.props;
    const pipelinename = 'pipeline0';
    const gitresourcename = 'git-source';
    const gitcommit = 'master';
    const applydirectory = this.state.directory;
    const repourl = this.state.repositoryURL;
    const serviceaccount = this.state.serviceAccount;
    const payload = {
      pipelinename,
      serviceaccount,
      gitresourcename,
      gitcommit,
      repourl,
      applydirectory
    };

    if (repourl === '') {
      this.setState({
        invalidInput: true
      });
      return;
    }

    this.setState({
      invalidInput: false
    });

    const promise = createPipelineRun(payload, namespace);
    promise
      .then(headers => {
        const logsURL = headers.get('Content-Location');
        const pipelineRunName = logsURL.substring(logsURL.lastIndexOf('/') + 1);
        const finalURL = '/pipelines/pipeline0/runs/'.concat(pipelineRunName);
        this.setState({
          logsURL: finalURL,
          submitSuccess: true,
          invalidInput: false
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
    event.preventDefault();
  };

  render() {
    return (
      <div className="outer">
        <h1 className="ImportHeader">
          Import Tekton resources from repository
        </h1>
        <Form>
          <TextInput
            required
            type="URL"
            invalid={this.state.invalidInput}
            invalidText="Please submit a valid URL"
            helperText="The location of the YAML definitions to be applied (Git URL's supported)"
            labelText="Repository URL"
            placeholder="Enter repository URL"
            data-testid="repository-url-field"
            name="repositoryURL"
            value={this.state.repositoryURL}
            onChange={this.handleTextInput}
          />
          <TextInput
            helperText="The path from which resources will be applied at the
          specified repository"
            labelText="Repository directory (optional)"
            placeholder="Enter repository directory"
            data-testid="directory-field"
            name="directory"
            value={this.state.directory}
            onChange={this.handleTextInput}
          />
          <ServiceAccountsDropdown
            helperText="The SA that the PipelineRun applying resources will
          run under"
            titleText="Service Account (optional)"
            className="saDropdown"
            onChange={this.handleServiceAccount}
          />
          <Button kind="primary" onClick={this.handleSubmit}>
            Import and Apply
          </Button>
          {this.state.submitSuccess && (
            <ToastNotification
              kind="success"
              title="Triggered PipelineRun to apply Tekton resources"
              subtitle=""
              caption={
                <Link to={this.state.logsURL}>View status of this run</Link>
              }
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
    namespace: getSelectedNamespace(state)
  };
}

export default connect(mapStateToProps)(ImportResources);
