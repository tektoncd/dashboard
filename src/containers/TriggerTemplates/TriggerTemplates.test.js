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

import TriggerTemplates from '.';
import * as API from '../../api/triggerTemplates';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const byNamespace = {
  default: {
    'trigger-template': 'c930f02e-0582-11ea-8c1f-025765432111'
  }
};

const byId = {
  'c930f02e-0582-11ea-8c1f-025765432111': {
    apiVersion: 'triggers.tekton.dev/v1alpha1',
    kind: 'TriggerTemplate',
    metadata: {
      creationTimestamp: '2019-11-12T19:29:46Z',
      name: 'trigger-template',
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

it('TriggerTemplates renders with no templates', () => {
  jest.spyOn(API, 'getTriggerTemplates').mockImplementation(() => []);

  const store = mockStore({
    triggerTemplates: {
      byId: {},
      byNamespace: {},
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
        path="/triggerTemplates"
        render={props => <TriggerTemplates {...props} />}
      />
    </Provider>,
    { route: '/triggerTemplates' }
  );

  expect(queryByText('TriggerTemplates')).toBeTruthy();
  expect(queryByText('No TriggerTemplates in any namespace.')).toBeTruthy();
});

it('TriggerTemplates renders with one template', () => {
  jest.spyOn(API, 'getTriggerTemplates').mockImplementation(() => []);

  const store = mockStore({
    triggerTemplates: {
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
        path="/triggerTemplates"
        render={props => <TriggerTemplates {...props} />}
      />
    </Provider>,
    { route: '/triggerTemplates' }
  );

  expect(queryByText(/TriggerTemplates/i)).toBeTruthy();
  expect(queryByText('No TriggerTemplates in any namespace.')).toBeFalsy();
  expect(queryByText('trigger-template')).toBeTruthy();
});

it('TriggerTemplates can be filtered on a single label filter', async () => {
  jest.spyOn(API, 'getTriggerTemplates').mockImplementation(() => []);

  const store = mockStore({
    triggerTemplates: {
      byId,
      byNamespace,
      isFetching: true,
      errorMessage: null
    },
    namespaces,
    notifications: {},
    properties: {}
  });

  const { queryByText, getByTestId, getByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path="/triggerTemplates"
        render={props => <TriggerTemplates {...props} />}
      />
    </Provider>,
    { route: '/triggerTemplates' }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.submit(getByText(/Input a label filter/i));

  expect(queryByText(filterValue)).toBeTruthy();
  expect(queryByText('trigger-template')).toBeFalsy();
});

it('TriggerTemplates renders in loading state', () => {
  jest.spyOn(API, 'getTriggerTemplates').mockImplementation(() => []);

  const store = mockStore({
    triggerTemplates: {
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
        path="/triggerTemplates"
        render={props => <TriggerTemplates {...props} />}
      />
    </Provider>,
    { route: '/triggerTemplates' }
  );

  expect(queryByText(/TriggerTemplates/i)).toBeTruthy();
  expect(queryByText('No TriggerTemplates in any namespace.')).toBeFalsy();
});
