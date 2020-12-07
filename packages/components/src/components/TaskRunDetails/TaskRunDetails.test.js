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
import { fireEvent } from '@testing-library/react';

import { renderWithIntl } from '../../utils/test';
import TaskRunDetails from './TaskRunDetails';

describe('TaskRunDetails', () => {
  it('renders task name and error state', () => {
    const taskRunName = 'task-run-name';
    const status = 'error';
    const { queryByText } = renderWithIntl(
      <TaskRunDetails
        taskRun={{ metadata: { name: taskRunName }, spec: {}, status }}
      />
    );

    expect(queryByText(taskRunName)).toBeTruthy();
    expect(queryByText(status)).toBeTruthy();
  });

  it('renders task name and inputs', () => {
    const taskRunName = 'task-run-name';
    const status = 'error';
    const paramKey = 'k';
    const paramValue = 'v';
    const params = [{ name: paramKey, value: paramValue }];
    const { queryByText } = renderWithIntl(
      <TaskRunDetails
        taskRun={{ metadata: { name: taskRunName }, spec: { params }, status }}
      />
    );

    expect(queryByText(taskRunName)).toBeTruthy();
    expect(queryByText(paramKey)).toBeTruthy();
    expect(queryByText(paramValue)).toBeTruthy();
  });

  it('renders selected view', () => {
    const taskRun = {
      metadata: { name: 'task-run-name' },
      spec: { params: [{ name: 'fake_name', value: 'fake_value' }] }
    };
    const { queryByText, queryAllByText } = renderWithIntl(
      <TaskRunDetails taskRun={taskRun} view="status" />
    );
    expect(queryByText(/status/i)).toBeTruthy();
    expect(queryAllByText(/pending/i)[0]).toBeTruthy();
    expect(queryByText('fake_name')).toBeFalsy();
    fireEvent.click(queryByText(/parameters/i));
    expect(queryByText('fake_name')).toBeTruthy();
  });
});
