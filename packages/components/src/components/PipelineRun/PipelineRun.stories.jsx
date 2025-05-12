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

import { useArgs } from '@storybook/preview-api';
import { labels as labelConstants } from '@tektoncd/dashboard-utils';

import PipelineRun from '.';
import LogsToolbar from '../LogsToolbar';

const task = {
  metadata: {
    name: 'task1',
    namespace: 'default',
    resourceVersion: '1902552',
    selfLink: '/apis/tekton.dev/v1alpha1/namespaces/default/tasks/task1',
    uid: '071c7563-c067-11e9-80e7-080027e83fe1'
  },
  spec: {
    steps: [
      {
        args: ['-c', 'echo storybook;'],
        command: ['/bin/bash'],
        image: 'ubuntu',
        name: 'build'
      }
    ]
  }
};

function getTaskRun({ exitCode = 0, name, pipelineTaskName }) {
  return {
    metadata: {
      labels: {
        [labelConstants.PIPELINE_TASK]: pipelineTaskName
      },
      name,
      namespace: 'default',
      uid: name
    },
    spec: {
      params: {},
      serviceAccountName: 'default',
      taskRef: { kind: 'Task', name: 'task1' },
      timeout: '24h0m0s'
    },
    status: {
      completionTime: '2019-08-21T17:15:31Z',
      conditions: [
        {
          lastTransitionTime: '2019-08-21T17:15:31Z',
          message: 'All Steps have completed executing',
          reason: 'Succeeded',
          status: 'True',
          type: 'Succeeded'
        }
      ],
      podName: `sample-task-run-pod-name-${name}`,
      startTime: '2019-08-21T17:12:21Z',
      steps: [
        {
          name: 'build',
          terminated: {
            containerID:
              'docker://88659459cb477936d2ee859822b024bf02768c9ff3dd048f7d8af85843064f95',
            exitCode,
            finishedAt: '2019-08-21T17:12:29Z',
            reason: 'Completed',
            startedAt: '2019-08-21T17:12:26Z'
          }
        }
      ]
    }
  };
}

const taskRun = getTaskRun({
  name: 'sampleTaskRunName',
  pipelineTaskName: 'task1'
});
const taskRunWithWarning = getTaskRun({
  exitCode: 1,
  name: 'sampleTaskRunName2',
  pipelineTaskName: 'task2'
});

const taskRunSkipped = getTaskRun({
  name: 'sampleTaskRunName3',
  pipelineTaskName: 'task3'
});
delete taskRunSkipped.status.conditions;
delete taskRunSkipped.status.steps[0].terminated;

const taskRunWithSkippedStep = getTaskRun({
  name: 'sampleTaskRunName4',
  pipelineTaskName: 'task4'
});
taskRunWithSkippedStep.status.steps[0].terminationReason = 'Skipped';

const taskRunWithRetries = getTaskRun({
  exitCode: 0,
  name: 'sampleTaskRunName2',
  pipelineTaskName: 'task2'
});
taskRunWithRetries.status.retriesStatus = [
  {
    completionTime: '2019-08-21T17:12:21Z',
    conditions: [
      {
        lastTransitionTime: '2019-08-21T17:12:21Z',
        message: 'All Steps have completed executing',
        reason: 'Succeeded',
        status: 'False',
        type: 'Succeeded'
      }
    ],
    podName: `sample-task-run-pod-name-0`,
    startTime: '2019-08-21T17:11:21Z',
    steps: [
      {
        name: 'build',
        terminated: {
          containerID:
            'docker://88659459cb477936d2ee859822b024bf02768c9ff3dd048f7d8af85843064f95',
          exitCode: 1,
          finishedAt: '2019-08-21T17:12:20Z',
          reason: 'Failed',
          startedAt: '2019-08-21T17:11:22Z'
        }
      }
    ]
  }
];

const pipelineRun = {
  metadata: {
    name: 'pipeline-run',
    namespace: 'cb4552a6-b2d7-45e2-9773-3d4ca33909ff',
    uid: '7c266264-4d4d-45e3-ace0-041be8f7d06e'
  },
  spec: {
    pipelineRef: {
      name: 'pipeline'
    }
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2019-08-16T12:49:28Z',
        message: 'All Tasks have completed executing',
        reason: 'Succeeded',
        status: 'True',
        type: 'Succeeded'
      }
    ],
    skippedTasks: [
      { name: 'task3', reason: 'When Expressions evaluated to false' }
    ],
    startTime: '2019-08-21T17:12:20Z',
    taskRuns: {
      sampleTaskRunName: {
        pipelineTaskName: 'task1',
        status: taskRun.status
      },
      sampleTaskRunName2: {
        pipelineTaskName: 'task2',
        status: taskRunWithWarning.status
      },
      sampleTaskRunName3: {
        pipelineTaskName: 'task3',
        status: taskRunSkipped.status
      },
      sampleTaskRunName4: {
        pipelineTaskName: 'task4',
        status: taskRunWithSkippedStep.status
      }
    }
  }
};

