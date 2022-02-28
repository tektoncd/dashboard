/*
Copyright 2020-2022 The Tekton Authors
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

import StatusIcon from './StatusIcon';

export default {
  component: StatusIcon,
  args: { type: 'normal' },
  argTypes: {
    type: {
      control: {
        type: 'inline-radio',
        options: ['normal', 'inverse']
      }
    }
  },
  parameters: {
    backgrounds: {
      default: 'white'
    }
  },
  title: 'Components/StatusIcon'
};

export const CancelledGraceful = args => (
  <StatusIcon reason="Cancelled" status="False" {...args} />
);
CancelledGraceful.storyName =
  'Cancelled - PipelineRun TEP-0058 graceful termination';

export const CancelledPipelineRun = args => (
  <StatusIcon reason="PipelineRunCancelled" status="False" {...args} />
);
CancelledPipelineRun.storyName = 'Cancelled - PipelineRun legacy';

export const CancelledTaskRun = args => (
  <StatusIcon reason="TaskRunCancelled" status="False" {...args} />
);
CancelledTaskRun.storyName = 'Cancelled - TaskRun';

export const Failed = args => <StatusIcon status="False" {...args} />;

export const Pending = args => (
  <StatusIcon reason="Pending" status="Unknown" {...args} />
);

export const Queued = args => <StatusIcon {...args} />;

export const Running = args => (
  <StatusIcon reason="Running" status="Unknown" {...args} />
);

export const Succeeded = args => <StatusIcon status="True" {...args} />;

export const SucceededWithWarning = args => (
  <StatusIcon hasWarning status="True" {...args} />
);
SucceededWithWarning.storyName = 'Succeeded with warning';
