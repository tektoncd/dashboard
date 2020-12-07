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
import { renderWithRouter } from '@tektoncd/dashboard-components/src/utils/test';

import EventListeners from '.';
import * as API from '../../api/eventListeners';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const byNamespace = {
  default: {
    'event-listener': 'c930f02e-0582-11ea-8c1f-025765432111'
  }
};

const byId = {
  'c930f02e-0582-11ea-8c1f-025765432111': {
    apiVersion: 'triggers.tekton.dev/v1alpha1',
    kind: 'EventListener',
    metadata: {
      creationTimestamp: '2019-11-12T19:29:46Z',
      name: 'event-listener',
      namespace: 'default',
      uid: 'c930f02e-0582-11ea-8c1f-025765432111'
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

it('EventListeners renders with no bindings', () => {
  jest.spyOn(API, 'getEventListeners').mockImplementation(() => []);

  const store = mockStore({
    eventListeners: {
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
        path="/eventlisteners"
        render={props => <EventListeners {...props} />}
      />
    </Provider>,
    { route: '/eventlisteners' }
  );

  expect(getByText('EventListeners')).toBeTruthy();
  expect(getByText('No EventListeners in any namespace.')).toBeTruthy();
});

it('EventListeners renders with one binding', () => {
  jest.spyOn(API, 'getEventListeners').mockImplementation(() => []);

  const store = mockStore({
    eventListeners: {
      byId,
      byNamespace,
      isFetching: false,
      errorMessage: null
    },
    namespaces,
    notifications: {},
    properties: {}
  });

  const { queryByText, queryByTitle } = renderWithRouter(
    <Provider store={store}>
      <Route
        path="/eventlisteners"
        render={props => <EventListeners {...props} />}
      />
    </Provider>,
    { route: '/eventlisteners' }
  );

  expect(queryByText('EventListeners')).toBeTruthy();
  expect(queryByText('No EventListeners in any namespace.')).toBeFalsy();
  expect(queryByText('event-listener')).toBeTruthy();
  expect(queryByTitle('event-listener')).toBeTruthy();
});

it('EventListeners can be filtered on a single label filter', async () => {
  jest.spyOn(API, 'getEventListeners').mockImplementation(() => []);

  const store = mockStore({
    eventListeners: {
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
        path="/eventlisteners"
        render={props => <EventListeners {...props} />}
      />
    </Provider>,
    { route: '/eventlisteners' }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.submit(getByText(/Input a label filter/i));

  expect(queryByText(filterValue)).toBeTruthy();
  expect(queryByText('event-listeners')).toBeFalsy();
});

it('EventListeners renders in loading state', () => {
  jest.spyOn(API, 'getEventListeners').mockImplementation(() => []);

  const store = mockStore({
    eventListeners: {
      byId,
      byNamespace,
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
        path="/eventlisteners"
        render={props => <EventListeners {...props} />}
      />
    </Provider>,
    { route: '/eventlisteners' }
  );

  expect(queryByText(/EventListeners/i)).toBeTruthy();
  expect(queryByText('No EventListeners in any namespace.')).toBeFalsy();
  expect(queryByText('event-listeners')).toBeFalsy();
});
