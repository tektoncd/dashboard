/*
Copyright 2019-2023 The Tekton Authors
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

import DetailsHeader from './DetailsHeader';

const getTaskRun = ({ reason, status }) => ({
  status: {
    conditions: [
      {
        reason,
        status,
        type: 'Succeeded'
      }
    ]
  }
});

export default {
  args: {
    type: 'step'
  },
  argTypes: {
    type: {
      control: {
        type: 'inline-radio',
        options: ['step', 'taskRun']
      }
    }
  },
  component: DetailsHeader,
  parameters: {
    backgrounds: {
      default: 'white'
    }
  },
  title: 'DetailsHeader'
};

export const Cancelled = {
  render: args => (
    <DetailsHeader
      reason="TaskRunCancelled"
      status="terminated"
      displayName="build"
      taskRun={getTaskRun({ reason: 'TaskRunCancelled', status: 'False' })}
      {...args}
    />
  )
};

export const Completed = {
  render: args => (
    <DetailsHeader
      reason="Completed"
      status="terminated"
      displayName="build"
      taskRun={getTaskRun({ reason: 'Succeeded', status: 'True' })}
      {...args}
    />
  )
};

export const CompletedWithWarning = {
  render: args => (
    <DetailsHeader
      exitCode={1}
      hasWarning
      reason="Completed"
      status="terminated"
      displayName="build"
      taskRun={getTaskRun({ reason: 'Succeeded', status: 'True' })}
      {...args}
    />
  ),

  name: 'Completed with warning'
};

export const Failed = {
  render: args => (
    <DetailsHeader
      reason="Error"
      status="terminated"
      displayName="build"
      taskRun={getTaskRun({ reason: 'Failed', status: 'False' })}
      {...args}
    />
  )
};

export const Pending = {
  render: args => (
    <DetailsHeader
      taskRun={getTaskRun({ reason: 'Pending', status: 'Unknown' })}
      {...args}
    />
  )
};

export const Running = {
  render: args => (
    <DetailsHeader
      status="running"
      displayName="build"
      taskRun={getTaskRun({ reason: 'Running', status: 'Unknown' })}
      {...args}
    />
  )
};
