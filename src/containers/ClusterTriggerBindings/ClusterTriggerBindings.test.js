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
import { Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@tektoncd/dashboard-components/src/utils/test';

import ClusterTriggerBindings from '.';
import * as API from '../../api/clusterTriggerBindings';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const byNamespace = {
  default: {
    'cluster-trigger-binding': 'c930f02e-0582-11ea-8c1f-025765432111'
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

const byId = {
  'c930f02e-0582-11ea-8c1f-025765432111': {
    apiVersion: 'triggers.tekton.dev/v1alpha1',
    kind: 'ClusterTriggerBinding',
    metadata: {
      creationTimestamp: '2019-11-12T19:29:46Z',
      name: 'cluster-trigger-binding',
      namespace: 'default',
      uid: 'c930f02e-0582-11ea-8c1f-025765432111'
    }
  }
};

it('ClusterTriggerBindings renders with no bindings', () => {
  jest.spyOn(API, 'getClusterTriggerBindings').mockImplementation(() => []);

  const store = mockStore({
    clusterTriggerBindings: {
      byId: {},
      isFetching: false,
      byNamespace,
      errorMessage: null
    },
    namespaces,
    notifications: {},
    properties: {}
  });

  const { getByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path="/clustertriggerbindings"
        render={props => <ClusterTriggerBindings {...props} />}
      />
    </Provider>,
    { route: '/clustertriggerbindings' }
  );

  expect(getByText('ClusterTriggerBindings')).toBeTruthy();
  expect(getByText('No ClusterTriggerBindings')).toBeTruthy();
});

it('ClusterTriggerBindings renders with one binding', () => {
  jest.spyOn(API, 'getClusterTriggerBindings').mockImplementation(() => []);

  const store = mockStore({
    clusterTriggerBindings: {
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
        path="/clusterTriggerBindings"
        render={props => <ClusterTriggerBindings {...props} />}
      />
    </Provider>,
    { route: '/clusterTriggerBindings' }
  );

  expect(queryByText('ClusterTriggerBindings')).toBeTruthy();
  expect(queryByText('No ClusterTriggerBindings')).toBeTruthy();
  expect(queryByText('cluster-trigger-binding')).toBeFalsy();
});

it('ClusterTriggerBindings can be filtered on a single label filter', async () => {
  jest.spyOn(API, 'getClusterTriggerBindings').mockImplementation(() => []);

  const store = mockStore({
    clusterTriggerBindings: {
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
        path="/clustertriggerbindings"
        render={props => <ClusterTriggerBindings {...props} />}
      />
    </Provider>,
    { route: '/clustertriggerbindings' }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.submit(getByText(/Input a label filter/i));

  expect(queryByText(filterValue)).toBeTruthy();
  expect(queryByText('cluster-trigger-bindings')).toBeFalsy();
});

it('ClusterTriggerBindings renders in loading state', () => {
  jest.spyOn(API, 'getClusterTriggerBindings').mockImplementation(() => []);

  const store = mockStore({
    clusterTriggerBindings: {
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
        path="/clustertriggerbindings"
        render={props => <ClusterTriggerBindings {...props} />}
      />
    </Provider>,
    { route: '/clustertriggerbindings' }
  );

  expect(queryByText(/ClusterTriggerBindings/i)).toBeTruthy();
  expect(
    queryByText('No ClusterTriggerBindings in any namespace.')
  ).toBeFalsy();
  expect(queryByText('cluster-trigger-bindings')).toBeFalsy();
});
