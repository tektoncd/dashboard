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
import { fireEvent, waitForElement } from 'react-testing-library';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Route } from 'react-router-dom';
import { renderWithRouter } from '../../utils/test';
import * as API from '../../api';
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
const middleware = [thunk];
const mockStore = configureStore(middleware);
const testStore = {
  ...namespacesTestStore,
  notifications: {},
  ...taskRunsTestStore
};

beforeEach(() => {
  jest.spyOn(API, 'getTaskRuns').mockImplementation(() => []);
});

it('taskRuns can be filtered on a single label filter', async () => {
  const mockTestStore = mockStore(testStore);
  const match = {
    params: {},
    url: '/taskruns'
  };

  const { queryByText, getByTestId, getByText } = renderWithRouter(
    <Provider store={mockTestStore}>
      <Route
        path="/taskruns"
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
    { route: '/taskruns' }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.click(getByText('Add filter'));

  expect(queryByText(filterValue)).toBeTruthy();
  expect(queryByText('taskRunWithSingleLabel')).toBeFalsy();
  expect(queryByText('taskRunWithTwoLabels')).toBeTruthy();
});

it('taskRuns can be filtered on multiple label filters', async () => {
  const mockTestStore = mockStore(testStore);
  const match = {
    params: {},
    url: ''
  };

  const { queryByText, getByTestId, getByText } = renderWithRouter(
    <Provider store={mockTestStore}>
      <Route
        path="/taskruns"
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
    { route: '/taskruns' }
  );

  const firstFilterValue = 'foo:bar';
  const secondFilterValue = 'baz:bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: firstFilterValue } });
  fireEvent.click(getByText('Add filter'));
  fireEvent.change(filterInputField, { target: { value: secondFilterValue } });
  fireEvent.click(getByText('Add filter'));

  expect(queryByText(firstFilterValue)).toBeTruthy();
  expect(queryByText(secondFilterValue)).toBeTruthy();
  expect(queryByText('taskRunWithSingleLabel')).toBeFalsy();
  expect(queryByText('taskRunWithTwoLabels')).toBeTruthy();
});

it('taskRuns label filter can be deleted, rendering the correct taskRuns', async () => {
  const mockTestStore = mockStore(testStore);
  const match = {
    params: {},
    url: '/taskruns'
  };

  const { queryByText, getByTestId, getByText } = renderWithRouter(
    <Provider store={mockTestStore}>
      <Route
        path="/taskruns"
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
    { route: '/taskruns' }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.click(getByText('Add filter'));

  expect(queryByText(filterValue)).toBeTruthy();
  expect(queryByText('taskRunWithSingleLabel')).toBeFalsy();
  expect(queryByText('taskRunWithTwoLabels')).toBeTruthy();

  fireEvent.click(getByText(filterValue));
  await waitForElement(() => getByText('taskRunWithSingleLabel'));
  expect(queryByText(filterValue)).toBeFalsy();

  expect(queryByText('taskRunWithSingleLabel')).toBeTruthy();
  expect(queryByText('taskRunWithTwoLabels')).toBeTruthy();
});

it('Duplicate label filters are prevented', async () => {
  const mockTestStore = mockStore(testStore);
  const match = {
    params: {},
    url: '/taskruns'
  };

  const { queryByText, getByTestId, getByText } = renderWithRouter(
    <Provider store={mockTestStore}>
      <Route
        path="/taskruns"
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
    { route: '/taskruns' }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.click(getByText('Add filter'));

  expect(queryByText(filterValue)).toBeTruthy();

  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.click(getByText('Add filter'));
  expect(queryByText(/No duplicate filters allowed/i)).toBeTruthy();
});

it('An invalid filter value is disallowed and reported', async () => {
  const mockTestStore = mockStore(testStore);
  const match = {
    params: {},
    url: '/taskruns'
  };

  const { queryByText, getByTestId, getByText } = renderWithRouter(
    <Provider store={mockTestStore}>
      <Route
        path="/taskruns"
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
    { route: '/taskruns' }
  );

  const filterValue = 'baz=bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.click(getByText('Add filter'));

  expect(
    queryByText(
      /Filters must be of the format labelKey:labelValue and contain accepted label characters/i
    )
  ).toBeTruthy();
});
