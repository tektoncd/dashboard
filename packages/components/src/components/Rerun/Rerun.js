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
    const {
      intl,
      pipelineRun,
      rerunPipelineRun,
      setShowRerunNotification
    } = this.props;

    const { namespace } = pipelineRun.metadata;

    rerunPipelineRun(pipelineRun)
      .then(newPipelineRun => {
        const newPipelineRunName = newPipelineRun.metadata.name;
        const finalURL = urls.pipelineRuns.byName({
          namespace,
          pipelineRunName: newPipelineRunName
        });
        setShowRerunNotification({
          message: intl.formatMessage({
            id: 'dashboard.rerun.triggered',
            defaultMessage: 'Triggered rerun'
          }),
          kind: 'success',
          logsURL: finalURL
        });
      })
      .catch(error => {
        setShowRerunNotification({
          message: intl.formatMessage(
            {
              id: 'dashboard.rerun.error',
              defaultMessage:
                'An error occurred when rerunning this PipelineRun: check the dashboard logs for details. Status code: {statusCode}'
            },
            { statusCode: error.response.status }
          ),
          kind: 'error'
        });
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
