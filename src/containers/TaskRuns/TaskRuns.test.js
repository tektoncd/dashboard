/*
Copyright 2019-2020 The Tekton Authors
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
import { fireEvent, waitForElement } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Route } from 'react-router-dom';
import { urls } from '@tektoncd/dashboard-utils';
import { renderWithRouter } from '@tektoncd/dashboard-components/src/utils/test';

import * as API from '../../api/taskRuns';
import * as selectors from '../../reducers';
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
const serviceAccountsTestStore = {
  serviceAccounts: {
    byNamespace: {
      'namespace-1': {
        'service-account-1': 'id-service-account-1'
      }
    },
    byId: {
      'id-service-account-1': {
        metadata: {
          name: 'service-account-1',
          namespace: 'namespace-1',
          uid: 'id-service-account-1'
        }
      }
    },
    isFetching: false
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
  properties: {},
  ...taskRunsTestStore,
  ...tasksTestStore,
  ...serviceAccountsTestStore
};

describe('TaskRuns container', () => {
  beforeEach(() => {
    jest.spyOn(API, 'getTaskRuns').mockImplementation(() => []);
    jest
      .spyOn(store, 'getStore')
      .mockImplementation(() => mockStore(testStore));
  });

  it('taskRuns can be filtered on a single label filter', async () => {
    const match = {
      params: {},
      url: urls.taskRuns.all()
    };

    const { queryByText, getByTestId, getByText } = renderWithRouter(
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
    const filterInputField = getByTestId('filter-search-bar');
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

    const { queryByText, getByTestId, getByText } = renderWithRouter(
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
    const filterInputField = getByTestId('filter-search-bar');
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

    const { queryByText, getByTestId, getByText } = renderWithRouter(
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
    const filterInputField = getByTestId('filter-search-bar');
    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));

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
    const match = {
      params: {},
      url: urls.taskRuns.all()
    };

    const { queryByText, getByTestId, getByText } = renderWithRouter(
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
    const filterInputField = getByTestId('filter-search-bar');
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

    const { queryByText, getByTestId, getByText } = renderWithRouter(
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
    const filterInputField = getByTestId('filter-search-bar');
    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(
      queryByText(
        /Filters must be of the format labelKey:labelValue and contain accepted label characters/i
      )
    ).toBeTruthy();
  });

  it('TaskRun actions are available when not in read-only mode', async () => {
    jest.spyOn(selectors, 'isReadOnly').mockImplementation(() => false);

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

    await waitForElement(() => getByText('taskRunWithTwoLabels'));
    expect(getAllByTitle(/actions/i)[0]).toBeTruthy();
  });

  it('TaskRun actions are not available when in read-only mode', async () => {
    jest.spyOn(selectors, 'isReadOnly').mockImplementation(() => true);

    const match = {
      params: {},
      url: urls.taskRuns.all()
    };

    const { getByText, queryAllByTitle } = renderWithRouter(
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

    await waitForElement(() => getByText('taskRunWithTwoLabels'));
    expect(queryAllByTitle(/actions/i)[0]).toBeFalsy();
  });

  it('handles rerun event in TaskRuns page', async () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(selectors, 'isReadOnly').mockImplementation(() => false);
    jest.spyOn(API, 'rerunTaskRun').mockImplementation(() => []);
    const { getAllByTestId, getByText } = renderWithRouter(
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
    await waitForElement(() => getByText(/taskRunWithTwoLabels/i));
    fireEvent.click(
      await waitForElement(() => getAllByTestId('overflowmenu')[0])
    );
    await waitForElement(() => getByText(/Rerun/i));
    fireEvent.click(getByText('Rerun'));
    expect(API.rerunTaskRun).toHaveBeenCalledTimes(1);
    expect(API.rerunTaskRun).toHaveBeenCalledWith(
      taskRunsTestStore.taskRuns.byId['taskRunWithSingleLabel-id']
    );
  });
});
