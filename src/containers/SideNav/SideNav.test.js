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
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { waitForElement } from '@testing-library/react';
import { renderWithRouter } from '@tektoncd/dashboard-components/src/utils/test';

import SideNavContainer, { SideNavWithIntl as SideNav } from './SideNav';

it('SideNav renders with extensions', () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const store = mockStore({
    extensions: {
      byName: {
        'dashboard-extension': {
          displayName: 'tekton_dashboard_extension',
          name: 'dashboard-extension',
          url: 'sample'
        },
        'crd-extension': {
          apiGroup: 'mygroup',
          apiVersion: 'v1alpha1',
          displayName: 'dashboard_crd_extension',
          extensionType: 'kubernetes-resource',
          name: 'crd-extension'
        },
        'cluster-crd-extension': {
          apiGroup: 'mygroup',
          apiVersion: 'v1alpha1',
          displayName: 'dashboard_cluster_crd_extension',
          extensionType: 'kubernetes-resource',
          name: 'cluster-crd-extension',
          namespaced: false
        }
      }
    },
    namespaces: { byName: { [namespace]: true }, selected: namespace },
    properties: {}
  });
  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <SideNavContainer location={{ search: '' }} />
    </Provider>
  );
  expect(queryByText('Pipelines')).toBeTruthy();
  expect(queryByText('Tasks')).toBeTruthy();
  expect(queryByText(/tekton_dashboard_extension/i)).toBeTruthy();
  expect(queryByText(/dashboard_crd_extension/i)).toBeTruthy();
});

it('SideNav renders with triggers', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    extensions: { byName: {} },
    namespaces: { byName: {} },
    properties: {
      TriggersNamespace: 'fake-triggers',
      TriggersVersion: 'fake-triggers'
    }
  });
  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <SideNavContainer location={{ search: '' }} />
    </Provider>
  );
  await waitForElement(() => queryByText(/about/i));
  expect(queryByText('Pipelines')).toBeTruthy();
  expect(queryByText('Tasks')).toBeTruthy();
  await waitForElement(() => queryByText('EventListeners'));
  expect(queryByText('TriggerTemplates')).toBeTruthy();
  expect(queryByText('TriggerBindings')).toBeTruthy();
});

it('SideNav selects namespace based on URL', () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    namespaces: { byName: {} },
    properties: {}
  });
  const namespace = 'default';
  const selectNamespace = jest.fn();
  const { rerender } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        location={{ search: '' }}
        match={{ params: { namespace } }}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  expect(selectNamespace).toHaveBeenCalledWith(namespace);

  const updatedNamespace = 'another';

  renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        location={{ search: '' }}
        match={{ params: { namespace: updatedNamespace } }}
        selectNamespace={selectNamespace}
      />
    </Provider>,
    { rerender }
  );
  expect(selectNamespace).toHaveBeenCalledWith(updatedNamespace);

  renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        location={{ search: '' }}
        match={{ params: { namespace: updatedNamespace } }}
        selectNamespace={selectNamespace}
      />
    </Provider>,
    { rerender }
  );
  expect(selectNamespace).toHaveBeenCalledTimes(2);
});

it('SideNav renders import in not read-only mode', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    extensions: { byName: {} },
    namespaces: { byName: {} },
    properties: {}
  });
  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <SideNavContainer location={{ search: '' }} />
    </Provider>
  );
  await waitForElement(() => queryByText(/Import/i));
});

it('SideNav does not render import in read-only mode', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    extensions: { byName: {} },
    namespaces: { byName: {} },
    properties: {
      ReadOnly: true
    }
  });
  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <SideNavContainer isReadOnly location={{ search: '' }} />
    </Provider>
  );
  await waitForElement(() => queryByText(/about/i));
  expect(queryByText(/import/i)).toBeFalsy();
});
