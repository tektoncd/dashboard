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
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fireEvent } from '@testing-library/react';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { renderWithRouter } from '@tektoncd/dashboard-components/src/utils/test';

import { ListPageLayout } from './ListPageLayout';

describe('ListPageLayout', () => {
  it('add namespace to URL when selected', async () => {
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const otherNamespace = 'foo';
    const store = mockStore({
      namespaces: {
        byName: {
          [otherNamespace]: true
        },
        isFetching: false,
        selected: ALL_NAMESPACES
      },
      properties: {}
    });
    const history = {
      push: jest.fn()
    };
    const path = '/fake/path';
    const match = { path };
    const selectNamespace = jest.fn();
    const { getByText, getByDisplayValue } = renderWithRouter(
      <Provider store={store}>
        <ListPageLayout
          history={history}
          location={{ search: '' }}
          match={match}
          namespace={ALL_NAMESPACES}
          selectNamespace={selectNamespace}
        />
      </Provider>
    );
    fireEvent.click(getByDisplayValue(/All Namespaces/i));
    fireEvent.click(getByText(otherNamespace));
    expect(selectNamespace).not.toHaveBeenCalled();
    expect(history.push).toHaveBeenCalledWith(
      `/namespaces/${otherNamespace}${path}`
    );
  });

  it('updates namespace in URL', async () => {
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
    const history = {
      push: jest.fn()
    };
    const path = '/namespaces/:namespace/fake/path';
    const match = { path, params: { namespace } };
    const selectNamespace = jest.fn();
    const { getByText, getByDisplayValue } = renderWithRouter(
      <Provider store={store}>
        <ListPageLayout
          history={history}
          location={{ search: '' }}
          match={match}
          namespace={namespace}
          selectNamespace={selectNamespace}
        />
      </Provider>
    );
    fireEvent.click(getByDisplayValue(namespace));
    fireEvent.click(getByText(otherNamespace));
    expect(selectNamespace).not.toHaveBeenCalled();
    expect(history.push).toHaveBeenCalledWith(
      `/namespaces/${otherNamespace}/fake/path`
    );
  });

  it('removes namespace from URL when ALL_NAMESPACES is selected', async () => {
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
    const history = {
      push: jest.fn()
    };
    const path = '/namespaces/:namespace/fake/path';
    const match = { path, params: { namespace } };
    const selectNamespace = jest.fn();
    const { getByText, getByDisplayValue } = renderWithRouter(
      <Provider store={store}>
        <ListPageLayout
          history={history}
          location={{ search: '' }}
          match={match}
          namespace={namespace}
          selectNamespace={selectNamespace}
        />
      </Provider>
    );
    fireEvent.click(getByDisplayValue(namespace));
    fireEvent.click(getByText(/All Namespaces/i));
    expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
    expect(history.push).toHaveBeenCalledWith(`/fake/path`);
  });

  it('removes namespace from URL when clearing selection', async () => {
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
    const history = {
      push: jest.fn()
    };
    const path = '/namespaces/:namespace/fake/path';
    const match = { path, params: { namespace } };
    const selectNamespace = jest.fn();
    const { getByTitle } = renderWithRouter(
      <Provider store={store}>
        <ListPageLayout
          history={history}
          location={{ search: '' }}
          match={match}
          namespace={namespace}
          selectNamespace={selectNamespace}
        />
      </Provider>
    );
    fireEvent.click(getByTitle(/clear selected item/i));
    expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
    expect(history.push).toHaveBeenCalledWith(`/fake/path`);
  });

  it('does not render namespaces dropdown in single namespace visibility mode', () => {
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({
      extensions: { byName: {} },
      namespaces: { byName: {} },
      properties: {
        TenantNamespace: 'fake'
      }
    });
    const { queryByPlaceholderText } = renderWithRouter(
      <Provider store={store}>
        <ListPageLayout tenantNamespace="fake" />
      </Provider>
    );
    expect(queryByPlaceholderText(/select namespace/i)).toBeFalsy();
  });

  it('does not render namespaces dropdown when hideNamespacesDropdown is true', () => {
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({
      extensions: { byName: {} },
      namespaces: { byName: {} },
      properties: {}
    });
    const { queryByPlaceholderText } = renderWithRouter(
      <Provider store={store}>
        <ListPageLayout hideNamespacesDropdown />
      </Provider>
    );
    expect(queryByPlaceholderText(/select namespace/i)).toBeFalsy();
  });

  it('does not render LabelFilter input by default', () => {
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({
      extensions: { byName: {} },
      namespaces: { byName: {} },
      properties: {}
    });
    const { queryByLabelText } = renderWithRouter(
      <Provider store={store}>
        <ListPageLayout />
      </Provider>
    );
    expect(queryByLabelText(/Input a label filter/i)).toBeFalsy();
  });

  it('renders LabelFilter input when filters prop is provided', () => {
    const middleware = [thunk];
    const mockStore = configureStore(middleware);
    const store = mockStore({
      extensions: { byName: {} },
      namespaces: { byName: {} },
      properties: {}
    });
    const { getAllByLabelText } = renderWithRouter(
      <Provider store={store}>
        <ListPageLayout filters={[]} />
      </Provider>
    );
    expect(getAllByLabelText(/Input a label filter/i)[0]).toBeTruthy();
  });
});
