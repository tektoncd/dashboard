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
import { ALL_NAMESPACES, paths, urls } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
import * as API from '../../api/clusterInterceptors';
import ClusterInterceptorsContainer from './ClusterInterceptors';

const namespacesTestStore = {
  namespaces: {
    selected: ALL_NAMESPACES,
    byName: {},
    isFetching: false
  }
};

const clusterInterceptor = {
  metadata: {
    name: 'clusterInterceptorWithSingleLabel',
    uid: 'clusterInterceptorWithSingleLabel-id',
    labels: {
      foo: 'bar'
    }
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

describe('ClusterInterceptors', () => {
  it('renders loading state', async () => {
    const mockTestStore = mockStore({
      ...namespacesTestStore,
      notifications: {}
    });
    jest
      .spyOn(API, 'useClusterInterceptors')
      .mockImplementation(() => ({ isLoading: true }));
    const { queryByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={paths.clusterInterceptors.all()}
          render={props => <ClusterInterceptorsContainer {...props} />}
        />
      </Provider>,
      { route: urls.clusterInterceptors.all() }
    );
    expect(queryByText('ClusterInterceptors')).toBeTruthy();
  });

  it('renders data', async () => {
    const mockTestStore = mockStore(testStore);
    jest
      .spyOn(API, 'useClusterInterceptors')
      .mockImplementation(() => ({ data: [clusterInterceptor] }));
    const { queryByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={paths.clusterInterceptors.all()}
          render={props => <ClusterInterceptorsContainer {...props} />}
        />
      </Provider>,
      { route: urls.clusterInterceptors.all() }
    );

    expect(queryByText('clusterInterceptorWithSingleLabel')).toBeTruthy();
  });

  it('handles error', async () => {
    const error = 'fake_errorMessage';
    jest
      .spyOn(API, 'useClusterInterceptors')
      .mockImplementation(() => ({ error }));
    const mockTestStore = mockStore(testStore);
    const { queryByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={paths.clusterInterceptors.all()}
          render={props => <ClusterInterceptorsContainer {...props} />}
        />
      </Provider>,
      { route: urls.clusterInterceptors.all() }
    );

    expect(queryByText(error)).toBeTruthy();
  });
});
