/*
Copyright 2019-2025 The Tekton Authors
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

import { useArgs } from 'storybook/preview-api';

import TaskTree from './TaskTree';

export default {
  args: {
    selectedRetry: '',
    selectedStepId: undefined,
    selectedTaskId: undefined,
    skippedTasks: [{ name: 'Task 2' }],
    taskRuns: [
      {
        metadata: {
          labels: { 'tekton.dev/pipelineTask': 'Task 1' },
          uid: 'task'
        },
        status: {
          conditions: [
            { reason: 'Completed', status: 'True', type: 'Succeeded' }
          ],
          steps: [
            { name: 'build', terminated: { exitCode: 0, reason: 'Completed' } },
            { name: 'test', terminated: { exitCode: 1, reason: 'Completed' } }
          ]
        }
      },
      {
        metadata: {
          labels: { 'tekton.dev/pipelineTask': 'Task 2' },
          uid: 'task2'
        },
        status: {
          conditions: [],
          steps: [{ name: 'build' }, { name: 'test' }]
        }
      },
      {
        metadata: {
          labels: { 'tekton.dev/pipelineTask': 'Task 3' },
          uid: 'task3'
        },
        status: {
          conditions: [
            { reason: 'Failed', status: 'False', type: 'Succeeded' }
          ],
          retriesStatus: [
            {
              conditions: [
                {
                  reason: 'Failed',
                  status: 'False',
                  type: 'Succeeded'
                }
              ],
              steps: [
                { name: 'step 1', terminated: { reason: 'Error' } },
                // The next step will be displayed as 'Not run' by the Dashboard
                { name: 'step 2', terminated: { reason: 'Error' } }
              ]
            }
          ],
          steps: [
            { name: 'step 1', terminated: { reason: 'Error' } },
            // The next step will be displayed as 'Not run' by the Dashboard
            { name: 'step 2', terminated: { reason: 'Error' } }
          ]
        }
      },
      {
        metadata: {
          labels: { 'tekton.dev/pipelineTask': 'Task 4' },
          uid: 'task4'
        },
        pipelineTaskName: 'Task 4',
        status: {
          conditions: [
            { reason: 'Running', status: 'Unknown', type: 'Succeeded' }
          ],
          steps: [
            { name: 'step 1', terminated: { reason: 'Completed' } },
            { name: 'step 2', running: {} }
          ]
        }
      }
    ]
  },
  component: TaskTree,
  decorators: [
    Story => (
      <div style={{ width: '250px' }}>
        <Story />
      </div>
    )
  ],
  title: 'TaskTree'
};

export const Default = {
  render: args => {
    const [, updateArgs] = useArgs();

    return (
      <TaskTree
        {...args}
        onRetryChange={selectedRetry =>
          updateArgs({ selectedRetry: `${selectedRetry}` })
        }
        onSelect={({ selectedStepId: stepId, selectedTaskId: taskId }) => {
          updateArgs({ selectedStepId: stepId, selectedTaskId: taskId });
        }}
      />
    );
  }
};
