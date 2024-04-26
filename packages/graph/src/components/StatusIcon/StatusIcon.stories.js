/*
Copyright 2023-2024 The Tekton Authors
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
  args: { status: 'success', title: 'some-task' },
  argTypes: {
    status: {
      control: { type: 'select' },
      options: [
        'failed',
        'git',
        'manual',
        'pending',
        'running',
        'success',
        'success-warning',
        'timer',
        'trigger',
        'warning',
        'webhook'
      ]
    }
  },
  title: 'StatusIcon'
};

export const Failed = {
  args: {
    status: 'failed'
  }
};

export const Git = {
  args: {
    status: 'git'
  }
};

export const Manual = {
  args: {
    status: 'manual'
  }
};

export const Pending = {
  args: {
    status: 'pending'
  }
};

export const Running = {
  args: {
    status: 'running'
  }
};

export const Success = {
  args: {
    status: 'success'
  }
};

export const SuccessWarning = {
  args: {
    status: 'success-warning'
  }
};

export const Timer = {
  args: {
    status: 'timer'
  }
};

export const Trigger = {
  args: {
    status: 'trigger'
  }
};

export const Warning = {
  args: {
    status: 'warning'
  }
};

export const Webhook = {
  args: {
    status: 'webhook'
  }
};
