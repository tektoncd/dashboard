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
import { Button } from 'carbon-components-react';
import {
  PlayOutline32 as Play,
  Restart32 as Restart
} from '@carbon/icons-react';

class RunAction extends Component {
  handleAction = event => {
    event.preventDefault();
    const {
      action,
      getURL,
      intl,
      run,
      runaction,
      showNotification
    } = this.props;
    const { namespace } = run.metadata;
    let triggerMsg = null;
    switch (action) {
      case 'rerun':
        triggerMsg = intl.formatMessage({
          id: 'dashboard.rerun.triggered',
          defaultMessage: 'Triggered rerun'
        });
        break;
      case 'start':
        triggerMsg = intl.formatMessage({
          id: 'dashboard.start.triggered',
          defaultMessage: 'Triggered start'
        });
        break;
      default:
        break;
    }

    runaction(run)
      .then(newRun => {
        let finalURL = null;
        if (newRun) {
          finalURL = getURL({
            namespace,
            name: newRun.metadata.name
          });
        }
        showNotification({
          message: triggerMsg,
          kind: 'success',
          logsURL: finalURL
        });
      })
      .catch(error => {
        let msg = null;
        switch (action) {
          case 'rerun':
            msg = intl.formatMessage(
              {
                id: 'dashboard.rerun.error',
                defaultMessage:
                  'An error occurred when rerunning {runName}: check the dashboard logs for details. Status code: {statusCode}'
              },
              {
                action,
                runName: run.metadata.name,
                statusCode: error.response.status
              }
            );
            break;
          case 'start':
            msg = intl.formatMessage(
              {
                id: 'dashboard.start.error',
                defaultMessage:
                  'An error occurred when starting {runName}: check the dashboard logs for details. Status code: {statusCode}'
              },
              {
                action,
                runName: run.metadata.name,
                statusCode: error.response.status
              }
            );
            break;
          default:
            break;
        }
        showNotification({
          message: msg,
          kind: 'error'
        });
      });
  };

  render() {
    const { action, intl } = this.props;

    let icon = null;
    let msg = '';
    switch (action) {
      case 'rerun':
        icon = Restart;
        msg = intl.formatMessage({
          id: 'dashboard.rerun.button',
          defaultMessage: 'Rerun'
        });
        break;
      case 'start':
        icon = Play;
        msg = intl.formatMessage({
          id: 'dashboard.start.button',
          defaultMessage: 'Start'
        });
        break;
      default:
        break;
    }

    return (
      <Button
        kind="ghost"
        className="tkn--runaction-btn"
        renderIcon={icon}
        onClick={this.handleAction}
      >
        {msg}
      </Button>
    );
  }
}

export default injectIntl(RunAction);
