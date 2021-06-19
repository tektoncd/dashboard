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
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import { App } from './App';
import { render } from '../../utils/test';
import * as API from '../../api';
import * as PipelinesAPI from '../../api/pipelines';

describe('App', () => {
  beforeEach(() => {
    jest.spyOn(PipelinesAPI, 'getPipelines').mockImplementation(() => {});
    jest.spyOn(API, 'useIsReadOnly').mockImplementation(() => true);
    jest.spyOn(API, 'useIsTriggersInstalled').mockImplementation(() => false);
    jest.spyOn(API, 'useTenantNamespace').mockImplementation(() => undefined);
  });

  it('renders successfully in full cluster mode', async () => {
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({
      extensions: { byName: {} },
      namespaces: { byName: {} },
      notifications: {},
      pipelines: { byNamespace: {} },
      pipelineRuns: { byNamespace: {} }
    });
    const { queryByText } = render(
      <Provider store={store}>
        <App
          extensions={[]}
          lang="en"
          fetchExtensions={() => {}}
          fetchNamespaces={() => {}}
        />
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
      extensions: { byName: {} },
      namespaces: { byName: {} },
      notifications: {},
      pipelines: { byNamespace: {} },
      pipelineRuns: { byNamespace: {} }
    });
    const { queryByText } = render(
      <Provider store={store}>
        <App
          extensions={[]}
          fetchExtensions={() => {}}
          fetchNamespaces={() => {}}
          selectNamespace={() => {}}
        />
      </Provider>
    );

    await waitFor(() => queryByText('Tekton resources'));

    expect(queryByText('Namespaces')).toBeFalsy();
    expect(queryByText('Pipelines')).toBeTruthy();
    expect(queryByText('Tasks')).toBeTruthy();
  });

  it('selects namespace based on tenant namespace', async () => {
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({
      extensions: { byName: {} },
      namespaces: { byName: {} },
      notifications: {},
      pipelines: { byNamespace: {} },
      pipelineRuns: { byNamespace: {} }
    });
    const selectNamespace = jest.fn();
    jest.spyOn(API, 'useTenantNamespace').mockImplementation(() => 'fake');
    const { queryByText } = render(
      <Provider store={store}>
        <App
          extensions={[]}
          fetchExtensions={() => {}}
          fetchNamespaces={() => {}}
          selectNamespace={selectNamespace}
        />
      </Provider>
    );

    await waitFor(() => queryByText('Tekton resources'));
    expect(selectNamespace).toHaveBeenCalledWith('fake');
  });

  it('does not call fetchNamespaces in single namespace mode', async () => {
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({
      extensions: { byName: {} },
      namespaces: { byName: {} },
      notifications: {},
      pipelines: { byNamespace: {} },
      pipelineRuns: { byNamespace: {} }
    });
    const fetchNamespaces = jest.fn();
    const selectNamespace = jest.fn();
    jest.spyOn(API, 'useTenantNamespace').mockImplementation(() => 'fake');
    const { queryByText } = render(
      <Provider store={store}>
        <App
          extensions={[]}
          fetchExtensions={() => {}}
          fetchNamespaces={fetchNamespaces}
          selectNamespace={selectNamespace}
        />
      </Provider>
    );

    await waitFor(() => queryByText('Tekton resources'));
    expect(selectNamespace).toHaveBeenCalledWith('fake');
    expect(fetchNamespaces).not.toHaveBeenCalled();
  });

  it('calls fetchNamespaces in full cluster mode', async () => {
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({
      extensions: { byName: {} },
      namespaces: { byName: {} },
      notifications: {},
      pipelines: { byNamespace: {} },
      pipelineRuns: { byNamespace: {} }
    });
    const fetchNamespaces = jest.fn();
    const selectNamespace = jest.fn();
    const { queryByText } = render(
      <Provider store={store}>
        <App
          extensions={[]}
          fetchExtensions={() => {}}
          fetchNamespaces={fetchNamespaces}
          selectNamespace={selectNamespace}
        />
      </Provider>
    );

    await waitFor(() => queryByText('Tekton resources'));
    expect(selectNamespace).not.toHaveBeenCalled();
    expect(fetchNamespaces).toHaveBeenCalled();
  });

  it('calls fetchExtensions for tenant namespace in single namespace mode', async () => {
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({
      extensions: { byName: {} },
      namespaces: { byName: {} },
      notifications: {},
      pipelines: { byNamespace: {} },
      pipelineRuns: { byNamespace: {} }
    });
    jest.spyOn(API, 'useTenantNamespace').mockImplementation(() => 'fake');
    const fetchExtensions = jest.fn();
    const selectNamespace = jest.fn();
    const { queryByText } = render(
      <Provider store={store}>
        <App
          extensions={[]}
          fetchExtensions={fetchExtensions}
          selectNamespace={selectNamespace}
        />
      </Provider>
    );

    await waitFor(() => queryByText('Tekton resources'));
    expect(selectNamespace).toHaveBeenCalledWith('fake');
    expect(fetchExtensions).toHaveBeenCalledWith({ namespace: 'fake' });
  });

  it('calls fetchExtensions with ALL_NAMESPACES in full cluster mode', async () => {
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({
      extensions: { byName: {} },
      namespaces: { byName: {} },
      notifications: {},
      pipelines: { byNamespace: {} },
      pipelineRuns: { byNamespace: {} }
    });
    const fetchExtensions = jest.fn();
    const fetchNamespaces = jest.fn();
    const { queryByText } = render(
      <Provider store={store}>
        <App
          extensions={[]}
          fetchExtensions={fetchExtensions}
          fetchNamespaces={fetchNamespaces}
        />
      </Provider>
    );

    await waitFor(() => queryByText('Tekton resources'));
    expect(fetchExtensions).toHaveBeenCalledWith({ namespace: ALL_NAMESPACES });
    expect(fetchNamespaces).toHaveBeenCalled();
  });
});
