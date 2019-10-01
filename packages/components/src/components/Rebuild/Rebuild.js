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
import { Button } from 'carbon-components-react';
import { urls } from '@tektoncd/dashboard-utils';
import Restart from '@carbon/icons-react/lib/restart/32';
import './Rebuild.scss';

export class Rebuild extends Component {
  handleRebuild = event => {
    if (event) {
      event.preventDefault();
    }

    const pipelineName = this.props.pipelineRun.spec.pipelineRef.name;
    const { namespace } = this.props.pipelineRun.metadata;
    const payload = {
      pipelinerunname: this.props.runName
    };

    this.props
      .rebuildPipelineRun(namespace, payload)
      .then(headers => {
        const logsURL = headers.get('Content-Location');
        const newPipelineRunName = logsURL.substring(
          logsURL.lastIndexOf('/') + 1
        );
        const finalURL = urls.pipelineRuns.byName({
          namespace,
          pipelineName,
          pipelineRunName: newPipelineRunName
        });
        this.props.setShowRebuildNotification({
          message: 'Rebuilt PipelineRun successfully',
          kind: 'success',
          logsURL: finalURL
        });
      })
      .catch(error => {
        const statusCode = error.response.status;
        /* istanbul ignore next */
        switch (statusCode) {
          case 500:
            this.props.setShowRebuildNotification({
              message: `An internal server error occurred when rebuilding this PipelineRun: check the dashboard and
                extension pod logs for details`,
              kind: 'error'
            });
            break;
          default:
            this.props.setShowRebuildNotification({
              message: `An error occurred when rebuilding this PipelineRun: check the dashboard and
                extension pod logs for details. Status code: ${statusCode}`,
              kind: 'error'
            });
        }
      });
  };

  render() {
    return (
      <Button
        data-testid="rebuild-btn"
        kind="ghost"
        className="rebuild-btn"
        renderIcon={Restart}
        onClick={this.handleRebuild}
      >
        Rebuild
      </Button>
    );
  }
}

export default Rebuild;
