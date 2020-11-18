/*
Copyright 2019-2020 The Tekton Authors
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

import Node from './Node';

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

export default {
  decorators: [storyFn => <div className="graph">{storyFn()}</div>],
  parameters: {
    backgrounds: {
      default: 'white'
    }
  },
  title: 'Experimental/Components/Graph/Node'
};

export const Start = () => <Node type="Start" width="60" height="60" />;

export const End = () => <Node type="End" width="60" height="60" />;

export const Step = () => <Node type="Step" label="build" />;

export const StepSelected = () => <Node type="Step" label="build" isSelected />;

export const Task = () => <Node {...taskProps} />;

export const TaskError = () => <Node {...taskProps} status="error" />;

export const TaskRunning = () => <Node {...taskProps} status="running" />;

export const TaskSuccess = () => <Node {...taskProps} status="success" />;

export const TaskExpanded = () => (
  <Node {...taskProps} status="success" {...expandedProps} />
);

export const TaskSelected = () => (
  <Node {...taskProps} status="success" {...expandedProps} isSelected />
);