const pipelineRunWithMinimalStatus = {
  metadata: {
    name: 'pipeline-run',
    namespace: 'cb4552a6-b2d7-45e2-9773-3d4ca33909ff',
    uid: '7c266264-4d4d-45e3-ace0-041be8f7d06e'
  },
  spec: {
    pipelineRef: {
      name: 'pipeline'
    }
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2019-08-16T12:49:28Z',
        message: 'All Tasks have completed executing',
        reason: 'Succeeded',
        status: 'True',
        type: 'Succeeded'
      }
    ],
    startTime: '2019-08-21T17:12:20Z',
    childReferences: [
      {
        name: 'sampleTaskRunName',
        pipelineTaskName: 'task1'
      },
      {
        name: 'sampleTaskRunName2',
        pipelineTaskName: 'task2'
      }
    ]
  }
};

export default {
  args: {
    selectedRetry: '',
    selectedStepId: undefined,
    selectedTaskId: undefined,
    view: undefined
  },
  component: PipelineRun,
  decorators: [Story => <Story />],
  subcomponents: { LogsToolbar },
  title: 'PipelineRun'
};

const logsWithTimestampsAndLevels = `2024-11-14T14:10:53.354144861Z::info::Cloning repo
2024-11-14T14:10:56.300268594Z::debug::[get_repo_params:30] | get_repo_name called for https://github.com/example/app. Repository Name identified as app
2024-11-14T14:10:56.307088791Z::debug::[get_repo_params:18] | get_repo_owner called for https://github.com/example/app. Repository Owner identified as example
2024-11-14T14:10:56.815017386Z::debug::[get_repo_params:212] | Unable to locate repository parameters for key https://github.com/example/app in the cache. Attempt to fetch repository parameters.
2024-11-14T14:10:56.819937688Z::debug::[get_repo_params:39] | get_repo_server_name called for https://github.com/example/app. Repository Server Name identified as github.com
2024-11-14T14:10:56.869719012Z Sample with no log level
2024-11-14T14:10:56.869719012Z::error::Sample error
2024-11-14T14:10:56.869719012Z::warning::Sample warning
2024-11-14T14:10:56.869719012Z::notice::Sample notice
2024-11-14T14:11:08.065631069Z ::info::Details of asset created:
2024-11-14T14:11:11.849912684Z ┌─────┬──────┬────┬─────┐
2024-11-14T14:11:11.849981080Z │ Key │ Type │ ID │ URL │
2024-11-14T14:11:11.849987327Z └─────┴──────┴────┴─────┘
2024-11-14T14:11:11.869437298Z ::info::Details of evidence collected:
2024-11-14T14:11:15.892827575Z ┌─────────────────┬────────────────────┐
2024-11-14T14:11:15.892883264Z │ Attribute       │ Value              │
2024-11-14T14:11:15.892888519Z ├─────────────────┼────────────────────┤
2024-11-14T14:11:15.892895717Z │ Status          │ \x1B[32msuccess\x1B[39m            │
2024-11-14T14:11:15.892900191Z ├─────────────────┼────────────────────┤
2024-11-14T14:11:15.892904785Z │ Tool Type       │ jest               │
2024-11-14T14:11:15.892908480Z ├─────────────────┼────────────────────┤
2024-11-14T14:11:15.892912390Z │ Evidence ID     │ -                  │
2024-11-14T14:11:15.892916374Z ├─────────────────┼────────────────────┤
2024-11-14T14:11:15.892920207Z │ Evidence Type   │ com.ibm.unit_tests │
2024-11-14T14:11:15.892924894Z ├─────────────────┼────────────────────┤
2024-11-14T14:11:15.892930294Z │ Issues          │ -                  │
2024-11-14T14:11:15.892933984Z ├─────────────────┼────────────────────┤
2024-11-14T14:11:15.892938649Z │ Attachment URLs │                    │
2024-11-14T14:11:15.892942307Z │                 │                    │
2024-11-14T14:11:15.892947043Z └─────────────────┴────────────────────┘
2024-11-14T14:11:15.989838531Z success`;

