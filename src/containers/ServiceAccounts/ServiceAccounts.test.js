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
import { fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { urls } from '@tektoncd/dashboard-utils';
import { renderWithRouter } from '@tektoncd/dashboard-components/src/utils/test';

import ServiceAccounts from '.';
import * as API from '../../api/serviceAccounts';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const byNamespace = {
  default: {
    'foo-service-account': '1234567890'
  }
};

const uid = '1234567890';
const byId = {
  [uid]: {
    metadata: {
      name: 'foo-service-account',
      namespace: 'default',
      uid
    }
  }
};

const namespaces = {
  byName: {
    default: {
      metadata: {
        name: 'default'
      }
    }
  },
  errorMessage: null,
  isFetching: false,
  selected: '*'
};

it('ServiceAccounts renders with no bindings', () => {
  jest.spyOn(API, 'getServiceAccounts').mockImplementation(() => []);

  const store = mockStore({
    serviceAccounts: {
      byId: {},
      byNamespace: {},
      isFetching: false,
      errorMessage: null
    },
    namespaces,
    notifications: {},
    properties: {}
  });

  const { getByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path={urls.serviceAccounts.all()}
        render={props => <ServiceAccounts {...props} />}
      />
    </Provider>,
    { route: urls.serviceAccounts.all() }
  );

  expect(getByText('ServiceAccounts')).toBeTruthy();
  expect(getByText('No ServiceAccounts in any namespace.')).toBeTruthy();
});

it('ServiceAccounts renders with one binding', () => {
  jest.spyOn(API, 'getServiceAccounts').mockImplementation(() => []);

  const store = mockStore({
    serviceAccounts: {
      byId,
      byNamespace,
      isFetching: false,
      errorMessage: null
    },
    namespaces,
    notifications: {},
    properties: {}
  });

  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path={urls.serviceAccounts.all()}
        render={props => <ServiceAccounts {...props} />}
      />
    </Provider>,
    { route: urls.serviceAccounts.all() }
  );

  expect(queryByText('ServiceAccounts')).toBeTruthy();
  expect(queryByText('No ServiceAccounts in any namespace.')).toBeFalsy();
  expect(queryByText('foo-service-account')).toBeTruthy();
});

it('ServiceAccounts can be filtered on a single label filter', async () => {
  jest.spyOn(API, 'getServiceAccounts').mockImplementation(() => []);

  const store = mockStore({
    serviceAccounts: {
      byId,
      byNamespace,
      isFetching: true,
      errorMessage: null
    },
    namespaces,
    notifications: {},
    properties: {}
  });

  const { getByTestId, getByText, queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path={urls.serviceAccounts.all()}
        render={props => <ServiceAccounts {...props} />}
      />
    </Provider>,
    { route: urls.serviceAccounts.all() }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.submit(getByText(/Input a label filter/i));

  expect(queryByText(filterValue)).toBeTruthy();
  expect(queryByText('foo-service-account')).toBeFalsy();
});

it('ServiceAccounts renders in loading state', () => {
  jest.spyOn(API, 'getServiceAccounts').mockImplementation(() => []);

  const store = mockStore({
    serviceAccounts: {
      byId: {},
      byNamespace: {},
      isFetching: true,
      errorMessage: null
    },
    namespaces,
    notifications: {},
    properties: {}
  });

  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path={urls.serviceAccounts.all()}
        render={props => <ServiceAccounts {...props} />}
      />
    </Provider>,
    { route: urls.serviceAccounts.all() }
  );

  expect(queryByText(/ServiceAccounts/i)).toBeTruthy();
  expect(queryByText('No ServiceAccounts in any namespace.')).toBeFalsy();
});
