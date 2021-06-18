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
import { Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { renderWithRouter } from '../../utils/test';
import ClusterTriggerBindings from '.';
import * as API from '../../api/clusterTriggerBindings';

const middleware = [thunk];
const mockStore = configureStore(middleware);

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

const clusterTriggerBinding = {
  apiVersion: 'triggers.tekton.dev/v1alpha1',
  kind: 'ClusterTriggerBinding',
  metadata: {
    creationTimestamp: '2019-11-12T19:29:46Z',
    name: 'cluster-trigger-binding',
    namespace: 'default',
    uid: 'c930f02e-0582-11ea-8c1f-025765432111'
  }
};

it('ClusterTriggerBindings renders with no bindings', () => {
  jest.spyOn(API, 'useClusterTriggerBindings').mockImplementation(() => ({
    data: []
  }));

  const store = mockStore({
    namespaces,
    notifications: {}
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
  expect(getByText('No matching ClusterTriggerBindings found')).toBeTruthy();
});

it('ClusterTriggerBindings renders with one binding', () => {
  jest
    .spyOn(API, 'useClusterTriggerBindings')
    .mockImplementation(() => ({ data: [clusterTriggerBinding] }));

  const store = mockStore({
    namespaces,
    notifications: {}
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
  expect(queryByText(clusterTriggerBinding.metadata.name)).toBeTruthy();
});

it('ClusterTriggerBindings can be filtered on a single label filter', async () => {
  jest
    .spyOn(API, 'useClusterTriggerBindings')
    .mockImplementation(({ filters }) => ({
      data: filters.length ? [] : [clusterTriggerBinding]
    }));

  const store = mockStore({
    namespaces,
    notifications: {}
  });

  const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path="/clustertriggerbindings"
        render={props => <ClusterTriggerBindings {...props} />}
      />
    </Provider>,
    { route: '/clustertriggerbindings' }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByPlaceholderText(/Input a label filter/);
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.submit(getByText(/Input a label filter/i));

  expect(queryByText(filterValue)).toBeTruthy();
  expect(queryByText('cluster-trigger-bindings')).toBeFalsy();
});

it('ClusterTriggerBindings renders in loading state', () => {
  jest
    .spyOn(API, 'useClusterTriggerBindings')
    .mockImplementation(() => ({ isLoading: true }));

  const store = mockStore({
    namespaces,
    notifications: {}
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
  expect(queryByText('No matching ClusterTriggerBindings found')).toBeFalsy();
  expect(queryByText('cluster-trigger-bindings')).toBeFalsy();
});

it('ClusterTriggerBindings renders in error state', () => {
  const error = 'fake_error_message';
  jest
    .spyOn(API, 'useClusterTriggerBindings')
    .mockImplementation(() => ({ error }));

  const store = mockStore({
    namespaces,
    notifications: {}
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

  expect(queryByText(error)).toBeTruthy();
});
