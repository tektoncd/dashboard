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
import { fireEvent, waitForElement } from 'react-testing-library';
import { ALL_NAMESPACES, paths, urls } from '@tektoncd/dashboard-utils';
import { renderWithRouter } from '@tektoncd/dashboard-components/src/utils/test';

import SideNavContainer, { SideNavWithIntl as SideNav } from './SideNav';

it('SideNav renders with extensions', () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
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
          name: 'crd-extension',
          url: 'crd-sample'
        }
      }
    },
    namespaces: { byName: {} },
    properties: {}
  });
  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <SideNavContainer />
    </Provider>
  );
  expect(queryByText(/pipelines/i)).toBeTruthy();
  expect(queryByText(/tasks/i)).toBeTruthy();
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
      <SideNavContainer />
    </Provider>
  );
  await waitForElement(() => queryByText(/about/i));
  expect(queryByText(/pipelines/i)).toBeTruthy();
  expect(queryByText(/tasks/i)).toBeTruthy();
  await waitForElement(() => queryByText(/eventlisteners/i));
  expect(queryByText(/triggertemplates/i)).toBeTruthy();
  expect(queryByText(/triggerbindings/i)).toBeTruthy();
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
        match={{ params: { namespace: updatedNamespace } }}
        selectNamespace={selectNamespace}
      />
    </Provider>,
    { rerender }
  );
  expect(selectNamespace).toHaveBeenCalledTimes(2);
});

it('SideNav selects namespace when no namespace in URL', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const otherNamespace = 'foo';
  const store = mockStore({
    namespaces: {
      byName: {
        [namespace]: true,
        [otherNamespace]: true
      },
      isFetching: false,
      selected: namespace
    },
    properties: {}
  });
  const selectNamespace = jest.fn();
  const { getByText, getByValue } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByValue(namespace));
  fireEvent.click(getByText(otherNamespace));
  expect(selectNamespace).toHaveBeenCalledWith(otherNamespace);
});

it('SideNav redirects to root when all namespaces selected on namespaced URL', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const store = mockStore({
    namespaces: {
      byName: {
        [namespace]: true
      },
      isFetching: false,
      selected: namespace
    },
    properties: {}
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText, getByValue } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        location={{ search: '' }}
        match={{ params: { namespace }, url: '/someResource' }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByValue(namespace));
  fireEvent.click(getByText(/all namespaces/i));
  expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
  expect(push).toHaveBeenCalledWith('/');
});

it('SideNav redirects to PipelineRuns page when all namespaces selected on namespaced URL on PipelineRuns', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const store = mockStore({
    namespaces: {
      byName: {
        [namespace]: true
      },
      isFetching: false,
      selected: namespace
    },
    properties: {}
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText, getByValue } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        location={{ search: '' }}
        match={{ params: { namespace }, url: urls.pipelineRuns.all() }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByValue(namespace));
  fireEvent.click(getByText(/all namespaces/i));
  expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
  expect(push).toHaveBeenCalledWith(urls.pipelineRuns.all());
});

it('SideNav redirects to TaskRuns page when all namespaces selected on namespaced URL on TaskRuns', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const store = mockStore({
    namespaces: {
      byName: {
        [namespace]: true
      },
      isFetching: false,
      selected: namespace
    },
    properties: {}
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText, getByValue } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        location={{ search: '' }}
        match={{ params: { namespace }, url: urls.taskRuns.all() }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByValue(namespace));
  fireEvent.click(getByText(/all namespaces/i));
  expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
  expect(push).toHaveBeenCalledWith(urls.taskRuns.all());
});

it('SideNav redirects to PipelineResources page when all namespaces selected on namespaced URL on PipelineResources', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const store = mockStore({
    namespaces: {
      byName: {
        [namespace]: true
      },
      isFetching: false,
      selected: namespace
    },
    properties: {}
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText, getByValue } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        location={{ search: '' }}
        match={{
          params: { namespace },
          url: urls.pipelineResources.all()
        }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByValue(namespace));
  fireEvent.click(getByText(/all namespaces/i));
  expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
  expect(push).toHaveBeenCalledWith(urls.pipelineResources.all());
});

it('SideNav redirects to Pipelines page when all namespaces selected on namespaced URL on Pipelines', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const store = mockStore({
    namespaces: {
      byName: {
        [namespace]: true
      },
      isFetching: false,
      selected: namespace
    },
    properties: {}
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText, getByValue } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        location={{ search: '' }}
        match={{
          params: { namespace },
          url: urls.pipelines.all()
        }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByValue(namespace));
  fireEvent.click(getByText(/all namespaces/i));
  expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
  expect(push).toHaveBeenCalledWith(urls.pipelines.all());
});

it('SideNav redirects to ServiceAccounts page when all namespaces selected on namespaced URL on ServiceAccounts', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const store = mockStore({
    namespaces: {
      byName: {
        [namespace]: true
      },
      isFetching: false,
      selected: namespace
    },
    properties: {}
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText, getByValue } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        location={{ search: '' }}
        match={{
          params: { namespace },
          url: urls.serviceAccounts.all()
        }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByValue(namespace));
  fireEvent.click(getByText(/all namespaces/i));
  expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
  expect(push).toHaveBeenCalledWith(urls.serviceAccounts.all());
});

