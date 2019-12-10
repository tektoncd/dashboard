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
import { buildGraphData } from '@tektoncd/dashboard-utils';

import Graph from './Graph';

export default class PipelineGraph extends Component {
  state = {
    expanded: {},
    graph: null
  };

  componentDidMount() {
    this.buildGraph();
  }

  componentDidUpdate(prevProps, prevState) {
    const { expanded } = this.state;
    const { expanded: prevExpanded } = prevState;
    if (expanded !== prevExpanded) {
      this.buildGraph();
    }
  }

  onClickTask = taskName => {
    const { expanded } = this.state;
    this.setState({
      expanded: {
        ...expanded,
        [taskName]: !expanded[taskName]
      }
    });
    this.props.onClickTask(taskName);
  };

  buildGraph() {
    const { pipeline, pipelineRun, tasks } = this.props;
    const { expanded } = this.state;
    const graph = buildGraphData({ expanded, pipeline, pipelineRun, tasks });
    this.setState({ graph });
  }

  render() {
    const { graph } = this.state;
    return graph ? (
      <Graph
        graph={graph}
        onClickStep={this.props.onClickStep}
        onClickTask={this.onClickTask}
      />
    ) : null;
  }
}

PipelineGraph.defaultProps = {
  onClickStep: () => {},
  onClickTask: () => {}
};
