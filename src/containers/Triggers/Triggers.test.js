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
import { fireEvent } from '@testing-library/react';
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

const triggersTestStore = {
  triggers: {
    isFetching: false,
    byId: {
      'triggerWithTwoLabels-id': {
        metadata: {
          name: 'triggerWithTwoLabels',
          namespace: 'namespace-1',
          labels: {
            foo: 'bar',
            baz: 'bam'
          },
          uid: 'triggerWithTwoLabels-id'
        }
      },
      'triggerWithSingleLabel-id': {
        metadata: {
          name: 'triggerWithSingleLabel',
          namespace: 'namespace-1',
          uid: 'triggerWithSingleLabel-id',
          labels: {
            foo: 'bar'
          }
        }
      }
    },
    byNamespace: {
      'namespace-1': {
        triggerWithTwoLabels: 'triggerWithTwoLabels-id',
        triggerWithSingleLabel: 'triggerWithSingleLabel-id'
      }
    }
  }
};
const middleware = [thunk];
const mockStore = configureStore(middleware);
const testStore = {
  ...namespacesTestStore,
  notifications: {
    webSocketConnected: false
  },
  ...triggersTestStore
};

describe('Triggers', () => {
  beforeEach(() => {
    jest.spyOn(API, 'getTriggers').mockImplementation(() => []);
  });

  it('renders loading state', async () => {
    const mockTestStore = mockStore({
      triggers: { byId: {}, byNamespace: {}, isFetching: true },
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

  it('handles updates', async () => {
    const mockTestStore = mockStore(testStore);
    const {
      container,
      getByPlaceholderText,
      getByText,
      queryByText
    } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={paths.triggers.all()}
          render={props => <TriggersContainer {...props} />}
        />
      </Provider>,
      { route: urls.triggers.all() }
    );

    expect(queryByText('triggerWithSingleLabel')).toBeTruthy();
    expect(API.getTriggers).toHaveBeenCalledTimes(1);

    const filterValue = 'baz:bam';
    const filterInputField = getByPlaceholderText(/Input a label filter/);
    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(queryByText(filterValue)).toBeTruthy();
    expect(queryByText('triggerWithSingleLabel')).toBeFalsy();
    expect(queryByText('triggerWithTwoLabels')).toBeTruthy();
    expect(API.getTriggers).toHaveBeenCalledTimes(2);

    renderWithRouter(
      <Provider
        store={mockStore({
          ...testStore,
          notifications: {
            webSocketConnected: true
          },
          propeties: {}
        })}
      >
        <Route
          path={paths.triggers.all()}
          render={props => <TriggersContainer {...props} />}
        />
      </Provider>,
      { container, route: urls.triggers.all() }
    );

    expect(API.getTriggers).toHaveBeenCalledTimes(3);
  });

  it('handles error', async () => {
    const errorMessage = 'fake_errorMessage';
    const mockTestStore = mockStore({
      ...testStore,
      triggers: { ...triggersTestStore.triggers, errorMessage }
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
