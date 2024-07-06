/*
Copyright 2020-2024 The Tekton Authors
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
/* eslint-disable formatjs/no-literal-string-in-jsx */

import {
  Pending as DefaultStepIcon,
  PendingFilled as DefaultTaskIcon,
  UndefinedFilled as UndefinedIcon
} from '@carbon/react/icons';

import StatusIcon from './StatusIcon';

import './StatusIcon.stories.scss';

export default {
  component: StatusIcon,
  args: { type: 'normal' },
  argTypes: {
    type: {
      control: {
        type: 'inline-radio'
      },
      if: {
        arg: 'DefaultIcon',
        exists: false
      },
      options: ['normal', 'inverse']
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

export const DefaultTask = {
  args: { DefaultIcon: DefaultTaskIcon },
  name: 'Task default - no status received yet'
};

export const DefaultStep = {
  args: { DefaultIcon: DefaultStepIcon },
  name: 'Step default - no status received yet'
};

export const CustomRun = {
  args: { DefaultIcon: UndefinedIcon },
  name: 'CustomRun (unknown status)'
};

export const AllIcons = {
  render() {
    return (
      <div className="status-icons-list">
        <h3>PipelineRun</h3>
        <ul>
          <li>
            <StatusIcon {...CancelledPipelineRun.args} />
            <span>Cancelled</span>
          </li>
          <li>
            <StatusIcon {...Failed.args} />
            <span>Failed</span>
          </li>
          <li>
            <StatusIcon {...Pending.args} />
            <span>Pending</span>
          </li>
          <li>
            <StatusIcon {...Queued.args} />
            <span>Queued</span>
          </li>
          <li>
            <StatusIcon {...Running.args} />
            <span>Running</span>
          </li>
          <li>
            <StatusIcon {...Succeeded.args} />
            <span>Succeeded</span>
          </li>
          <li>
            <StatusIcon {...SucceededWithWarning.args} />
            <span>Succeeded with warning</span>
          </li>
        </ul>

        <h3>TaskRun</h3>
        <ul>
          <li>
            <StatusIcon {...CancelledPipelineRun.args} />
            <span>Cancelled</span>
          </li>
          <li>
            <StatusIcon {...Failed.args} />
            <span>Failed</span>
          </li>
          <li>
            <StatusIcon {...Pending.args} />
            <span>Pending</span>
          </li>
          <li>
            <StatusIcon {...Queued.args} />
            <span>Queued</span>
          </li>
          <li>
            <StatusIcon {...Running.args} />
            <span>Running</span>
          </li>
          <li>
            <StatusIcon {...Succeeded.args} />
            <span>Succeeded</span>
          </li>
          <li>
            <StatusIcon {...SucceededWithWarning.args} />
            <span>Succeeded with warning</span>
          </li>
          <li>
            <StatusIcon {...DefaultTask.args} />
            <span>Default - no status received yet</span>
          </li>
          <li>
            <StatusIcon {...CustomRun.args} />
            <span>CustomRun - custom status</span>
          </li>
        </ul>

        <h3>Step</h3>
        <ul>
          <li>
            <StatusIcon {...Failed.args} type="inverse" />
            <span>Failed</span>
          </li>
          <li>
            <StatusIcon {...Running.args} type="inverse" />
            <span>Running</span>
          </li>
          <li>
            <StatusIcon {...Succeeded.args} type="inverse" />
            <span>Succeeded</span>
          </li>
          <li>
            <StatusIcon {...SucceededWithWarning.args} type="inverse" />
            <span>Succeeded with warning</span>
          </li>
          <li>
            <StatusIcon {...DefaultStep.args} />
            <span>Default - no status received yet</span>
          </li>
        </ul>
      </div>
    );
  }
};
