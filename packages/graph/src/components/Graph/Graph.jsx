/*
Copyright 2022-2025 The Tekton Authors
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

import { useEffect, useState } from 'react';
import ELK from 'elkjs/lib/elk.bundled';

import { ArrowRightMarker } from '@carbon/charts-react';

import Edge from '../Edge';
import Node from '../Node/Node';

function buildEdges({ direction, edges }) {
  return edges.map(edge => (
    <Edge direction={direction} key={edge.id} edge={edge} />
  ));
}

function buildNodes(nodes) {
  return nodes.map(node => {
    return (
      <Node
        id={node.id}
        key={node.id}
        x={node.x}
        y={node.y}
        height={node.height}
        width={node.width}
        status={node.status}
        title={node.title}
        type={node.type}
      />
    );
  });
}

export default function Graph({
  direction = 'RIGHT',
  id,
  nodes,
  edges,
  type = 'detailed'
}) {
  const elk = new ELK({
    defaultLayoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.mergeEdges': true, // avoid multiple input / output ports per node
      // TODO: test
      // 'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED', // LEFTDOWN
      // 'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      // 'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      // 'crossingMinimization.semiInteractive': true,
      // 'elk.layered.spacing.edgeNodeBetweenLayers': '50',
      // 'elk.layered.unnecessaryBendpoints': true,
      // 'org.eclipse.elk.layered.layering.strategy': 'INTERACTIVE',
      // 'elk.padding': '[left=50, top=50, right=50, bottom=50]',
      // portConstraints: 'FIXED_ORDER', // this gives correct node order but ignores mergeEdges and has other issues
      // 'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      // 'elk.layered.considerModelOrder.crossingCounterNodeInfluence': 0.001,
      // 'elk.layered.considerModelOrder.crossingCounterPortInfluence': 0.001,
      separateConnectedComponents: false,
      'spacing.nodeNode': type === 'detailed' ? 20 : 5,
      'spacing.nodeNodeBetweenLayers': type === 'detailed' ? 50 : 20
    }
  });

  const [positions, setPositions] = useState(null);

  const graph = {
    id,
    children: nodes,
    edges
  };

  useEffect(() => {
    elk
      .layout(graph)
      .then(g => setPositions(g))
      .catch(console.error);
  }, [direction]);

  if (!positions) {
    return null;
  }

  const {
    children: graphNodes,
    edges: graphEdges,
    height: graphHeight,
    width: graphWidth
  } = positions;

  const edgeElements = buildEdges({ direction, edges: graphEdges });
  const nodeElements = buildNodes(graphNodes);

  return (
    <div
      className="tkn--pipeline-graph"
      // style={{
      //   height: graphHeight,
      //   width: graphWidth
      // }}
    >
      <svg style={{ height: graphHeight, width: graphWidth }}>
        <defs>
          <ArrowRightMarker id="arrowRight" height={8} width={7.5} />
        </defs>
        {edgeElements}
        {nodeElements}
      </svg>
    </div>
  );
}
