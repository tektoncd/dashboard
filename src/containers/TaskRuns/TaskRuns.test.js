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
import { fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Route } from 'react-router-dom';
import { urls } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
import * as API from '../../api';
import * as taskRunsAPI from '../../api/taskRuns';
import * as store from '../../store';
import TaskRunsContainer from './TaskRuns';

const namespacesTestStore = {
  namespaces: {
    selected: 'namespace-1',
    byName: {
      'namespace-1': ''
    },
    isFetching: false
  }
};
const taskRunsTestStore = {
  taskRuns: {
    isFetching: false,
    byId: {
      'taskRunWithTwoLabels-id': {
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
      'taskRunWithSingleLabel-id': {
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
    },
    byNamespace: {
      'namespace-1': {
        taskRunWithTwoLabels: 'taskRunWithTwoLabels-id',
        taskRunWithSingleLabel: 'taskRunWithSingleLabel-id'
      }
    }
  }
};
const tasksTestStore = {
  tasks: {
    byNamespace: {
      'namespace-1': {
        'task-1': 'id-task-1'
      }
    },
    byId: {
      'id-task-1': {
        metadata: {
          name: 'task-1',
          namespace: 'namespace-1',
          uid: 'id-task-1'
        },
        spec: {
          resources: [{ name: 'resource-1', type: 'type-1' }],
          params: [
            {
              name: 'param-1',
              description: 'description-1',
              default: 'default-1'
            },
            { name: 'param-2' }
          ]
        }
      }
    },
    isFetching: false
  }
};

const middleware = [thunk];
const mockStore = configureStore(middleware);
const testStore = {
  ...namespacesTestStore,
  notifications: {},
  ...taskRunsTestStore,
  ...tasksTestStore
};

describe('TaskRuns container', () => {
  beforeEach(() => {
    jest.spyOn(taskRunsAPI, 'getTaskRuns').mockImplementation(() => []);
    jest
      .spyOn(store, 'getStore')
      .mockImplementation(() => mockStore(testStore));
  });

  it('taskRuns can be filtered on a single label filter', async () => {
    const match = {
      params: {},
      url: urls.taskRuns.all()
    };

    const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
      <Provider store={store.getStore()}>
        <Route
          path={urls.taskRuns.all()}
          render={props => (
            <TaskRunsContainer
              {...props}
              match={match}
              error={null}
              loading={false}
              namespace="namespace-1"
              fetchTaskRuns={() => Promise.resolve()}
              taskRuns={taskRunsTestStore.taskRuns.byId}
            />
          )}
        />
      </Provider>,
      { route: urls.taskRuns.all() }
    );

    const filterValue = 'baz:bam';
    const filterInputField = getByPlaceholderText(/Input a label filter/);
    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(queryByText(filterValue)).toBeTruthy();
    expect(queryByText('taskRunWithSingleLabel')).toBeFalsy();
    expect(queryByText('taskRunWithTwoLabels')).toBeTruthy();
  });

  it('taskRuns can be filtered on multiple label filters', async () => {
    const match = {
      params: {},
      url: ''
    };

    const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
      <Provider store={store.getStore()}>
        <Route
          path={urls.taskRuns.all()}
          render={props => (
            <TaskRunsContainer
              {...props}
              match={match}
              error={null}
              loading={false}
              namespace="namespace-1"
              fetchTaskRuns={() => Promise.resolve()}
              taskRuns={taskRunsTestStore.taskRuns.byId}
            />
          )}
        />
      </Provider>,
      { route: urls.taskRuns.all() }
    );

    const firstFilterValue = 'foo:bar';
    const secondFilterValue = 'baz:bam';
    const filterInputField = getByPlaceholderText(/Input a label filter/);
    fireEvent.change(filterInputField, { target: { value: firstFilterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));
    fireEvent.change(filterInputField, {
      target: { value: secondFilterValue }
    });
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(queryByText(firstFilterValue)).toBeTruthy();
    expect(queryByText(secondFilterValue)).toBeTruthy();
    expect(queryByText('taskRunWithSingleLabel')).toBeFalsy();
    expect(queryByText('taskRunWithTwoLabels')).toBeTruthy();
  });

  it('taskRuns label filter can be deleted, rendering the correct taskRuns', async () => {
    const match = {
      params: {},
      url: urls.taskRuns.all()
    };

    const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
      <Provider store={store.getStore()}>
        <Route
          path={urls.taskRuns.all()}
          render={props => (
            <TaskRunsContainer
              {...props}
              match={match}
              error={null}
              loading={false}
              namespace="namespace-1"
              fetchTaskRuns={() => Promise.resolve()}
              taskRuns={taskRunsTestStore.taskRuns.byId}
            />
          )}
        />
      </Provider>,
      { route: urls.taskRuns.all() }
    );

    const filterValue = 'baz:bam';
    const filterInputField = getByPlaceholderText(/Input a label filter/);
    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(queryByText(filterValue)).toBeTruthy();
    expect(queryByText('taskRunWithSingleLabel')).toBeFalsy();
    expect(queryByText('taskRunWithTwoLabels')).toBeTruthy();

    fireEvent.click(getByText(filterValue));
    await waitFor(() => getByText('taskRunWithSingleLabel'));
    expect(queryByText(filterValue)).toBeFalsy();

    expect(queryByText('taskRunWithSingleLabel')).toBeTruthy();
    expect(queryByText('taskRunWithTwoLabels')).toBeTruthy();
  });

  it('Duplicate label filters are prevented', async () => {
    const match = {
      params: {},
      url: urls.taskRuns.all()
    };

    const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
      <Provider store={store.getStore()}>
        <Route
          path={urls.taskRuns.all()}
          render={props => (
            <TaskRunsContainer
              {...props}
              match={match}
              error={null}
              loading={false}
              namespace="namespace-1"
              fetchTaskRuns={() => Promise.resolve()}
              taskRuns={taskRunsTestStore.taskRuns.byId}
            />
          )}
        />
      </Provider>,
      { route: urls.taskRuns.all() }
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
    const match = {
      params: {},
      url: urls.taskRuns.all()
    };

    const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
      <Provider store={store.getStore()}>
        <Route
          path={urls.taskRuns.all()}
          render={props => (
            <TaskRunsContainer
              {...props}
              match={match}
              error={null}
              loading={false}
              namespace="namespace-1"
              fetchTaskRuns={() => Promise.resolve()}
              taskRuns={taskRunsTestStore.taskRuns.byId}
            />
          )}
        />
      </Provider>,
      { route: urls.taskRuns.all() }
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
    jest.spyOn(API, 'useIsReadOnly').mockImplementation(() => false);

    const match = {
      params: {},
      url: urls.taskRuns.all()
    };

    const { getAllByTitle, getByText } = renderWithRouter(
      <Provider store={store.getStore()}>
        <Route
          path={urls.taskRuns.all()}
          render={props => (
            <TaskRunsContainer
              {...props}
              match={match}
              error={null}
              loading={false}
              namespace="namespace-1"
              fetchTaskRuns={() => Promise.resolve()}
              taskRuns={taskRunsTestStore.taskRuns.byId}
            />
          )}
        />
      </Provider>,
      { route: urls.taskRuns.all() }
    );

    await waitFor(() => getByText('taskRunWithTwoLabels'));
    expect(getAllByTitle(/actions/i)[0]).toBeTruthy();
  });

  it('TaskRun actions are not available when in read-only mode', async () => {
    jest.spyOn(API, 'useIsReadOnly').mockImplementation(() => true);

    const match = {
      params: {},
      url: urls.taskRuns.all()
    };

    const {
      getByText,
      queryAllByLabelText,
      queryAllByTitle
    } = renderWithRouter(
      <Provider store={store.getStore()}>
        <Route
          path={urls.taskRuns.all()}
          render={props => (
            <TaskRunsContainer
              {...props}
              match={match}
              error={null}
              loading={false}
              namespace="namespace-1"
              fetchTaskRuns={() => Promise.resolve()}
              taskRuns={taskRunsTestStore.taskRuns.byId}
            />
          )}
        />
      </Provider>,
      { route: urls.taskRuns.all() }
    );

    await waitFor(() => getByText('taskRunWithTwoLabels'));
    expect(queryAllByTitle(/actions/i)[0]).toBeFalsy();
    expect(queryAllByLabelText('Select row').length).toBe(0);
  });

  it('handles rerun event in TaskRuns page', async () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(API, 'useIsReadOnly').mockImplementation(() => false);
    jest.spyOn(taskRunsAPI, 'rerunTaskRun').mockImplementation(() => []);
    const { getAllByTitle, getByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={urls.taskRuns.all()}
          render={props => (
            <TaskRunsContainer
              {...props}
              fetchTaskRuns={() => Promise.resolve()}
              taskRuns={taskRunsTestStore.taskRuns.byId}
            />
          )}
        />
      </Provider>,
      { route: urls.taskRuns.all() }
    );
    await waitFor(() => getByText(/taskRunWithTwoLabels/i));
    fireEvent.click(await waitFor(() => getAllByTitle('Actions')[0]));
    await waitFor(() => getByText(/Rerun/i));
    fireEvent.click(getByText('Rerun'));
    expect(API.rerunTaskRun).toHaveBeenCalledTimes(1);
    expect(API.rerunTaskRun).toHaveBeenCalledWith(
      taskRunsTestStore.taskRuns.byId['taskRunWithSingleLabel-id']
    );
  });
});
