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

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Node from './Node';
import Graph from './Graph';
import PipelineGraph from './PipelineGraph';
import ZoomablePipelineGraph from './ZoomablePipelineGraph';

import graph from './examples/graph.json';
import pipeline from './examples/pipeline.json';
import pipelineRun from './examples/pipelineRun.json';
import tasks from './examples/tasks.json';

/*
  TODO:
  - task node
    - selected
    - expanded
      - step
        - not_run
        - running
        - success
        - error
        - selected
 */

const taskProps = {
  type: 'Task',
  label: 'build-and-push',
  width: 200,
  height: 30
};

const expandedProps = {
  children: [
    {
      type: 'Step',
      id: '__step_build-and-push__build-image',
      label: 'build-image',
      width: 200,
      height: 30
    },
    {
      type: 'Step',
      id: '__step_build-and-push__push-image',
      label: 'push-image',
      width: 200,
      height: 30
    }
  ],
  edges: [],
  height: 90
};

storiesOf('Experimental/Graph/Node', module)
  .addDecorator(story => <div className="graph">{story()}</div>)
  .add('start', () => <Node type="Start" width="60" height="60" />)
  .add('end', () => <Node type="End" width="60" height="60" />)
  .add('step', () => <Node type="Step" label="build" />)
  .add('step selected', () => <Node type="Step" label="build" isSelected />)
  .add('task', () => <Node {...taskProps} />)
  .add('task error', () => <Node {...taskProps} status="error" />)
  .add('task running', () => <Node {...taskProps} status="running" />)
  .add('task success', () => <Node {...taskProps} status="success" />)
  .add('task expanded', () => (
    <Node {...taskProps} status="success" {...expandedProps} />
  ))
  .add('task selected', () => (
    <Node {...taskProps} status="success" {...expandedProps} isSelected />
  ));

storiesOf('Experimental/Graph/Graph', module).add('default', () => (
  <Graph graph={graph} />
));

storiesOf('Experimental/Graph/PipelineGraph', module).add('default', () => (
  <PipelineGraph
    onClickStep={action('onClickStep')}
    onClickTask={action('onClickTask')}
    pipeline={pipeline}
    pipelineRun={pipelineRun}
    tasks={tasks}
  />
));

storiesOf('Experimental/Graph/ZoomablePipelineGraph', module).add(
  'default',
  () => (
    <ZoomablePipelineGraph
      onClickStep={action('onClickStep')}
      onClickTask={action('onClickTask')}
      pipeline={pipeline}
      pipelineRun={pipelineRun}
      tasks={tasks}
    />
  )
);
