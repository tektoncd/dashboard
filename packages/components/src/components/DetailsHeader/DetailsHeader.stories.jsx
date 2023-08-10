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
        type: 'inline-radio'
      },
      options: ['step', 'taskRun']
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
  args: {
    reason: 'TaskRunCancelled',
    status: 'terminated',
    displayName: 'build',
    taskRun: getTaskRun({ reason: 'TaskRunCancelled', status: 'False' })
  }
};

export const Completed = {
  args: {
    reason: 'Completed',
    status: 'terminated',
    displayName: 'build',
    taskRun: getTaskRun({ reason: 'Succeeded', status: 'True' })
  }
};

export const CompletedWithWarning = {
  args: {
    displayName: 'build',
    exitCode: 1,
    hasWarning: true,
    reason: 'Completed',
    status: 'terminated',
    taskRun: getTaskRun({ reason: 'Succeeded', status: 'True' })
  },
  name: 'Completed with warning'
};

export const Failed = {
  args: {
    displayName: 'build',
    reason: 'Error',
    status: 'terminated',
    taskRun: getTaskRun({ reason: 'Failed', status: 'False' })
  }
};

export const Pending = {
  args: {
    taskRun: getTaskRun({ reason: 'Pending', status: 'Unknown' })
  }
};

export const Running = {
  args: {
    displayName: 'build',
    status: 'running',
    taskRun: getTaskRun({ reason: 'Running', status: 'Unknown' })
  }
};
