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

import Graph from './Graph';
import { cardHeight, cardWidth, shapeSize } from '../../constants';
import { getDAG } from '../../newGraph';

import {
  example1,
  example2,
  example3,
  example7Pipeline,
  example8,
  finallyPipeline,
  releasePipeline,
  whenExpressionsPipelineRun
} from '../examples';

export default {
  component: Graph,
  args: {
    direction: 'RIGHT',
    id: 'id'
  },
  argTypes: {
    direction: {
      control: { type: 'inline-radio' },
      options: ['DOWN', 'RIGHT']
    }
  },
  title: 'Graph'
};

const cardConfig = {
  height: cardHeight,
  type: 'card',
  width: cardWidth
};

const iconConfig = {
  height: shapeSize,
  type: 'icon',
  width: shapeSize
};

export const Detailed1 = {
  args: {
    ...example1(cardConfig)
  }
};

export const Detailed2 = {
  args: {
    ...example2(cardConfig)
  }
};

export const Detailed3 = {
  args: {
    ...example3(cardConfig)
  }
};

export const Condensed1 = {
  args: {
    ...example1(iconConfig),
    type: 'condensed'
  }
};

export const Condensed2 = {
  args: {
    ...example2(iconConfig),
    type: 'condensed'
  }
};

export const Condensed3 = {
  args: {
    ...example3(iconConfig),
    type: 'condensed'
  }
};

export const DAG1 = {
  args: {
    ...getDAG({
      pipeline: example7Pipeline,
      pipelineRun: true,
      trigger: { type: 'manual' }
    })
  }
};

export const DAG2Wide = {
  args: {
    ...getDAG({
      pipeline: releasePipeline,
      pipelineRun: true,
      trigger: { type: 'timer' }
    })
  }
};

export const DAG3Finally = {
  args: {
    ...getDAG({
      pipeline: finallyPipeline,
      pipelineRun: true,
      trigger: { type: 'git' }
    })
  }
};

export const DAG4WhenExpressions = {
  args: {
    ...getDAG({
      pipeline: { spec: whenExpressionsPipelineRun.spec.pipelineSpec },
      pipelineRun: true,
      trigger: { type: 'webhook' }
    })
  }
};

export const DAG5Trigger = {
  args: {
    ...getDAG({
      pipeline: example7Pipeline,
      pipelineRun: true,
      trigger: { type: 'trigger' }
    })
  }
};

export const DAG6NoTrigger = {
  args: {
    ...getDAG({
      pipeline: example7Pipeline,
      pipelineRun: true
    })
  }
};

// Uses data from https://reaflow.dev/?path=/story/demos-basic--many-nodes
// See https://github.com/reaviz/reaflow/blob/b7a4e815e15a2dff0c9481e5841b4a1dd4bf5896/src/layout/elkLayout.ts for config comparison
export const Order = {
  args: {
    direction: 'DOWN',
    ...example8({
      ...cardConfig,
      width: cardWidth / 2
    })
  }
};
