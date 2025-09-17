/*
Copyright 2019-2024 The Tekton Authors
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

import { dashboardReasonSkipped } from '@tektoncd/dashboard-utils';
import DetailsHeader from './DetailsHeader';

const getTaskRun = ({ reason, status, terminationReason, startTime, completionTime, description }) => ({
  status: {
    conditions: [
      {
        reason,
        status,
        terminationReason,
        type: 'Succeeded'
      }
    ],
    completionTime: completionTime,
    startTime: startTime,
    taskSpec: {
      description: description
    }
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

export const SkippedTask = {
  args: {
    reason: dashboardReasonSkipped,
    displayName: 'build',
    taskRun: {},
    type: 'taskRun'
  },
  argTypes: {
    type: {
      control: false
    }
  }
};

export const SkippedStep = {
  args: {
    reason: 'Completed',
    status: 'terminated',
    stepStatus: { terminationReason: 'Skipped' },
    displayName: 'build',
    type: 'step'
  },
  argTypes: {
    type: {
      control: false
    }
  }
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

export const WithDescription = {
  args: {
    displayName: 'build',
    reason: 'Completed',
    status: 'terminated',
    taskRun: getTaskRun({ reason: 'Succeeded', status: 'True', description: 'This is a task description'}),
  }
};

export const WithDuration = {
  args: {
    displayName: 'build',
    reason: 'Completed',
    status: 'terminated',
    taskRun: getTaskRun({ reason: 'Succeeded', status: 'True', startTime: '2025-09-11T11:50:10Z', completionTime: '2025-09-11T11:55:15Z'}),
  }
};

export const WithDurationAndDescription = {
  args: {
    displayName: 'build',
    reason: 'Completed',
    status: 'terminated',
    taskRun: getTaskRun({ reason: 'Succeeded', status: 'True', startTime: '2025-09-11T11:50:10Z', completionTime: '2025-09-11T11:55:15Z', description: 'This is a task description'}),
  }
};
