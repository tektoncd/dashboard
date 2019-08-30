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
import { SkeletonText } from 'carbon-components-react';
import { FixedSizeList as List } from 'react-window';
import { injectIntl } from 'react-intl';
import Ansi from 'ansi-to-react';

import './Log.scss';

const LogLine = ({ data, index, style }) => (
  <div style={style}>
    <Ansi>{data[index]}</Ansi>
  </div>
);

const trailers = {
  Completed: {
    id: 'dashboard.pipelineRun.stepCompleted',
    defaultMessage: 'Step completed'
  },
  Error: {
    id: 'dashboard.pipelineRun.stepFailed',
    defaultMessage: 'Step failed'
  }
};

export class LogContainer extends Component {
  state = { loading: true };

  componentDidMount() {
    this.loadLog();
    this.initPolling();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  getLogList = () => {
    const { stepStatus, intl } = this.props;
    const { reason } = (stepStatus && stepStatus.terminated) || {};
    const {
      logs = [
        intl.formatMessage({
          id: 'dashboard.pipelineRun.logEmpty',
          defaultMessage: 'No log available'
        })
      ]
    } = this.state;

    const itemSize = 15; // This should be kept in sync with the line-height in SCSS
    const defaultHeight = 800;
    const height = reason
      ? Math.min(defaultHeight, itemSize * logs.length)
      : defaultHeight;

    return (
      <List
        height={height}
        itemCount={logs.length}
        itemData={logs}
        itemSize={itemSize}
        width="100%"
      >
        {LogLine}
      </List>
    );
  };

  initPolling = () => {
    const { stepStatus } = this.props;
    if (!this.timer && stepStatus && !stepStatus.terminated) {
      this.timer = setInterval(() => this.loadLog(), 4000);
    }
    if (this.timer && stepStatus && stepStatus.terminated) {
      clearInterval(this.timer);
    }
  };

  loadLog = async () => {
    const { fetchLogs, intl } = this.props;
    if (fetchLogs) {
      try {
        const logs = await fetchLogs();
        this.setState({
          loading: false,
          logs: logs ? logs.split('\n') : undefined
        });
      } catch {
        this.setState({
          loading: false,
          logs: [
            intl.formatMessage({
              id: 'dashboard.pipelineRun.logFailed',
              defaultMessage: 'Unable to fetch log'
            })
          ]
        });
      }
    }
  };

  logTrailer = () => {
    const { stepStatus, intl } = this.props;
    const { reason } = (stepStatus && stepStatus.terminated) || {};
    const trailer = trailers[reason];
    if (!trailer) {
      return null;
    }

    return (
      <div className="log-trailer" data-status={reason}>
        {intl.formatMessage(trailer)}
      </div>
    );
  };

  render() {
    const { loading } = this.state;
    return (
      <pre className="log">
        {loading ? (
          <SkeletonText paragraph width="60%" />
        ) : (
          <>
            <div className="log-container">{this.getLogList()}</div>
            {this.logTrailer()}
          </>
        )}
      </pre>
    );
  }
}

export default injectIntl(LogContainer);
