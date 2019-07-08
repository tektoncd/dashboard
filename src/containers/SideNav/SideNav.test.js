/*
Copyright 2019 The Tekton Authors
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
import { fireEvent } from 'react-testing-library';

import { renderWithRouter } from '../../utils/test';
import { ALL_NAMESPACES } from '../../constants';
import SideNavContainer, { SideNav } from './SideNav';

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
        }
      }
    },
    namespaces: { byName: {} }
  });
  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <SideNavContainer />
    </Provider>
  );
  expect(queryByText(/pipelines/i)).toBeTruthy();
  expect(queryByText(/tasks/i)).toBeTruthy();
  expect(queryByText(/tekton_dashboard_extension/i)).toBeTruthy();
});

it('SideNav selects namespace based on URL', () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    namespaces: { byName: {} }
  });
  const namespace = 'default';
  const selectNamespace = jest.fn();
  const { container } = renderWithRouter(
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
    { container }
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
    { container }
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
    }
  });
  const selectNamespace = jest.fn();
  const { getByText } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByText(namespace));
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
    }
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        match={{ params: { namespace } }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  fireEvent.click(getByText(namespace));
  fireEvent.click(getByText(/all namespaces/i));
  expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
  expect(push).toHaveBeenCalledWith('/');
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
    }
  });
  const selectNamespace = jest.fn();
  const push = jest.fn();
  const { getByText } = renderWithRouter(
    <Provider store={store}>
      <SideNav
        extensions={[]}
        history={{ push }}
        match={{
          params: { namespace },
          path: '/namespaces/:namespace/pipelines'
        }}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    </Provider>
  );
  selectNamespace.mockClear();
  fireEvent.click(getByText(namespace));
  fireEvent.click(getByText(otherNamespace));
  expect(selectNamespace).not.toHaveBeenCalled();
  expect(push).toHaveBeenCalledWith(expect.stringContaining(otherNamespace));
});
