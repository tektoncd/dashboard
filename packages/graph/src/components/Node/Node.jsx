/*
Copyright 2022-2024 The Tekton Authors
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

import { useState } from 'react';
import {
  CardNode,
  CardNodeColumn,
  // CardNodeLabel,
  CardNodeTitle,
  // CardNodeSubtitle
  ShapeNode
} from '@carbon/charts-react';
// import { ChevronDown } from '@carbon/icons-react';

import StatusIcon from '../StatusIcon';

export default function Node({
  // id,
  x,
  y,
  height,
  width,
  status,
  title,
  type = 'card'
}) {
  let shapeNode;
  // if (['start', 'end'].includes(id)) {
  //   shapeNode = <ShapeNode />;
  // } else
  if (type === 'icon') {
    shapeNode = (
      <ShapeNode
        renderIcon={<StatusIcon status={status} title={title} />}
        size={width}
        title=""
      />
    );
  }

  const [expanded, setExpanded] = useState(false);
  return (
    <foreignObject
      transform={`translate(${x},${y})`}
      height={height}
      width={width}
      style={{ overflow: 'visible' }}
    >
      <div style={{ height, width }}>
        {shapeNode || (
          <CardNode
            className={`card-status-${status}`}
            _href="#"
            _onClick={() => setExpanded(!expanded)}
          >
            <CardNodeColumn>
              <StatusIcon status={status} />
            </CardNodeColumn>
            <CardNodeColumn>
              <CardNodeTitle>
                <span title={title}>{title}</span>
              </CardNodeTitle>
              {/* <CardNodeSubtitle>Description</CardNodeSubtitle> */}
              {/* {expanded && <CardNodeLabel>Label</CardNodeLabel>} */}
            </CardNodeColumn>
            {/* <CardNodeColumn farsideColumn>
              <ChevronDown />
            </CardNodeColumn> */}
          </CardNode>
        )}
      </div>
    </foreignObject>
  );
}
