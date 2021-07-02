/*
Copyright 2019-2021 The Tekton Authors
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
        name: 'build',
        resources: {}
      }
    ]
  }
};

const taskRun = {
  metadata: { labels: {}, name: 'sampleTaskRunName', namespace: 'default' },
  spec: {
    params: {},
    resources: {
      inputs: {},
      outputs: {}
    },
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
    podName: 'sample-task-run-pod-name',
    startTime: '2019-08-21T17:12:21Z',
    steps: [
      {
        name: 'build',
        terminated: {
          containerID:
            'docker://88659459cb477936d2ee859822b024bf02768c9ff3dd048f7d8af85843064f95',
          exitCode: 0,
          finishedAt: '2019-08-21T17:12:29Z',
          reason: 'Completed',
          startedAt: '2019-08-21T17:12:26Z'
        }
      }
    ]
  }
};

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
          podName: 'sample-task-run-pod-name',
          startTime: '2019-08-21T17:12:21Z',
          steps: [
            {
              name: 'build',
              terminated: {
                containerID:
                  'docker://88659459cb477936d2ee859822b024bf02768c9ff3dd048f7d8af85843064f95',
                exitCode: 0,
                finishedAt: '2019-08-21T17:12:29Z',
                reason: 'Completed',
                startedAt: '2019-08-21T17:12:26Z'
              }
            }
          ]
        }
      }
    }
  }
};

export default {
  component: PipelineRun,
  title: 'Components/PipelineRun'
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
      taskRuns={[taskRun]}
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
        events: '<Pod events go here>',
        resource: '<Pod resource goes here>'
      }}
      selectedStepId={selectedStepId}
      selectedTaskId={selectedTaskId}
      taskRuns={[taskRun]}
      tasks={[task]}
    />
  );
};

export const Empty = () => <PipelineRun />;

export const Error = () => <PipelineRun error="Internal server error" />;
