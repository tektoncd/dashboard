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
import { Graph } from '@vx/network';
import ELK from 'elkjs/lib/elk.bundled';

import Node from './Node';
import NodeLink from './NodeLink';

export default class PipelineGraph extends PureComponent {
  state = {};

  componentDidMount() {
    this.computeDag();
  }

  computeDag = () => {
    const elk = new ELK({
      defaultLayoutOptions: {
        'elk.algorithm': 'org.eclipse.elk.layered',
        'org.eclipse.elk.direction': 'DOWN',
        'org.eclipse.elk.edgeRouting': 'ORTHOGONAL',
        'org.eclipse.elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
        'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers': 30,
        'org.eclipse.elk.insideSelfLoops.activate': true,
        'elk.separateConnectedComponents': false,
        'elk.spacing.nodeNode': 40,
        'elk.padding': '[top=15,left=10,bottom=15,right=10]',
        hierarchyHandling: 'INCLUDE_CHILDREN'
      }
    });

    elk
      .layout(this.props.graph)
      .then(g => {
        this.setState({
          links: g.edges,
          nodes: g.children
        });
      })
      .catch(console.error);
  };

  render() {
    const { height, width } = this.props;
    const { links, margin, nodes } = this.state;

    if (!nodes) {
      return null;
    }

    return (
      <svg
        className="pipeline-graph"
        height={height}
        style={{ margin }}
        width={width}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMin meet"
      >
        <defs>
          <marker
            id="edge-arrow"
            viewBox="0 -5 10 10"
            markerUnits="strokeWidth"
            markerWidth="8.4"
            markerHeight="14"
            orient="auto"
            refY="0"
            refX="10"
          >
            <path d="M0,-5L10,0L0,5" />
          </marker>
        </defs>
        <Graph
          graph={{ links, nodes }}
          nodeComponent={c => (
            <Node onClick={n => this.expandCallback(n)} {...c.node} />
          )}
          linkComponent={NodeLink}
        />
      </svg>
    );
  }
}
