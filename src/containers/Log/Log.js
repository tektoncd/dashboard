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
import { withRouter } from 'react-router-dom';
import { injectIntl } from 'react-intl';

import Log from '../../components/Log';
import { getPodLog } from '../../api';

export class LoggingContainer extends Component {
  state = { logs: [] };

  componentDidMount() {
    this.loadLog();
    this.initPolling();
  }

  componentDidUpdate(prevProps) {
    const {
      match,
      podName,
      stepName,
      stepStatus: { container: containerName }
    } = this.props;
    const { namespace } = match.params;
    const {
      match: prevMatch,
      podName: prevPodName,
      stepName: prevStepName,
      stepStatus: { container: prevContainerName }
    } = prevProps;
    const { namespace: prevNamespace } = prevMatch.params;

    if (
      podName !== prevPodName ||
      stepName !== prevStepName ||
      namespace !== prevNamespace ||
      containerName !== prevContainerName
    ) {
      this.loadLog();
    }
    this.initPolling();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  initPolling = () => {
    const { stepStatus } = this.props;
    if (!this.timer && stepStatus && !stepStatus.terminated) {
      this.timer = setInterval(() => this.loadLog(), 4000);
    }
    if (this.timer && stepStatus && stepStatus.terminated) {
      clearInterval(this.timer);
    }
  };

  async loadLog() {
    const { intl, namespace, podName, stepName, stepStatus } = this.props;
    if (podName) {
      try {
        const { container = `step-${stepName}` } = stepStatus;
        const logs = await getPodLog({
          container,
          name: podName,
          namespace
        });
        this.setState({ logs: logs ? logs.split('\n') : undefined });
      } catch {
        this.setState({
          logs: [
            intl.formatMessage({
              id: 'dashboard.pipelineRun.logFailed',
              defaultMessage: 'Unable to fetch log'
            })
          ]
        });
      }
    }
  }

  render() {
    const { stepName, stepStatus } = this.props;
    const { reason } = (stepStatus && stepStatus.terminated) || {};
    const { logs } = this.state;
    return <Log logs={logs} stepName={stepName} status={reason} />;
  }
}

export default withRouter(injectIntl(LoggingContainer));
