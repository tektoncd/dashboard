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
import { render, waitForElement } from 'react-testing-library';

import LogContainer from './Log';
import * as API from '../../api';

beforeEach(jest.resetAllMocks);

it('LogContainer renders', async () => {
  const taskRunName = 'taskRun';
  const getTaskRunLog = jest
    .spyOn(API, 'getTaskRunLog')
    .mockImplementation(() => 'testing');

  const { container, getByText } = render(
    <LogContainer taskRunName={taskRunName} />
  );
  await waitForElement(() => getByText('testing'));

  expect(getTaskRunLog).toHaveBeenCalledTimes(1);
  expect(getTaskRunLog).toHaveBeenCalledWith(taskRunName);

  const anotherTaskRunName = 'anotherTaskRun';
  render(<LogContainer taskRunName={anotherTaskRunName} />, { container });
  expect(getTaskRunLog).toHaveBeenCalledTimes(2);
  expect(getTaskRunLog).toHaveBeenCalledWith(anotherTaskRunName);
});

it('LogContainer handles error case', async () => {
  const taskRunName = 'taskRun';
  const getTaskRunLog = jest
    .spyOn(API, 'getTaskRunLog')
    .mockImplementation(() => {
      throw new Error();
    });

  const { getByText } = render(<LogContainer taskRunName={taskRunName} />);
  await waitForElement(() => getByText('Unable to fetch log'));

  expect(getTaskRunLog).toHaveBeenCalledTimes(1);
  expect(getTaskRunLog).toHaveBeenCalledWith(taskRunName);
});
