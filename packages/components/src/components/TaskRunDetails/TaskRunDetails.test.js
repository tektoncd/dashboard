/*
Copyright 2020-2021 The Tekton Authors
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
    const description = 'param_description';
    const { queryByText } = renderWithIntl(
      <TaskRunDetails
        task={{
          metadata: 'task',
          spec: { params: [{ name: paramKey, description }] }
        }}
        taskRun={{ metadata: { name: taskRunName }, spec: { params }, status }}
      />
    );

    expect(queryByText(taskRunName)).toBeTruthy();
    expect(queryByText(paramKey)).toBeTruthy();
    expect(queryByText(paramValue)).toBeTruthy();
    expect(queryByText(description)).toBeTruthy();
  });

  it('renders params with description from inline taskSpec', () => {
    const taskRunName = 'task-run-name';
    const status = 'error';
    const paramKey = 'k';
    const paramValue = 'v';
    const params = [{ name: paramKey, value: paramValue }];
    const description = 'param_description';
    const { queryByText } = renderWithIntl(
      <TaskRunDetails
        taskRun={{
          metadata: { name: taskRunName },
          spec: {
            params,
            taskSpec: { params: [{ name: paramKey, description }] }
          },
          status
        }}
      />
    );

    expect(queryByText(paramKey)).toBeTruthy();
    expect(queryByText(paramValue)).toBeTruthy();
    expect(queryByText(description)).toBeTruthy();
  });

  it('does not render parameters or results tabs when those fields are not present', () => {
    const taskRun = {
      metadata: { name: 'task-run-name' },
      spec: {},
      status: {}
    };
    const { queryByText } = renderWithIntl(
      <TaskRunDetails taskRun={taskRun} />
    );
    expect(queryByText(/parameters/i)).toBeFalsy();
    expect(queryByText(/results/i)).toBeFalsy();
    expect(queryByText(/status/i)).toBeTruthy();
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

  it('renders results', () => {
    const resultName = 'message';
    const description = 'result_description';
    const taskRun = {
      metadata: { name: 'task-run-name' },
      spec: {},
      status: { taskResults: [{ name: resultName, value: 'hello' }] }
    };
    const { queryByText } = renderWithIntl(
      <TaskRunDetails
        task={{
          metadata: 'task',
          spec: { results: [{ name: resultName, description }] }
        }}
        taskRun={taskRun}
        view="results"
      />
    );
    expect(queryByText(/results/i)).toBeTruthy();
    expect(queryByText(/message/)).toBeTruthy();
    expect(queryByText(/hello/)).toBeTruthy();
    expect(queryByText(description)).toBeTruthy();
  });

  it('renders results with description from inline taskSpec', () => {
    const resultName = 'message';
    const description = 'result_description';
    const taskRun = {
      metadata: { name: 'task-run-name' },
      spec: {
        taskSpec: { results: [{ name: resultName, description }] }
      },
      status: { taskResults: [{ name: resultName, value: 'hello' }] }
    };
    const { queryByText } = renderWithIntl(
      <TaskRunDetails taskRun={taskRun} view="results" />
    );
    expect(queryByText(description)).toBeTruthy();
  });
});
