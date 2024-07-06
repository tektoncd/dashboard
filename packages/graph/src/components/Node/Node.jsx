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
import ShapeNode from '@carbon/charts-react/diagrams/ShapeNode/ShapeNode';
import CardNode, {
  CardNodeColumn,
  // CardNodeLabel,
  CardNodeTitle
  // CardNodeSubtitle
} from '@carbon/charts-react/diagrams/CardNode';
import { Tooltip } from '@carbon/react';
// import { ChevronDown16 } from '@carbon/icons-react';

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
        renderIcon={
          // TODO: carbon11 - review tooltip usage
          <Tooltip
            align="start"
            showIcon
            renderIcon={() => <StatusIcon status={status} title={title} />}
          >
            {title}
          </Tooltip>
        }
        size={width}
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
            // TODO: feature request - custom class so we can set color etc. in CSS
            // https://github.com/carbon-design-system/carbon-charts/issues/1221
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
              <ChevronDown16 />
            </CardNodeColumn> */}
          </CardNode>
        )}
      </div>
    </foreignObject>
  );
}
