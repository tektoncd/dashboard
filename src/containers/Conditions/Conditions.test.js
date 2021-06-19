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
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Route } from 'react-router-dom';
import { paths, urls } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
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

const conditionWithSingleLabel = {
  metadata: {
    name: 'conditionWithSingleLabel',
    namespace: 'namespace-1',
    uid: 'conditionWithSingleLabel-id',
    labels: {
      foo: 'bar'
    }
  }
};

const conditionWithTwoLabels = {
  metadata: {
    name: 'conditionWithTwoLabels',
    namespace: 'namespace-1',
    labels: {
      foo: 'bar',
      baz: 'bam'
    },
    uid: 'conditionWithTwoLabels-id'
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

describe('Conditions', () => {
  it('renders loading state', async () => {
    jest
      .spyOn(API, 'useConditions')
      .mockImplementation(() => ({ isLoading: true }));
    const mockTestStore = mockStore({
      ...namespacesTestStore,
      notifications: {}
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

  it('renders', async () => {
    jest.spyOn(API, 'useConditions').mockImplementation(({ filters }) => ({
      data: filters.length
        ? [conditionWithTwoLabels]
        : [conditionWithSingleLabel, conditionWithTwoLabels]
    }));
    const mockTestStore = mockStore(testStore);
    const { getByPlaceholderText, getByText, queryByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={paths.conditions.all()}
          render={props => <ConditionsContainer {...props} />}
        />
      </Provider>,
      { route: urls.conditions.all() }
    );

    expect(queryByText('conditionWithSingleLabel')).toBeTruthy();

    const filterValue = 'baz:bam';
    const filterInputField = getByPlaceholderText(/Input a label filter/);
    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(queryByText(filterValue)).toBeTruthy();
    expect(queryByText('conditionWithSingleLabel')).toBeFalsy();
    expect(queryByText('conditionWithTwoLabels')).toBeTruthy();
  });

  it('handles error', async () => {
    const error = 'fake_errorMessage';
    jest.spyOn(API, 'useConditions').mockImplementation(() => ({ error }));
    const mockTestStore = mockStore(testStore);
    const { queryByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={paths.conditions.all()}
          render={props => <ConditionsContainer {...props} />}
        />
      </Provider>,
      { route: urls.conditions.all() }
    );

    expect(queryByText(error)).toBeTruthy();
  });
});
