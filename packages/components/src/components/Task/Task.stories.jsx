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

import { useState } from 'react';
import { action } from '@storybook/addon-actions';

import Task from './Task';

export default {
  args: {
    displayName: 'A Task',
    onSelect: action('selected'),
    taskRun: {}
  },
  component: Task,
  decorators: [
    Story => (
      <div style={{ width: '250px' }}>
        <Story />
      </div>
    )
  ],
  title: 'Task'
};

export const Succeeded = { args: { succeeded: 'True' } };

export const SucceededWithWarning = {
  args: {
    ...Succeeded.args,
    steps: [{ terminated: { exitCode: 1, reason: 'Completed' } }]
  },
  name: 'Succeeded with warning'
};

export const Failed = { args: { succeeded: 'False' } };
export const Unknown = { args: { succeeded: 'Unknown' } };

export const Pending = { args: { ...Unknown.args, reason: 'Pending' } };

export const Running = { args: { ...Unknown.args, reason: 'Running' } };

export const Expanded = args => {
  const [selectedStepId, setSelectedStepId] = useState();
  return (
    <Task
      {...args}
      expanded
      onSelect={({ selectedStepId: stepId }) => setSelectedStepId(stepId)}
      reason="Running"
      selectedStepId={selectedStepId}
      steps={[
        { name: 'lint', terminated: { exitCode: 0, reason: 'Completed' } },
        { name: 'test', terminated: { exitCode: 1, reason: 'Completed' } },
        { name: 'build', running: {} },
        { name: 'deploy', running: {} }
      ]}
      succeeded="Unknown"
    />
  );
};
