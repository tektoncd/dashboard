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
/* istanbul ignore file */

import React, { Component } from 'react';
import classNames from 'classnames';

import {
  CheckmarkFilled20 as CheckmarkFilled,
  ChevronDown20 as ChevronDown,
  ChevronUp20 as ChevronUp,
  CloseFilled20 as CloseFilled,
  Undefined20 as Undefined
} from '@carbon/icons-react';

import Graph from './Graph'; // eslint-disable-line import/no-cycle
import InlineLoading from './InlineLoading';

export default class Node extends Component {
  handleClick = () => {
    this.props.onClick(this.props.label);
  };

  handleClickStep = stepName => {
    this.props.onClickStep(this.props.label, stepName);
  };

  render() {
    const {
      children,
      edges,
      height,
      id,
      isSelected,
      status,
      type,
      width,
      label = type
    } = this.props;

    let StatusIcon;
    // Steps should only display status icon on error
    // Tasks will always show an icon
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

    const maxLabelLength = 19;
    let labelText = label;
    if (label.length > maxLabelLength) {
      const charDisplay = maxLabelLength - 1;
      const labelStart = label.substring(0, Math.ceil(charDisplay / 2));
      const labelEnd = label.substring(
        label.length - Math.floor(charDisplay / 2)
      );
      labelText = `${labelStart}\u2026${labelEnd}`;
    }

    let labelPosition = {
      textAnchor: 'start',
      x: 36,
      y: 20
    };

    if (type === 'Start' || type === 'End') {
      labelPosition = {
        dominantBaseline: 'middle',
        textAnchor: 'middle',
        x: '50%',
        y: '50%'
      };
    }

    const labelHitboxProps = {
      x: isSelected ? 0 : 1,
      y: isSelected ? 0 : 1,
      width: isSelected ? width : width - 2,
      height: isSelected ? 30 : 28
    };

    const Chevron = children ? ChevronUp : ChevronDown;

    const nodeClassNames = classNames(type, {
      expanded: children,
      collapsed: !children,
      selected: isSelected
    });

    return (
      <svg
        height={height}
        width={width}
        viewBox={`0 0 ${width} ${height}`}
        data-status={status}
        className={nodeClassNames}
      >
        <g>
          <rect width={width} height={height} />
          <g className="label" onClick={this.handleClick}>
            <title>{label}</title>
            {type !== 'Start' && type !== 'End' && (
              <rect className="label-hitbox" {...labelHitboxProps} />
            )}
            {StatusIcon}
            <text {...labelPosition}>{labelText}</text>
            {type === 'Task' && (
              <Chevron className="chevron" x={width - 28} y="5" />
            )}
          </g>
          {children && (
            <Graph
              graph={{ id: `${id}_subgraph`, children, edges }}
              isSubGraph
              onClickStep={this.handleClickStep}
            />
          )}
        </g>
      </svg>
    );
  }
}

Node.defaultProps = {
  height: 100,
  onClick: () => {},
  onClickStep: () => {},
  width: 100
};
