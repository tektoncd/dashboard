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
import { action } from '@storybook/addon-actions';

import PipelineGraph from './PipelineGraph';

import pipeline from './examples/pipeline.json';
import pipelineRun from './examples/pipelineRun.json';
import tasks from './examples/tasks.json';

export default {
  parameters: {
    backgrounds: {
      default: 'white'
    }
  },
  title: 'Experimental/Components/Graph/PipelineGraph'
};

export const Base = () => (
  <PipelineGraph
    onClickStep={action('onClickStep')}
    onClickTask={action('onClickTask')}
    pipeline={pipeline}
    pipelineRun={pipelineRun}
    tasks={tasks}
  />
);
