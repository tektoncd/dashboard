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
import { fireEvent } from 'react-testing-library';
import { Provider } from 'react-redux';
import { Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import TriggerBindings from '.';
import { renderWithRouter } from '../../utils/test';
import * as API from '../../api';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const byNamespace = {
  default: {
    'trigger-binding': 'c930f02e-0582-11ea-8c1f-025765432111'
  }
};

const byId = {
  'c930f02e-0582-11ea-8c1f-025765432111': {
    apiVersion: 'tekton.dev/v1alpha1',
    kind: 'triggerBinding',
    metadata: {
      creationTimestamp: '2019-11-12T19:29:46Z',
      name: 'trigger-binding',
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

it('TriggerBindings renders with no bindings', () => {
  jest.spyOn(API, 'getTriggerBindings').mockImplementation(() => []);

  const store = mockStore({
    triggerBindings: {
      byId: {},
      byNamespace: {},
      isFetching: false,
      errorMessage: null
    },
    namespaces,
    notifications: {}
  });

  const { getByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path="/triggerbindings"
        render={props => <TriggerBindings {...props} />}
      />
    </Provider>,
    { route: '/triggerbindings' }
  );

  expect(getByText('TriggerBindings')).toBeTruthy();
  expect(getByText('No TriggerBindings under any namespace.')).toBeTruthy();
});

it('TriggerBindings renders with one binding', () => {
  jest.spyOn(API, 'getTriggerBindings').mockImplementation(() => []);

  const store = mockStore({
    triggerBindings: {
      byId,
      byNamespace,
      isFetching: false,
      errorMessage: null
    },
    namespaces,
    notifications: {}
  });

  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path="/triggerbindings"
        render={props => <TriggerBindings {...props} />}
      />
    </Provider>,
    { route: '/triggerbindings' }
  );

  expect(queryByText('TriggerBindings')).toBeTruthy();
  expect(queryByText('No TriggerBindings under any namespace.')).toBeFalsy();
  expect(queryByText('trigger-binding')).toBeTruthy();
});

it('TriggerBindings can be filtered on a single label filter', async () => {
  jest.spyOn(API, 'getTriggerBindings').mockImplementation(() => []);

  const store = mockStore({
    triggerBindings: {
      byId,
      byNamespace,
      isFetching: true,
      errorMessage: null
    },
    namespaces,
    notifications: {}
  });

  const { queryByText, getByTestId, getByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path="/triggerbindings"
        render={props => <TriggerBindings {...props} />}
      />
    </Provider>,
    { route: '/triggerbindings' }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.submit(getByText(/Input a label filter/i));

  expect(queryByText(filterValue)).toBeTruthy();
  expect(queryByText('trigger-bindings')).toBeFalsy();
});

it('TriggerBindings renders in loading state', () => {
  jest.spyOn(API, 'getTriggerBindings').mockImplementation(() => []);

  const store = mockStore({
    triggerBindings: {
      byId,
      byNamespace,
      isFetching: true,
      errorMessage: null
    },
    namespaces,
    notifications: {}
  });

  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path="/triggerbindings"
        render={props => <TriggerBindings {...props} />}
      />
    </Provider>,
    { route: '/triggerbindings' }
  );

  expect(queryByText(/TriggerBindings/i)).toBeTruthy();
  expect(queryByText('No TriggerBindings under any namespace.')).toBeFalsy();
  expect(queryByText('trigger-bindings')).toBeFalsy();
});
