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

import Node from './Node';
import PipelineGraph from './PipelineGraph';
import graph from './sample.json';

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
  width: 150,
  height: 26
};

storiesOf('Graph/Node', module)
  .addDecorator(story => <div className="pipeline-graph">{story()}</div>)
  .add('start', () => <Node type="Start" />)
  .add('end', () => <Node type="End" />)
  .add('step', () => <Node type="Step" label="build" />)
  .add('task', () => <Node {...taskProps} />)
  .add('task error', () => <Node {...taskProps} status="error" />)
  .add('task running', () => <Node {...taskProps} status="running" />)
  .add('task success', () => <Node {...taskProps} status="success" />)
  .add('task expandable', () => (
    <Node {...taskProps} status="success" width="160" children={['foo']} /> // eslint-disable-line react/no-children-prop
  ));

storiesOf('Graph/PipelineGraph', module).add('default', () => (
  <PipelineGraph graph={graph} width={450} height={500} />
));
