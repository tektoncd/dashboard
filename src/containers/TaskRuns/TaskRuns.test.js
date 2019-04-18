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
import { waitForElement } from 'react-testing-library';

import TaskRunsContainer from './TaskRuns';
import * as API from '../../api';
import { renderWithRouter } from '../../utils/test';

beforeEach(jest.resetAllMocks);

it('TaskRunsContainer renders', async () => {
  const taskName = 'taskName';
  const match = {
    params: {
      taskName
    }
  };
  const tasksCall = jest.spyOn(API, 'getTasks').mockImplementation(() => '');
  const taskRunsCall = jest
    .spyOn(API, 'getTaskRuns')
    .mockImplementation(() => '');
  const { getByText } = renderWithRouter(<TaskRunsContainer match={match} />);
  await waitForElement(() => getByText(taskName));
  expect(tasksCall).toHaveBeenCalledTimes(1);
  expect(taskRunsCall).toHaveBeenCalledTimes(0);
});

it('TaskRunsContainer handles info state', async () => {
  const notificationMessage = 'Task runs not available';
  const taskName = 'taskName';
  const match = {
    params: {
      taskName
    }
  };
  const tasksCall = jest
    .spyOn(API, 'getTasks')
    .mockImplementation(() => [{ metadata: { name: taskName } }]);
  const taskRunsCall = jest
    .spyOn(API, 'getTaskRuns')
    .mockImplementation(() => []);
  const { getByText } = renderWithRouter(<TaskRunsContainer match={match} />);
  await waitForElement(() => getByText(notificationMessage));
  expect(tasksCall).toHaveBeenCalledTimes(1);
  expect(taskRunsCall).toHaveBeenCalledTimes(1);
});

it('TaskRunsContainer handles error state', async () => {
  const match = {
    params: {
      taskName: 'foo'
    }
  };
  const getTasks = jest.spyOn(API, 'getTasks').mockImplementation(() => {
    const error = new Error();
    error.response = {
      status: 504
    };
    throw error;
  });
  const { getByText } = renderWithRouter(<TaskRunsContainer match={match} />);
  await waitForElement(() => getByText('Error loading task run'));
  expect(getTasks).toHaveBeenCalledTimes(1);
});
