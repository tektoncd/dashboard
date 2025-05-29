/*
Copyright 2020-2025 The Tekton Authors
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

import TaskRunDetails from './TaskRunDetails';

const paramKey = 'k';
const paramValue = 'v';
const params = [
  {
    name: paramKey,
    value: paramValue
  }
];
const results = [{ name: 'message', value: 'hello' }];

export default {
  component: TaskRunDetails,
  title: 'TaskRunDetails'
};

export const Default = {
  args: {
    taskRun: {
      metadata: { name: 'my-task', namespace: 'my-namespace' },
      spec: {
        params,
        taskSpec: {
          params: [
            {
              name: params[0].name,
              description: 'A useful description of the param…'
            }
          ],
          results: [
            {
              name: results[0].name,
              description: 'A useful description of the result…'
            }
          ]
        }
      },
      status: {
        completionTime: '2021-03-03T15:25:34Z',
        podName: 'my-task-h7d6j-pod-pdtb7',
        startTime: '2021-03-03T15:25:27Z',
        results
      }
    }
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return (
      <TaskRunDetails
        {...args}
        onViewChange={selectedView => updateArgs({ view: selectedView })}
      />
    );
  }
};

export const WithWarning = {
  args: {
    taskRun: {
      metadata: { name: 'my-task', namespace: 'my-namespace' },
      spec: {
        params
      },
      status: {
        completionTime: '2021-03-03T15:25:34Z',
        podName: 'my-task-h7d6j-pod-pdtb7',
        conditions: [
          {
            reason: 'Succeeded',
            status: 'True',
            type: 'Succeeded'
          }
        ],
        steps: [
          {
            terminated: {
              exitCode: 1,
              reason: 'Completed'
            }
          }
        ],
        startTime: '2021-03-03T15:25:27Z',
        results
      }
    }
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return (
      <TaskRunDetails
        {...args}
        onViewChange={selectedView => updateArgs({ view: selectedView })}
      />
    );
  }
};

export const Pod = {
  args: {
    pod: {
      events: [
        {
          metadata: {
            name: 'guarded-pr-vkm6w-check-file-pod.1721f00ca1846de4',
            namespace: 'test',
            uid: '0f4218f0-270a-408d-b5bd-56fc35dda853',
            resourceVersion: '2047658',
            creationTimestamp: '2022-10-27T13:27:54Z'
          },
          involvedObject: {
            kind: 'Pod',
            namespace: 'test',
            name: 'guarded-pr-vkm6w-check-file-pod',
            uid: '939a4823-2203-4b5a-8c00-6a2c9f15549d',
            apiVersion: 'v1',
            resourceVersion: '2047624'
          },
          reason: 'Scheduled',
          message:
            'Successfully assigned test/guarded-pr-vkm6w-check-file-pod to tekton-dashboard-control-plane',
          '…': ''
        },
        {
          metadata: {
            name: 'guarded-pr-vkm6w-check-file-pod.1721f00cb6ef6ea7',
            namespace: 'test',
            uid: 'd1c8e367-66d1-4cd7-a04b-e49bdf9f322e',
            resourceVersion: '2047664',
            creationTimestamp: '2022-10-27T13:27:54Z'
          },
          involvedObject: {
            kind: 'Pod',
            namespace: 'test',
            name: 'guarded-pr-vkm6w-check-file-pod',
            uid: '939a4823-2203-4b5a-8c00-6a2c9f15549d',
            apiVersion: 'v1',
            resourceVersion: '2047657',
            fieldPath: 'spec.initContainers{prepare}'
          },
          reason: 'Pulled',
          message:
            'Container image "gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/entrypoint:v0.40.0@sha256:ee6c81fa567c97b4dba0fb315fa038c671a0250ac3a5d43e6ccf8a91e86e6352" already present on machine',
          '…': ''
        }
      ],
      resource: {
        kind: 'Pod',
        apiVersion: 'v1',
        metadata: {
          name: 'some-pod-name',
          namespace: 'test',
          uid: '939a4823-2203-4b5a-8c00-6a2c9f15549d',
          resourceVersion: '2047732',
          creationTimestamp: '2022-10-27T13:27:49Z'
        },
        spec: {
          '…': ''
        }
      }
    },
    taskRun: {
      metadata: { name: 'my-task' },
      spec: {},
      status: {
        completionTime: '2021-03-03T15:25:34Z',
        podName: 'my-task-h7d6j-pod-pdtb7',
        startTime: '2021-03-03T15:25:27Z'
      }
    }
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return (
      <TaskRunDetails
        {...args}
        onViewChange={selectedView => updateArgs({ view: selectedView })}
      />
    );
  }
};

export const Skipped = {
  args: {
    ...Pod.args,
    skippedTask: {
      reason: 'When Expressions evaluated to false',
      whenExpressions: [{ cel: `'yes'=='missing'` }]
    }
  }
};