export const Default = args => {
  const [, updateArgs] = useArgs();

  return (
    <PipelineRun
      {...args}
      fetchLogs={() => 'sample log output'}
      handleTaskSelected={({
        selectedStepId: stepId,
        selectedTaskId: taskId
      }) => {
        updateArgs({ selectedStepId: stepId, selectedTaskId: taskId });
      }}
      onViewChange={selectedView => updateArgs({ view: selectedView })}
      pipelineRun={pipelineRun}
      taskRuns={[
        taskRun,
        taskRunWithWarning,
        taskRunSkipped,
        taskRunWithSkippedStep
      ]}
      tasks={[task]}
    />
  );
};

export const WithMinimalStatus = args => {
  const [, updateArgs] = useArgs();

  return (
    <PipelineRun
      {...args}
      fetchLogs={() => 'sample log output'}
      handleTaskSelected={({
        selectedStepId: stepId,
        selectedTaskId: taskId
      }) => {
        updateArgs({ selectedStepId: stepId, selectedTaskId: taskId });
      }}
      onViewChange={selectedView => updateArgs({ view: selectedView })}
      pipelineRun={pipelineRunWithMinimalStatus}
      taskRuns={[taskRun, taskRunWithWarning]}
      tasks={[task]}
    />
  );
};

export const WithPodDetails = args => {
  const [, updateArgs] = useArgs();

  return (
    <PipelineRun
      {...args}
      fetchLogs={() => 'sample log output'}
      handleTaskSelected={({
        selectedStepId: stepId,
        selectedTaskId: taskId
      }) => {
        updateArgs({ selectedStepId: stepId, selectedTaskId: taskId });
      }}
      onViewChange={selectedView => updateArgs({ view: selectedView })}
      pipelineRun={pipelineRun}
      pod={{
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
      }}
      selectedTaskId="task1"
      taskRuns={[taskRun]}
      tasks={[task]}
      view="pod"
    />
  );
};

export const LogsWithTimestampsAndLevels = {
  args: {
    fetchLogs: () => logsWithTimestampsAndLevels,
    logLevels: {
      error: true,
      warning: true,
      notice: true,
      info: true,
      debug: false
    },
    pipelineRun: pipelineRunWithMinimalStatus,
    selectedStepId: 'build',
    selectedTaskId: task.metadata.name,
    showLogLevels: true,
    showLogTimestamps: true,
    taskRuns: [taskRun],
    tasks: [task]
  },
  render: args => {
    const [, updateArgs] = useArgs();

    return (
      <PipelineRun
        {...args}
        getLogsToolbar={toolbarProps => (
          <LogsToolbar
            {...toolbarProps}
            logLevels={args.logLevels}
            onToggleLogLevel={level =>
              updateArgs({ logLevels: { ...args.logLevels, ...level } })
            }
            onToggleShowTimestamps={showLogTimestamps =>
              updateArgs({ showLogTimestamps })
            }
            showTimestamps={args.showLogTimestamps}
          />
        )}
        handleTaskSelected={({
          selectedStepId: stepId,
          selectedTaskId: taskId
        }) => {
          updateArgs({ selectedStepId: stepId, selectedTaskId: taskId });
        }}
        onViewChange={selectedView => updateArgs({ view: selectedView })}
        pipelineRun={pipelineRun}
        taskRuns={[
          taskRun,
          taskRunWithWarning,
          taskRunSkipped,
          taskRunWithSkippedStep
        ]}
        tasks={[task]}
      />
    );
  }
};

export const WithRetries = args => {
  const [, updateArgs] = useArgs();

  return (
    <PipelineRun
      {...args}
      fetchLogs={() => 'sample log output'}
      handleTaskSelected={({
        selectedStepId: stepId,
        selectedTaskId: taskId
      }) => {
        updateArgs({ selectedStepId: stepId, selectedTaskId: taskId });
      }}
      onRetryChange={selectedRetry =>
        updateArgs({ selectedRetry: `${selectedRetry}` })
      }
      onViewChange={selectedView => updateArgs({ view: selectedView })}
      pipelineRun={pipelineRunWithMinimalStatus}
      taskRuns={[taskRun, taskRunWithRetries]}
      tasks={[task]}
    />
  );
};

export const Empty = {};

export const Error = { args: { error: 'Internal server error' } };
