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

import React, { useState } from 'react';

import PipelineRun from '.';

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

function getTaskRun({ exitCode = 0, name }) {
  return {
    metadata: { labels: {}, name, namespace: 'default', uid: name },
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

const taskRun = getTaskRun({ name: 'sampleTaskRunName' });
const taskRunWithWarning = getTaskRun({
  exitCode: 1,
  name: 'sampleTaskRunName2'
});

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
    startTime: '2019-08-21T17:12:20Z',
    taskRuns: {
      sampleTaskRunName: {
        pipelineTaskName: 'task1',
        status: taskRun.status
      },
      sampleTaskRunName2: {
        pipelineTaskName: 'task2',
        status: taskRunWithWarning.status
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
  component: PipelineRun,
  decorators: [Story => <Story />],
  title: 'PipelineRun'
};

export const Base = () => {
  const [selectedStepId, setSelectedStepId] = useState();
  const [selectedTaskId, setSelectedTaskId] = useState();
  return (
    <PipelineRun
      fetchLogs={() => 'sample log output'}
      handleTaskSelected={(taskId, stepId) => {
        setSelectedStepId(stepId);
        setSelectedTaskId(taskId);
      }}
      pipelineRun={pipelineRun}
      selectedStepId={selectedStepId}
      selectedTaskId={selectedTaskId}
      taskRuns={[taskRun, taskRunWithWarning]}
      tasks={[task]}
    />
  );
};

export const WithMinimalStatus = () => {
  const [selectedStepId, setSelectedStepId] = useState();
  const [selectedTaskId, setSelectedTaskId] = useState();
  return (
    <PipelineRun
      fetchLogs={() => 'sample log output'}
      handleTaskSelected={(taskId, stepId) => {
        setSelectedStepId(stepId);
        setSelectedTaskId(taskId);
      }}
      pipelineRun={pipelineRunWithMinimalStatus}
      selectedStepId={selectedStepId}
      selectedTaskId={selectedTaskId}
      taskRuns={[taskRun, taskRunWithWarning]}
      tasks={[task]}
    />
  );
};

export const WithPodDetails = () => {
  const [selectedStepId, setSelectedStepId] = useState();
  const [selectedTaskId, setSelectedTaskId] = useState();
  return (
    <PipelineRun
      fetchLogs={() => 'sample log output'}
      handleTaskSelected={(taskId, stepId) => {
        setSelectedStepId(stepId);
        setSelectedTaskId(taskId);
      }}
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
      selectedStepId={selectedStepId}
      selectedTaskId={selectedTaskId}
      taskRuns={[taskRun]}
      tasks={[task]}
    />
  );
};

export const Empty = {};

export const Error = { args: { error: 'Internal server error' } };
