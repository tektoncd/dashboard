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
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Route } from 'react-router-dom';
import { paths, urls } from '@tektoncd/dashboard-utils';
import { renderWithRouter } from '@tektoncd/dashboard-components/src/utils/test';

import * as API from '../../api/conditions';
import ConditionsContainer from './Conditions';

const namespacesTestStore = {
  namespaces: {
    selected: 'namespace-1',
    byName: {
      'namespace-1': ''
    },
    isFetching: false
  }
};

const conditionsTestStore = {
  conditions: {
    isFetching: false,
    byId: {
      'conditionWithTwoLabels-id': {
        metadata: {
          name: 'conditionWithTwoLabels',
          namespace: 'namespace-1',
          labels: {
            foo: 'bar',
            baz: 'bam'
          },
          uid: 'conditionWithTwoLabels-id'
        }
      },
      'conditionWithSingleLabel-id': {
        metadata: {
          name: 'conditionWithSingleLabel',
          namespace: 'namespace-1',
          uid: 'conditionWithSingleLabel-id',
          labels: {
            foo: 'bar'
          }
        }
      }
    },
    byNamespace: {
      'namespace-1': {
        conditionWithTwoLabels: 'conditionWithTwoLabels-id',
        conditionWithSingleLabel: 'conditionWithSingleLabel-id'
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
  properties: {},
  ...conditionsTestStore
};

describe('Conditions', () => {
  beforeEach(() => {
    jest.spyOn(API, 'getConditions').mockImplementation(() => []);
  });

  it('renders loading state', async () => {
    const mockTestStore = mockStore({
      conditions: { byId: {}, byNamespace: {}, isFetching: true },
      ...namespacesTestStore,
      notifications: {},
      properties: {}
    });
    const { queryByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={paths.conditions.all()}
          render={props => <ConditionsContainer {...props} />}
        />
      </Provider>,
      { route: urls.conditions.all() }
    );
    expect(queryByText('Conditions')).toBeTruthy();
  });

  it('handles updates', async () => {
    const mockTestStore = mockStore(testStore);
    const { container, getByTestId, getByText, queryByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={paths.conditions.all()}
          render={props => <ConditionsContainer {...props} />}
        />
      </Provider>,
      { route: urls.conditions.all() }
    );

    expect(queryByText('conditionWithSingleLabel')).toBeTruthy();
    expect(API.getConditions).toHaveBeenCalledTimes(1);

    const filterValue = 'baz:bam';
    const filterInputField = getByTestId('filter-search-bar');
    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(queryByText(filterValue)).toBeTruthy();
    expect(queryByText('conditionWithSingleLabel')).toBeFalsy();
    expect(queryByText('conditionWithTwoLabels')).toBeTruthy();
    expect(API.getConditions).toHaveBeenCalledTimes(2);

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
          path={paths.conditions.all()}
          render={props => <ConditionsContainer {...props} />}
        />
      </Provider>,
      { container, route: urls.conditions.all() }
    );

    expect(API.getConditions).toHaveBeenCalledTimes(3);
  });

  it('handles error', async () => {
    const errorMessage = 'fake_errorMessage';
    const mockTestStore = mockStore({
      ...testStore,
      conditions: { ...conditionsTestStore.conditions, errorMessage }
    });
    const { queryByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={paths.conditions.all()}
          render={props => <ConditionsContainer {...props} />}
        />
      </Provider>,
      { route: urls.conditions.all() }
    );

    expect(queryByText(errorMessage)).toBeTruthy();
  });
});