it('SideNav redirects to EventListeners page when all namespaces selected on namespaced URL on EventListeners', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const store = mockStore({
    namespaces: {
      byName: {
        [namespace]: true
      },
      isFetching: false,
      selected: namespace
    },
    properties: {}
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText, getByValue } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        location={{ search: '' }}
        match={{
          params: { namespace },
          url: urls.eventListeners.all()
        }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByValue(namespace));
  fireEvent.click(getByText(/all namespaces/i));
  expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
  expect(push).toHaveBeenCalledWith(urls.eventListeners.all());
});

it('SideNav redirects to TriggerBindings page when all namespaces selected on namespaced URL on TriggerBindings', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const store = mockStore({
    namespaces: {
      byName: {
        [namespace]: true
      },
      isFetching: false,
      selected: namespace
    },
    properties: {}
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText, getByValue } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        location={{ search: '' }}
        match={{
          params: { namespace },
          url: urls.triggerBindings.all()
        }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByValue(namespace));
  fireEvent.click(getByText(/all namespaces/i));
  expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
  expect(push).toHaveBeenCalledWith(urls.triggerBindings.all());
});

it('SideNav redirects to TriggerTemplates page when all namespaces selected on namespaced URL on TriggerTemplates', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const store = mockStore({
    namespaces: {
      byName: {
        [namespace]: true
      },
      isFetching: false,
      selected: namespace
    },
    properties: {}
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText, getByValue } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        location={{ search: '' }}
        match={{
          params: { namespace },
          url: urls.triggerTemplates.all()
        }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByValue(namespace));
  fireEvent.click(getByText(/all namespaces/i));
  expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
  expect(push).toHaveBeenCalledWith(urls.triggerTemplates.all());
});

it('SideNav redirects to Tasks page when all namespaces selected on namespaced URL on Tasks', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const store = mockStore({
    namespaces: {
      byName: {
        [namespace]: true
      },
      isFetching: false,
      selected: namespace
    },
    properties: {}
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText, getByValue } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        location={{ search: '' }}
        match={{
          params: { namespace },
          url: urls.tasks.all()
        }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByValue(namespace));
  fireEvent.click(getByText(/all namespaces/i));
  expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
  expect(push).toHaveBeenCalledWith(urls.tasks.all());
});

it('SideNav redirects to secrets page when all namespaces selected on namespaced URL on secrets', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const store = mockStore({
    namespaces: {
      byName: {
        [namespace]: true
      },
      isFetching: false,
      selected: namespace
    },
    properties: {}
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText, getByValue } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        location={{ search: '' }}
        match={{
          params: { namespace },
          url: urls.secrets.all()
        }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByValue(namespace));
  fireEvent.click(getByText(/all namespaces/i));
  expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
  expect(push).toHaveBeenCalledWith(urls.secrets.all());
});

it('SideNav redirects to Conditions page when all namespaces selected on namespaced URL on Conditions', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const store = mockStore({
    namespaces: {
      byName: {
        [namespace]: true
      },
      isFetching: false,
      selected: namespace
    },
    properties: {}
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText, getByValue } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        location={{ search: '' }}
        match={{
          params: { namespace },
          url: urls.conditions.all()
        }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByValue(namespace));
  fireEvent.click(getByText(/all namespaces/i));
  expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
  expect(push).toHaveBeenCalledWith(urls.conditions.all());
});

it('SideNav updates namespace in URL', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const namespace = 'default';
  const otherNamespace = 'foo';
  const store = mockStore({
    namespaces: {
      byName: {
        [namespace]: true,
        [otherNamespace]: true
      },
      isFetching: false,
      selected: namespace
    },
    properties: {}
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText, getByValue } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        location={{ search: '' }}
        match={{
          params: { namespace },
          path: paths.pipelines.byNamespace()
        }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  selectNamespace.mockClear();
  fireEvent.click(getByValue(namespace));
  fireEvent.click(getByText(otherNamespace));
  expect(selectNamespace).not.toHaveBeenCalled();
  expect(push).toHaveBeenCalledWith(expect.stringContaining(otherNamespace));
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
      <SideNavContainer />
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
      <SideNavContainer isReadOnly />
    </Provider>
  );
  await waitForElement(() => queryByText(/about/i));
  expect(queryByText(/import/i)).toBeFalsy();
});

it('Namespace dropdown does not render in single namespace visibility mode', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    extensions: { byName: {} },
    namespaces: { byName: {} },
    properties: {
      TenantNamespace: 'fake'
    }
  });
  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <SideNavContainer isReadOnly />
    </Provider>
  );
  await waitForElement(() => queryByText(/about/i));
  expect(queryByText(/namespaces/i)).toBeFalsy();
});

it('Namespace dropdown renders in full cluster visibility mode', async () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    extensions: { byName: {} },
    namespaces: { byName: {} },
    properties: {}
  });
  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <SideNavContainer isReadOnly />
    </Provider>
  );
  await waitForElement(() => queryByText(/about/i));
  expect(queryByText(/namespace/i)).toBeTruthy();
});
