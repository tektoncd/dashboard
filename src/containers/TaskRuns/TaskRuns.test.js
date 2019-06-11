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
import { Provider } from 'react-redux';
import { waitForElement } from 'react-testing-library';
import configureStore from 'redux-mock-store';

import thunk from 'redux-thunk';
import * as API from '../../api';
import TaskRuns from './TaskRuns';
import { renderWithRouter } from '../../utils/test';

beforeEach(jest.resetAllMocks);

it('TaskRunsContainer renders', async () => {
  const taskName = 'taskName';
  const match = {
    params: {
      taskName
    }
  };
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const testStore = mockStore({
    tasks: {
      byNamespace: { default: {} }
    },
    namespaces: {
      selected: 'default'
    },
    taskRuns: {
      byId: {},
      byNamespace: { default: {} },
      errorMessage: null,
      isFetching: false
    }
  });
  jest
    .spyOn(API, 'getTask')
    .mockImplementation(() => [{ metadata: { name: taskName } }]);
  jest.spyOn(API, 'getTaskRuns').mockImplementation(() => []);

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <TaskRuns match={match} />
    </Provider>
  );
  await waitForElement(() => getByText(/Task/i));
});

it('TaskRunsContainer handles info state', async () => {
  const notificationMessage = 'Task runs not available';
  const taskName = 'taskName';
  const match = {
    params: {
      taskName
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const testStore = mockStore({
    tasks: {
      byNamespace: { default: {} }
    },
    namespaces: {
      selected: 'default'
    },
    taskRuns: {
      byId: {},
      byNamespace: { default: {} },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <TaskRuns match={match} />
    </Provider>
  );
  await waitForElement(() => getByText(notificationMessage));
});

it('TaskRunsContainer handles error state', async () => {
  const match = {
    params: {
      taskName: 'foo'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const testStore = mockStore({
    tasks: {
      byNamespace: { default: {} }
    },
    namespaces: {
      selected: 'default'
    },
    taskRuns: {
      byId: {},
      byNamespace: { default: {} },
      errorMessage: 'fake error message',
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <TaskRuns match={match} />
    </Provider>
  );
  await waitForElement(() => getByText('Error loading task run'));
});
