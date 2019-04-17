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

import Log from '../../components/Log';
import { getTaskRunLog } from '../../api';

class LogContainer extends Component {
  state = { logs: [] };

  componentDidMount() {
    this.loadLog();
  }

  componentDidUpdate(prevProps) {
    const { stepName, taskRunName } = this.props;
    if (
      taskRunName !== prevProps.taskRunName ||
      stepName !== prevProps.stepName
    ) {
      this.loadLog();
    }
  }

  async loadLog() {
    const { stepName, taskRunName } = this.props;
    if (taskRunName) {
      try {
        const logs = await getTaskRunLog(taskRunName);
        const buildStepName = `build-step-${stepName}`;
        const stepLog =
          (logs.StepContainers &&
            logs.StepContainers.find(l => l.Name === buildStepName)) ||
          {};
        this.setState({ logs: stepLog.Logs || undefined });
      } catch {
        this.setState({ logs: ['Unable to fetch log'] });
      }
    }
  }

  render() {
    const { stepName } = this.props;
    const { logs } = this.state;
    return <Log logs={logs} stepName={stepName} />;
  }
}

export default LogContainer;
