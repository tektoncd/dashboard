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

import React from 'react';

import { render, renderWithRouter } from '../../utils/test';
import TaskRuns from './TaskRuns';

it('TaskRuns renders empty state', () => {
  const { queryByText } = render(<TaskRuns taskRuns={[]} />);
  expect(queryByText(/no matching taskruns/i)).toBeTruthy();
});

it('TaskRuns renders headers state', () => {
  const { queryByText } = render(<TaskRuns taskRuns={[]} />);
  expect(queryByText(/taskrun/i)).toBeTruthy();
  expect(queryByText('Task')).toBeTruthy();
  expect(queryByText('Namespace')).toBeTruthy();
  expect(queryByText(/status/i)).toBeTruthy();
  expect(queryByText(/created/i)).toBeTruthy();
  expect(queryByText(/duration/i)).toBeTruthy();
  expect(document.getElementsByClassName('bx--overflow-menu')).toBeTruthy();
});

it('TaskRuns renders correct data', async () => {
  const taskRunName = 'pipeline0-run-123';
  const { queryByText, queryByTitle, queryAllByText } = renderWithRouter(
    <TaskRuns
      taskRuns={[
        {
          kind: 'TaskRun',
          metadata: {
            creationTimestamp: '2019-11-28T15:10:52Z',
            name: taskRunName,
            namespace: 'default-namespace',
            uid: 'fake-taskrun-uid'
          },
          spec: {
            taskRef: {
              kind: 'Task',
              name: 'pipeline0-task'
            },
            timeout: '1h0m0s'
          },
          status: {
            completionTime: '2019-11-28T15:11:07Z',
            conditions: [
              {
                lastTransitionTime: '2019-11-28T15:11:07Z',
                message: 'All Steps have completed executing',
                reason: 'FAKE_REASON',
                status: 'True',
                type: 'Succeeded'
              }
            ]
          }
        },
        {
          kind: 'TaskRun',
          metadata: {
            creationTimestamp: '2019-11-28T15:10:52Z',
            name: `cluster-taskrun`,
            namespace: 'default-namespace',
            uid: 'fake-clustertaskrun-uid'
          },
          spec: {
            taskRef: {
              kind: 'ClusterTask',
              name: 'cluster-task'
            },
            timeout: '1h0m0s'
          },
          status: {}
        }
      ]}
      taskRunActions={[
        {
          actionText: 'My Action',
          action: () => {}
        }
      ]}
    />
  );
  expect(queryByText(taskRunName)).toBeTruthy();
  expect(queryByText('pipeline0-task')).toBeTruthy();
  expect(queryAllByText('default-namespace')[0]).toBeTruthy();
  expect(queryByTitle(/FAKE_REASON/i)).toBeTruthy();
  expect(queryByText('cluster-task')).toBeTruthy();
  expect(queryByText('cluster-taskrun')).toBeTruthy();
});

it('TaskRuns renders pending', async () => {
  const taskRunName = 'task-run-of-doom';
  const { queryByText, queryByTitle } = renderWithRouter(
    <TaskRuns
      taskRuns={[
        {
          kind: 'TaskRun',
          metadata: {
            creationTimestamp: '2019-11-28T15:10:52Z',
            name: taskRunName,
            namespace: 'namespace-of-doom',
            uid: 'fake-taskrun-uid'
          },
          spec: {
            taskRef: {
              kind: 'Task',
              name: 'task-of-doom'
            },
            timeout: '1h0m0s'
          },
          status: {
            completionTime: '2019-11-28T15:11:07Z',
            podName:
              'pipeline0-run-1575303695557-r-pvv87-pipeline0-task-wml7g-pod-4a1e47',
            startTime: '2019-12-03T11:51:04Z',
            steps: [
              {
                container: 'step-kubectl-apply',
                name: 'kubectl-apply',
                waiting: {
                  reason: 'PodInitializing'
                }
              },
              {
                container: 'step-git-source-git-source59n4l-hfp5l',
                name: 'git-source-git-source59n4l-hfp5l',
                waiting: {
                  reason: 'PodInitializing'
                }
              }
            ]
          }
        }
      ]}
      taskRunActions={[{ actionText: 'Delete' }, { actionText: 'Stop' }]}
    />
  );
  expect(queryByText(taskRunName)).toBeTruthy();
  expect(queryByText('task-of-doom')).toBeTruthy();
  expect(queryByText('namespace-of-doom')).toBeTruthy();
  expect(queryByTitle(/Pending/i)).toBeTruthy();
});
