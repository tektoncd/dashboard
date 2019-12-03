/*
Copyright 2019 The Tekton Authors
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
import { createIntl } from 'react-intl';
import { renderWithIntl, renderWithRouter } from '../../utils/test';
import TaskRuns from './TaskRuns';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

it('TaskRuns renders empty state', () => {
  const { queryByText } = renderWithIntl(<TaskRuns taskRuns={[]} />);
  expect(queryByText(/no taskruns/i)).toBeTruthy();
});

it('TaskRuns renders headers state', () => {
  const { queryByText } = renderWithIntl(<TaskRuns taskRuns={[]} />);
  expect(queryByText(/taskrun/i)).toBeTruthy();
  expect(queryByText(/task/i)).toBeTruthy();
  expect(queryByText(/namespace/i)).toBeTruthy();
  expect(queryByText(/status/i)).toBeTruthy();
  expect(queryByText(/last transition time/i)).toBeTruthy();
  expect(document.getElementsByClassName('bx--overflow-menu')).toBeTruthy();
});

it('TaskRun renders correct data', async () => {
  const taskRunName = 'pipeline0-run-123';
  const { queryByText } = renderWithRouter(
    <TaskRuns
      intl={intl}
      taskRuns={[
        {
          kind: 'TaskRun',
          metadata: {
            creationTimestamp: '2019-11-28T15:10:52Z',
            name: taskRunName,
            namespace: 'default-namespace'
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
                reason: 'Succeeded',
                status: 'True',
                type: 'Succeeded'
              }
            ]
          }
        }
      ]}
    />
  );
  expect(queryByText(taskRunName)).toBeTruthy();
  expect(queryByText(/pipeline0-task/i)).toBeTruthy();
  expect(queryByText(/default-namespace/i)).toBeTruthy();
  expect(queryByText(/All Steps have completed executing/i)).toBeTruthy();
});

it('TaskRun renders pending', async () => {
  const taskRunName = 'task-run-of-doom';
  const { queryByText } = renderWithRouter(
    <TaskRuns
      intl={intl}
      taskRuns={[
        {
          kind: 'TaskRun',
          metadata: {
            creationTimestamp: '2019-11-28T15:10:52Z',
            name: taskRunName,
            namespace: 'namespace-of-doom'
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
      taskRunActions={[
        {
          actionText: intl.formatMessage({
            id: 'test.actionText',
            defaultMessage: 'Delete'
          })
        },
        {
          actionText: intl.formatMessage({
            id: 'test.actionText',
            defaultMessage: 'Stop'
          })
        }
      ]}
    />
  );
  expect(queryByText(taskRunName)).toBeTruthy();
  expect(queryByText(/task-of-doom/i)).toBeTruthy();
  expect(queryByText(/namespace-of-doom/i)).toBeTruthy();
  expect(queryByText(/Pending/i)).toBeTruthy();
});
