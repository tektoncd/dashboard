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

const clusterInterceptorsTestStore = {
  clusterInterceptors: {
    isFetching: false,
    byId: {
      'clusterInterceptorWithTwoLabels-id': {
        metadata: {
          name: 'clusterInterceptorWithTwoLabels',
          labels: {
            foo: 'bar',
            baz: 'bam'
          },
          uid: 'clusterInterceptorWithTwoLabels-id'
        }
      },
      'clusterInterceptorWithSingleLabel-id': {
        metadata: {
          name: 'clusterInterceptorWithSingleLabel',
          uid: 'clusterInterceptorWithSingleLabel-id',
          labels: {
            foo: 'bar'
          }
        }
      }
    },
    byNamespace: {
      [undefined]: {
        clusterInterceptorWithTwoLabels: 'clusterInterceptorWithTwoLabels-id',
        clusterInterceptorWithSingleLabel:
          'clusterInterceptorWithSingleLabel-id'
      }
    }
  }
};
const middleware = [thunk];
const mockStore = configureStore(middleware);
const testStore = {
  ...clusterInterceptorsTestStore,
  ...namespacesTestStore,
  notifications: {
    webSocketConnected: false
  }
};

describe('ClusterInterceptors', () => {
  beforeEach(() => {
    jest.spyOn(API, 'getClusterInterceptors').mockImplementation(() => []);
  });

  it('renders loading state', async () => {
    const mockTestStore = mockStore({
      clusterInterceptors: { byId: {}, byNamespace: {}, isFetching: true },
      ...namespacesTestStore,
      notifications: {}
    });
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
          path={paths.clusterInterceptors.all()}
          render={props => <ClusterInterceptorsContainer {...props} />}
        />
      </Provider>,
      { route: urls.clusterInterceptors.all() }
    );

    expect(queryByText('clusterInterceptorWithSingleLabel')).toBeTruthy();
    expect(API.getClusterInterceptors).toHaveBeenCalledTimes(1);

    const filterValue = 'baz:bam';
    const filterInputField = getByPlaceholderText(/Input a label filter/);
    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(queryByText(filterValue)).toBeTruthy();
    expect(queryByText('clusterInterceptorWithSingleLabel')).toBeFalsy();
    expect(queryByText('clusterInterceptorWithTwoLabels')).toBeTruthy();
    expect(API.getClusterInterceptors).toHaveBeenCalledTimes(2);

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
          path={paths.clusterInterceptors.all()}
          render={props => <ClusterInterceptorsContainer {...props} />}
        />
      </Provider>,
      { container, route: urls.clusterInterceptors.all() }
    );

    expect(API.getClusterInterceptors).toHaveBeenCalledTimes(3);
  });

  it('handles error', async () => {
    const errorMessage = 'fake_errorMessage';
    const mockTestStore = mockStore({
      ...testStore,
      clusterInterceptors: {
        ...clusterInterceptorsTestStore.clusterInterceptors,
        errorMessage
      }
    });
    const { queryByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={paths.clusterInterceptors.all()}
          render={props => <ClusterInterceptorsContainer {...props} />}
        />
      </Provider>,
      { route: urls.clusterInterceptors.all() }
    );

    expect(queryByText(errorMessage)).toBeTruthy();
  });
});
