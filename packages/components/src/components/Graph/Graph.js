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
import React, { Component } from 'react';
import { Graph as VXGraph } from '@vx/network';
import ELK from 'elkjs/lib/elk.bundled';

import Node from './Node'; // eslint-disable-line import/no-cycle
import NodeLink from './NodeLink';

export default class Graph extends Component {
  state = {};

  componentDidMount() {
    this.layout();
  }

  componentDidUpdate(prevProps) {
    const { graph } = this.props;
    const { graph: prevGraph } = prevProps;
    if (graph !== prevGraph) {
      this.layout();
    }
  }

  layout = () => {
    const { graph, isSubGraph } = this.props;

    const elk = new ELK({
      defaultLayoutOptions: {
        'org.eclipse.elk.algorithm': isSubGraph
          ? 'org.eclipse.elk.box'
          : 'org.eclipse.elk.layered',
        'org.eclipse.elk.direction': 'DOWN',
        'org.eclipse.elk.edgeRouting': 'ORTHOGONAL',
        // 'org.eclipse.elk.interactive': true,
        'org.eclipse.elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
        'org.eclipse.elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
        'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers': isSubGraph
          ? 0
          : 40,
        'org.eclipse.elk.padding': '[top=26,left=0,bottom=1,right=0]',
        'org.eclipse.elk.separateConnectedComponents': false,
        'org.eclipse.elk.spacing.nodeNode': isSubGraph ? 0 : 40
      }
    });

    elk
      .layout(graph)
      .then(g => {
        this.setState({
          links: g.edges,
          nodes: g.children
        });
      })
      .catch(console.error);
  };

  render() {
    const { height, isSubGraph, onClickStep, onClickTask, width } = this.props;
    const { links, margin, nodes } = this.state;

    if (!nodes) {
      return null;
    }

    return (
      <svg
        className="graph"
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
        <VXGraph
          graph={{ links, nodes }}
          nodeComponent={c => (
            <Node
              onClick={isSubGraph ? onClickStep : onClickTask}
              onClickStep={isSubGraph ? undefined : onClickStep}
              {...c.node}
            />
          )}
          linkComponent={isSubGraph ? () => null : NodeLink}
        />
      </svg>
    );
  }
}

Graph.defaultProps = {
  isSubGraph: false,
  onClickStep: () => {},
  onClickTask: () => {}
};
