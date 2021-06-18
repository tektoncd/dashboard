/*
Copyright 2021 The Tekton Authors
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
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Route } from 'react-router-dom';
import { paths, urls } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
import * as API from '../../api/triggers';
import TriggersContainer from './Triggers';

const namespacesTestStore = {
  namespaces: {
    selected: 'namespace-1',
    byName: {
      'namespace-1': ''
    },
    isFetching: false
  }
};

const middleware = [thunk];
const mockStore = configureStore(middleware);
const testStore = {
  ...namespacesTestStore,
  notifications: {
    webSocketConnected: false
  }
};

describe('Triggers', () => {
  beforeEach(() => {
    jest.spyOn(API, 'getTriggers').mockImplementation(() => []);
  });

  it('renders loading state', async () => {
    jest
      .spyOn(API, 'useTriggers')
      .mockImplementation(() => ({ isLoading: true }));
    const mockTestStore = mockStore({
      ...namespacesTestStore,
      notifications: {}
    });
    const { queryByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={paths.triggers.all()}
          render={props => <TriggersContainer {...props} />}
        />
      </Provider>,
      { route: urls.triggers.all() }
    );
    expect(queryByText('Triggers')).toBeTruthy();
  });

  it('renders resources', async () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(API, 'useTriggers').mockImplementation(() => ({
      data: [
        {
          metadata: {
            name: 'triggerWithSingleLabel',
            namespace: 'namespace-1',
            uid: 'triggerWithSingleLabel-id',
            labels: {
              foo: 'bar'
            }
          }
        }
      ]
    }));
    const { queryByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={paths.triggers.all()}
          render={props => <TriggersContainer {...props} />}
        />
      </Provider>,
      { route: urls.triggers.all() }
    );

    expect(queryByText('triggerWithSingleLabel')).toBeTruthy();
  });

  it('handles error', async () => {
    const errorMessage = 'fake_errorMessage';
    jest
      .spyOn(API, 'useTriggers')
      .mockImplementation(() => ({ error: errorMessage }));
    const mockTestStore = mockStore({
      ...testStore
    });
    const { queryByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={paths.triggers.all()}
          render={props => <TriggersContainer {...props} />}
        />
      </Provider>,
      { route: urls.triggers.all() }
    );

    expect(queryByText(errorMessage)).toBeTruthy();
  });
});
