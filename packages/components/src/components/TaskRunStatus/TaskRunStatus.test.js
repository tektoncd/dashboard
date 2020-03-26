/*
Copyright 2020 The Tekton Authors
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
import { renderWithIntl } from '../../utils/test';

import TaskRunStatus from './TaskRunStatus';

it('TaskRunStatus renders pipeline task name and cancelled state', () => {
  const pipelineTaskName = 'my-pipeline-task';
  const status = 'error';
  const { queryByText } = renderWithIntl(
    <TaskRunStatus
      taskRun={{ pipelineTaskName, status, taskName: 'taskName' }}
    />
  );

  expect(queryByText(pipelineTaskName)).toBeTruthy();
  expect(queryByText(status)).toBeTruthy();
});

it('TaskRunStatus renders task name and error state', () => {
  const taskRunName = 'task-run-name';
  const status = 'error';
  const { queryByText } = renderWithIntl(
    <TaskRunStatus taskRun={{ status, taskRunName }} />
  );

  expect(queryByText(taskRunName)).toBeTruthy();
  expect(queryByText(status)).toBeTruthy();
});
