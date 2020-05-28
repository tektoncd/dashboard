/*
Copyright 2019-2020 The Tekton Authors
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
import { Button } from 'carbon-components-react';
import { urls } from '@tektoncd/dashboard-utils';
import { Restart32 as Restart } from '@carbon/icons-react';
import './Rerun.scss';

class Rerun extends Component {
  handleRerun = event => {
    event.preventDefault();
    const { intl } = this.props;

    const { namespace } = this.props.pipelineRun.metadata;
    const payload = {
      pipelinerunname: this.props.runName
    };

    this.props
      .rerunPipelineRun(namespace, payload)
      .then(headers => {
        const logsURL = headers.get('Content-Location');
        const newPipelineRunName = logsURL.substring(
          logsURL.lastIndexOf('/') + 1
        );
        const finalURL = urls.pipelineRuns.byName({
          namespace,
          pipelineRunName: newPipelineRunName
        });
        this.props.setShowRerunNotification({
          message: intl.formatMessage({
            id: 'dashboard.rerun.triggered',
            defaultMessage: 'Triggered rerun'
          }),
          kind: 'success',
          logsURL: finalURL
        });
      })
      .catch(error => {
        const statusCode = error.response.status;
        /* istanbul ignore next */
        switch (statusCode) {
          case 500:
            this.props.setShowRerunNotification({
              message: intl.formatMessage({
                id: 'dashboard.rerun.internalServerError',
                defaultMessage:
                  'An internal server error occurred when rerunning this PipelineRun: check the dashboard and extension pod logs for details'
              }),
              kind: 'error'
            });
            break;
          default:
            this.props.setShowRerunNotification({
              message: intl.formatMessage(
                {
                  id: 'dashboard.rerun.error',
                  defaultMessage:
                    'An error occurred when rerunning this PipelineRun: check the dashboard and extension pod logs for details. Status code: ${statusCode}'
                },
                { statusCode }
              ),
              kind: 'error'
            });
        }
      });
  };

  render() {
    const { intl } = this.props;
    return (
      <Button
        data-testid="rerun-btn"
        kind="ghost"
        className="tkn--rerun-btn"
        renderIcon={Restart}
        onClick={this.handleRerun}
      >
        {intl.formatMessage({
          id: 'dashboard.rerun.button',
          defaultMessage: 'Rerun'
        })}
      </Button>
    );
  }
}

export default injectIntl(Rerun);
