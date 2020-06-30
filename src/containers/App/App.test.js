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
import { Provider } from 'react-redux';
import { render, waitForElement } from 'react-testing-library';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { App } from './App';
import * as API from '../../api';
import * as selectors from '../../reducers';

beforeEach(() => {
  jest.spyOn(API, 'getPipelines').mockImplementation(() => {});
  jest.spyOn(selectors, 'isReadOnly').mockImplementation(() => true);
  jest.spyOn(selectors, 'isTriggersInstalled').mockImplementation(() => false);
  jest
    .spyOn(selectors, 'getTenantNamespace')
    .mockImplementation(() => undefined);
});

it('App renders successfully in full cluster mode', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    secrets: { byNamespace: {} },
    extensions: { byName: {} },
    namespaces: { byName: {} },
    notifications: {},
    pipelines: { byNamespace: {} },
    pipelineRuns: { byNamespace: {} },
    serviceAccounts: { byNamespace: {} }
  });
  const { queryByText } = render(
    <Provider store={store}>
      <App
        extensions={[]}
        fetchExtensions={() => {}}
        fetchNamespaces={() => {}}
        fetchInstallProperties={() => {}}
      />
    </Provider>
  );

  await waitForElement(() => queryByText('Tekton resources'));

  expect(queryByText(/namespace/i)).toBeTruthy();
  expect(queryByText(/pipelines/i)).toBeTruthy();
  expect(queryByText(/tasks/i)).toBeTruthy();
});

it('App renders successfully in single namespace mode', async () => {
  selectors.getTenantNamespace.mockImplementation(() => 'fake');

  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    secrets: { byNamespace: {} },
    extensions: { byName: {} },
    namespaces: { byName: {} },
    notifications: {},
    pipelines: { byNamespace: {} },
    pipelineRuns: { byNamespace: {} },
    serviceAccounts: { byNamespace: {} }
  });
  const { queryByText } = render(
    <Provider store={store}>
      <App
        extensions={[]}
        fetchExtensions={() => {}}
        fetchNamespaces={() => {}}
        fetchInstallProperties={() => {}}
      />
    </Provider>
  );

  await waitForElement(() => queryByText('Tekton resources'));

  expect(queryByText(/namespaces/i)).toBeFalsy();
  expect(queryByText(/pipelines/i)).toBeTruthy();
  expect(queryByText(/tasks/i)).toBeTruthy();
});

it('App selects namespace based on tenant namespace', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    secrets: { byNamespace: {} },
    extensions: { byName: {} },
    namespaces: { byName: {} },
    notifications: {},
    pipelines: { byNamespace: {} },
    pipelineRuns: { byNamespace: {} },
    serviceAccounts: { byNamespace: {} }
  });
  const selectNamespace = jest.fn();
  const { queryByText } = render(
    <Provider store={store}>
      <App
        extensions={[]}
        fetchExtensions={() => {}}
        fetchNamespaces={() => {}}
        fetchInstallProperties={() => {}}
        tenantNamespace="fake"
        selectNamespace={selectNamespace}
      />
    </Provider>
  );

  await waitForElement(() => queryByText('Tekton resources'));
  expect(selectNamespace).toHaveBeenCalledWith('fake');
});

it('App does not call fetchNamespaces in single namespace mode', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    secrets: { byNamespace: {} },
    extensions: { byName: {} },
    namespaces: { byName: {} },
    notifications: {},
    pipelines: { byNamespace: {} },
    pipelineRuns: { byNamespace: {} },
    serviceAccounts: { byNamespace: {} }
  });
  const fetchNamespaces = jest.fn();
  const selectNamespace = jest.fn();
  const { queryByText } = render(
    <Provider store={store}>
      <App
        extensions={[]}
        fetchExtensions={() => {}}
        fetchNamespaces={fetchNamespaces}
        fetchInstallProperties={() =>
          Promise.resolve({
            TenantNamespace: 'fake'
          })
        }
        tenantNamespace="fake"
        selectNamespace={selectNamespace}
      />
    </Provider>
  );

  await waitForElement(() => queryByText('Tekton resources'));
  expect(selectNamespace).toHaveBeenCalledWith('fake');
  expect(fetchNamespaces).not.toHaveBeenCalled();
});

it('App calls fetchNamespaces in full cluster mode', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    secrets: { byNamespace: {} },
    extensions: { byName: {} },
    namespaces: { byName: {} },
    notifications: {},
    pipelines: { byNamespace: {} },
    pipelineRuns: { byNamespace: {} },
    serviceAccounts: { byNamespace: {} }
  });
  const fetchNamespaces = jest.fn();
  const selectNamespace = jest.fn();
  const { queryByText } = render(
    <Provider store={store}>
      <App
        extensions={[]}
        fetchExtensions={() => {}}
        fetchNamespaces={fetchNamespaces}
        fetchInstallProperties={() => Promise.resolve({})}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );

  await waitForElement(() => queryByText('Tekton resources'));
  expect(selectNamespace).not.toHaveBeenCalled();
  expect(fetchNamespaces).toHaveBeenCalled();
});

it('App calls fetchExtensions for tenant namespace in single namespace mode', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    secrets: { byNamespace: {} },
    extensions: { byName: {} },
    namespaces: { byName: {} },
    notifications: {},
    pipelines: { byNamespace: {} },
    pipelineRuns: { byNamespace: {} },
    serviceAccounts: { byNamespace: {} }
  });
  const fetchExtensions = jest.fn();
  const selectNamespace = jest.fn();
  const { queryByText } = render(
    <Provider store={store}>
      <App
        extensions={[]}
        fetchExtensions={fetchExtensions}
        fetchInstallProperties={() =>
          Promise.resolve({
            TenantNamespace: 'fake'
          })
        }
        tenantNamespace="fake"
        selectNamespace={selectNamespace}
      />
    </Provider>
  );

  await waitForElement(() => queryByText('Tekton resources'));
  expect(selectNamespace).toHaveBeenCalledWith('fake');
  expect(fetchExtensions).toHaveBeenCalledWith({ namespace: 'fake' });
});

it('App calls fetchExtensions without namespace in full cluster mode', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    secrets: { byNamespace: {} },
    extensions: { byName: {} },
    namespaces: { byName: {} },
    notifications: {},
    pipelines: { byNamespace: {} },
    pipelineRuns: { byNamespace: {} },
    serviceAccounts: { byNamespace: {} }
  });
  const fetchExtensions = jest.fn();
  const fetchNamespaces = jest.fn();
  const { queryByText } = render(
    <Provider store={store}>
      <App
        extensions={[]}
        fetchExtensions={fetchExtensions}
        fetchNamespaces={fetchNamespaces}
        fetchInstallProperties={() => Promise.resolve({})}
      />
    </Provider>
  );

  await waitForElement(() => queryByText('Tekton resources'));
  expect(fetchExtensions).toHaveBeenCalledWith({});
  expect(fetchNamespaces).toHaveBeenCalled();
});
