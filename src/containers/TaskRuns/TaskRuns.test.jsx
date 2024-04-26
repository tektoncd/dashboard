/*
Copyright 2019-2024 The Tekton Authors
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

import { fireEvent, waitFor } from '@testing-library/react';
import { paths, urls } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
import * as API from '../../api';
import * as taskRunsAPI from '../../api/taskRuns';
import TaskRunsContainer from './TaskRuns';

const taskRuns = [
  {
    status: {
      startTime: '0'
    },
    metadata: {
      name: 'taskRunWithTwoLabels',
      namespace: 'namespace-1',
      labels: {
        foo: 'bar',
        baz: 'bam'
      },
      uid: 'taskRunWithTwoLabels-id'
    },
    spec: {
      taskRef: {
        name: 'task-1'
      }
    }
  },
  {
    status: {
      startTime: '1'
    },
    metadata: {
      name: 'taskRunWithSingleLabel',
      namespace: 'namespace-1',
      uid: 'taskRunWithSingleLabel-id',
      labels: {
        foo: 'bar'
      }
    },
    spec: {
      taskSpec: {
        steps: []
      }
    }
  }
];

describe('TaskRuns container', () => {
  beforeEach(() => {
    vi.spyOn(taskRunsAPI, 'useTaskRuns').mockImplementation(() => ({
      data: taskRuns
    }));
  });

  it('Duplicate label filters are prevented', async () => {
    const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
      <TaskRunsContainer
        error={null}
        loading={false}
        namespace="namespace-1"
      />,
      { path: paths.taskRuns.all(), route: urls.taskRuns.all() }
    );

    const filterValue = 'baz:bam';
    const filterInputField = getByPlaceholderText(/Input a label filter/);
    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(queryByText(filterValue)).toBeTruthy();

    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));
    expect(queryByText(/No duplicate filters allowed/i)).toBeTruthy();
  });

  it('An invalid filter value is disallowed and reported', async () => {
    const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
      <TaskRunsContainer
        error={null}
        loading={false}
        namespace="namespace-1"
      />,
      { path: paths.taskRuns.all(), route: urls.taskRuns.all() }
    );

    const filterValue = 'baz=bam';
    const filterInputField = getByPlaceholderText(/Input a label filter/);
    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(
      queryByText(
        /Filters must be of the format labelKey:labelValue and contain accepted label characters/i
      )
    ).toBeTruthy();
  });

  it('TaskRun actions are available when not in read-only mode', async () => {
    vi.spyOn(API, 'useIsReadOnly').mockImplementation(() => false);

    const { getAllByTitle, getByText } = renderWithRouter(
      <TaskRunsContainer
        error={null}
        loading={false}
        namespace="namespace-1"
      />,
      { path: paths.taskRuns.all(), route: urls.taskRuns.all() }
    );

    await waitFor(() => getByText('taskRunWithTwoLabels'));
    expect(getAllByTitle(/actions/i)[0]).toBeTruthy();
  });

  it('TaskRun actions are not available when in read-only mode', async () => {
    vi.spyOn(API, 'useIsReadOnly').mockImplementation(() => true);

    const { getByText, queryAllByLabelText, queryAllByTitle } =
      renderWithRouter(
        <TaskRunsContainer
          error={null}
          loading={false}
          namespace="namespace-1"
        />,
        { path: paths.taskRuns.all(), route: urls.taskRuns.all() }
      );

    await waitFor(() => getByText('taskRunWithTwoLabels'));
    expect(queryAllByTitle(/actions/i)[0]).toBeFalsy();
    expect(queryAllByLabelText('Select row').length).toBe(0);
  });

  it('handles rerun event in TaskRuns page', async () => {
    vi.spyOn(API, 'useIsReadOnly').mockImplementation(() => false);
    vi.spyOn(taskRunsAPI, 'rerunTaskRun').mockImplementation(() => []);
    const { getAllByTitle, getByText } = renderWithRouter(
      <TaskRunsContainer />,
      { path: paths.taskRuns.all(), route: urls.taskRuns.all() }
    );
    await waitFor(() => getByText(/taskRunWithTwoLabels/i));
    fireEvent.click(await waitFor(() => getAllByTitle('Actions')[0]));
    await waitFor(() => getByText(/Rerun/i));
    fireEvent.click(getByText('Rerun'));
    expect(API.rerunTaskRun).toHaveBeenCalledTimes(1);
    expect(API.rerunTaskRun).toHaveBeenCalledWith(taskRuns[0]);
  });
});
