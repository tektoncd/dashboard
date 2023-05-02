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
  args: {
    reason: 'Cancelled',
    status: 'False'
  },
  name: 'Cancelled - PipelineRun TEP-0058 graceful termination'
};

export const CancelledPipelineRun = {
  args: {
    reason: 'PipelineRunCancelled',
    status: 'False'
  },
  name: 'Cancelled - PipelineRun legacy'
};

export const CancelledTaskRun = {
  args: {
    reason: 'TaskRunCancelled',
    status: 'False'
  },
  name: 'Cancelled - TaskRun'
};

export const Failed = {
  args: { status: 'False' }
};

export const Pending = {
  args: {
    reason: 'Pending',
    status: 'Unknown'
  }
};

export const Queued = {};

export const Running = {
  args: { reason: 'Running', status: 'Unknown' }
};

export const Succeeded = {
  args: { status: 'True' }
};

export const SucceededWithWarning = {
  args: { hasWarning: true, status: 'True' },
  name: 'Succeeded with warning'
};
