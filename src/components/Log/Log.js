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
import Ansi from 'ansi-to-react';

import './Log.scss';

const LogLine = ({ data, index, style }) => (
  <div style={style}>
    <Ansi>{data[index]}</Ansi>
  </div>
);

class Log extends Component {
  getLogList() {
    const { logs, status } = this.props;

    const itemSize = 15; // This should be kept in sync with the line-height in SCSS
    const defaultHeight = 800;
    const height = status
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
  }

  logTrailer() {
    const { status, trailers } = this.props;
    const trailer = trailers[status];
    if (!trailer) {
      return null;
    }

    return (
      <div className="log-trailer" data-status={status}>
        {trailer}
      </div>
    );
  }

  render() {
    const { loading } = this.props;

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

Log.defaultProps = {
  logs: ['No log available'],
  trailers: {
    Completed: 'Step completed',
    Error: 'Step failed'
  }
};

export default Log;
