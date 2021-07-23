/*
Copyright 2019-2021 The Tekton Authors
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
import { waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { App } from './App';
import { render } from '../../utils/test';
import * as API from '../../api';
import * as PipelinesAPI from '../../api/pipelines';

describe('App', () => {
  beforeEach(() => {
    jest
      .spyOn(PipelinesAPI, 'usePipelines')
      .mockImplementation(() => ({ data: [] }));
    jest.spyOn(API, 'useIsReadOnly').mockImplementation(() => true);
    jest.spyOn(API, 'useIsTriggersInstalled').mockImplementation(() => false);
    jest.spyOn(API, 'useTenantNamespace').mockImplementation(() => undefined);
    jest.spyOn(API, 'useNamespaces').mockImplementation(() => ({ data: [] }));
  });

  it('renders successfully in full cluster mode', async () => {
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({
      notifications: {}
    });
    const { queryByText } = render(
      <Provider store={store}>
        <App lang="en" />
      </Provider>
    );

    await waitFor(() => queryByText('Tekton resources'));

    expect(queryByText('Namespace')).toBeTruthy();
    expect(queryByText('Pipelines')).toBeTruthy();
    expect(queryByText('Tasks')).toBeTruthy();
  });

  it('renders successfully in single namespace mode', async () => {
    jest.spyOn(API, 'useTenantNamespace').mockImplementation(() => 'fake');
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({
      notifications: {}
    });
    const { queryByText } = render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    await waitFor(() => queryByText('Tekton resources'));

    expect(queryByText('Namespaces')).toBeFalsy();
    expect(queryByText('Pipelines')).toBeTruthy();
    expect(queryByText('Tasks')).toBeTruthy();
  });

  it('does not call namespaces API in single namespace mode', async () => {
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({
      notifications: {}
    });
    jest.spyOn(API, 'getNamespaces');
    jest.spyOn(API, 'useTenantNamespace').mockImplementation(() => 'fake');
    const { queryByText } = render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    await waitFor(() => queryByText('Tekton resources'));
    expect(API.useNamespaces).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });

  it('calls namespaces API in full cluster mode', async () => {
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({
      notifications: {}
    });
    jest.spyOn(API, 'getNamespaces');
    const { queryByText } = render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    await waitFor(() => queryByText('Tekton resources'));
    await waitFor(() =>
      expect(API.useNamespaces).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: true })
      )
    );
  });
});
