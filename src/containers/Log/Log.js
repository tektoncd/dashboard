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
  state = { log: null };

  componentDidMount() {
    this.loadLog();
  }

  componentDidUpdate(prevProps) {
    const { taskRunName } = this.props;
    if (taskRunName !== prevProps.taskRunName) {
      this.loadLog();
    }
  }

  async loadLog() {
    const { taskRunName } = this.props;
    if (taskRunName) {
      try {
        const log = await getTaskRunLog(taskRunName);
        this.setState({ log });
      } catch {
        this.setState({ log: 'Unable to fetch log' });
      }
    }
  }

  render() {
    const { log } = this.state;
    return <Log log={log} />;
  }
}

export default LogContainer;
