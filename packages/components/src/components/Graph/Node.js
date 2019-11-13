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
/* istanbul ignore file */
import React, { PureComponent } from 'react';

import CheckmarkFilled from '@carbon/icons-react/lib/checkmark--filled/16';
import ChevronDown from '@carbon/icons-react/lib/chevron--down/16';
import CloseFilled from '@carbon/icons-react/lib/close--filled/16';
import Undefined from '@carbon/icons-react/lib/undefined/16';

import InlineLoading from './InlineLoading';
import './Graph.scss';

export default class Node extends PureComponent {
  render() {
    const { children, height, status, type, width, label = type } = this.props;

    let StatusIcon;
    if (type === 'Task' || status === 'error') {
      switch (status) {
        case 'error':
          StatusIcon = CloseFilled;
          break;
        case 'running':
          StatusIcon = InlineLoading;
          break;
        case 'success':
          StatusIcon = CheckmarkFilled;
          break;
        default:
          StatusIcon = Undefined;
      }
      StatusIcon = <StatusIcon className="status-icon" x="8" y="5" />;
    }

    const maxLabelLength = 24;
    let labelText = label;
    if (label.length > maxLabelLength) {
      labelText = `${label.substring(0, maxLabelLength)}\u2026`;
    }

    let labelPosition = {
      textAnchor: 'start',
      x: 30,
      y: 18
    };

    if (type === 'Start' || type === 'End') {
      labelPosition = {
        dominantBaseline: 'middle',
        textAnchor: 'middle',
        x: '50%',
        y: '50%'
      };
    }

    return (
      <svg
        height={height}
        width={width}
        viewBox={`0 0 ${width} ${height}`}
        data-status={status}
        className={type}
      >
        <g>
          <rect width={width} height={height} />
          <g className="label">
            <title>{label}</title>
            {StatusIcon}
            <text {...labelPosition}>{labelText}</text>
            {children && children.length && (
              <ChevronDown className="chevron" x={width - 22} y="5" />
            )}
          </g>
        </g>
      </svg>
    );
  }
}

Node.defaultProps = {
  width: 100,
  height: 100
};
