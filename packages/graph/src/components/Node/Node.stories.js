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

import Node from './Node';
import { cardHeight, cardWidth, shapeSize } from '../../constants';

export default {
  component: Node,
  args: {
    height: cardHeight,
    status: 'success',
    title: 'some-task',
    type: 'card',
    width: cardWidth,
    x: 0,
    y: 0
  },
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
    },
    type: {
      control: { type: 'inline-radio' },
      options: ['card', 'icon']
    }
  },
  title: 'Node'
};

export const TaskFailed = {
  args: {
    status: 'failed'
  }
};

export const TaskPending = {
  args: {
    status: 'pending'
  }
};

export const TaskRunning = {
  args: {
    status: 'running'
  }
};

export const TaskSuccess = {
  args: {
    status: 'success'
  }
};

export const TaskSuccessWarning = {
  args: {
    status: 'success-warning'
  }
};

export const TaskWarning = {
  args: {
    status: 'warning'
  }
};

export const Trigger = {
  args: {
    status: 'trigger',
    type: 'icon',
    width: shapeSize
  }
};

export const TriggerGit = {
  args: {
    ...Trigger.args,
    status: 'git'
  }
};

export const TriggerManual = {
  args: {
    ...Trigger.args,
    status: 'manual'
  }
};

export const TriggerTimer = {
  args: {
    ...Trigger.args,
    status: 'timer'
  }
};

export const TriggerWebhook = {
  args: {
    ...Trigger.args,
    status: 'webhook'
  }
};
