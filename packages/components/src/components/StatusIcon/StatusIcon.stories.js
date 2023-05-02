/*
Copyright 2020-2023 The Tekton Authors
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
        type: 'inline-radio'
      },
      options: ['normal', 'inverse']
    }
  },
  parameters: {
    backgrounds: {
      default: 'white'
    }
  },
  title: 'StatusIcon'
};

export const CancelledGraceful = {
  render: args => <StatusIcon reason="Cancelled" status="False" {...args} />,

  name: 'Cancelled - PipelineRun TEP-0058 graceful termination'
};

export const CancelledPipelineRun = {
  render: args => (
    <StatusIcon reason="PipelineRunCancelled" status="False" {...args} />
  ),

  name: 'Cancelled - PipelineRun legacy'
};

export const CancelledTaskRun = {
  render: args => (
    <StatusIcon reason="TaskRunCancelled" status="False" {...args} />
  ),

  name: 'Cancelled - TaskRun'
};

export const Failed = {
  render: args => <StatusIcon status="False" {...args} />
};

export const Pending = {
  render: args => <StatusIcon reason="Pending" status="Unknown" {...args} />
};

export const Queued = {};

export const Running = {
  render: args => <StatusIcon reason="Running" status="Unknown" {...args} />
};

export const Succeeded = {
  render: args => <StatusIcon status="True" {...args} />
};

export const SucceededWithWarning = {
  render: args => <StatusIcon hasWarning status="True" {...args} />,

  name: 'Succeeded with warning'
};
