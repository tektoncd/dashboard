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
import { fireEvent, getNodeText } from 'react-testing-library';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import NamespacesDropdown from './NamespacesDropdown';
import { renderWithIntl } from '../../utils/test';
import * as selectors from '../../reducers';

beforeEach(() => {
  jest
    .spyOn(selectors, 'getTenantNamespace')
    .mockImplementation(() => undefined);
});

const props = {
  id: 'namespaces-dropdown'
};

const byName = {
  'namespace-1': '',
  'namespace-2': '',
  'namespace-3': ''
};

const middleware = [thunk];
const mockStore = configureStore(middleware);

const initialTextRegExp = new RegExp('select namespace', 'i');

it('NamespacesDropdown renders items based on Redux state', () => {
  const store = mockStore({
    namespaces: {
      byName,
      isFetching: false
    }
  });
  const { getAllByText, getByPlaceholderText, queryByText } = renderWithIntl(
    <Provider store={store}>
      <NamespacesDropdown {...props} />
    </Provider>
  );
  fireEvent.click(getByPlaceholderText(initialTextRegExp));
  Object.keys(byName).forEach(item => {
    expect(queryByText(new RegExp(item, 'i'))).toBeTruthy();
  });
  getAllByText(/namespace-/i).forEach(node => {
    expect(getNodeText(node) in byName).toBeTruthy();
  });
});

it('NamespacesDropdown renders controlled selection', () => {
  const store = mockStore({
    namespaces: {
      byName,
      isFetching: false
    }
  });
  // Select item 'namespace-1'
  const { container, queryByPlaceholderText, queryByValue } = renderWithIntl(
    <Provider store={store}>
      <NamespacesDropdown {...props} selectedItem={{ text: 'namespace-1' }} />
    </Provider>
  );
  expect(queryByValue(/namespace-1/i)).toBeTruthy();
  // Select item 'namespace-2'
  renderWithIntl(
    <Provider store={store}>
      <NamespacesDropdown {...props} selectedItem={{ text: 'namespace-2' }} />
    </Provider>,
    { container }
  );
  expect(queryByValue(/namespace-2/i)).toBeTruthy();
  // No selected item (select item '')
  renderWithIntl(
    <Provider store={store}>
      <NamespacesDropdown {...props} selectedItem="" />
    </Provider>,
    { container }
  );
  expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
});

it('NamespacesDropdown renders empty', () => {
  const store = mockStore({
    namespaces: {
      byName: {},
      isFetching: false
    }
  });

  const { queryByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <NamespacesDropdown {...props} />
    </Provider>
  );
  expect(queryByPlaceholderText(/no namespaces found/i)).toBeTruthy();
});

it('NamespacesDropdown renders loading skeleton based on Redux state', () => {
  const store = mockStore({
    namespaces: {
      byName,
      isFetching: true
    }
  });

  const { queryByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <NamespacesDropdown {...props} />
    </Provider>
  );
  expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
});

it('NamespacesDropdown handles onChange event', () => {
  const store = mockStore({
    namespaces: {
      byName,
      isFetching: false
    }
  });
  const onChange = jest.fn();
  const { getByPlaceholderText, getByText } = renderWithIntl(
    <Provider store={store}>
      <NamespacesDropdown {...props} onChange={onChange} />
    </Provider>
  );
  fireEvent.click(getByPlaceholderText(initialTextRegExp));
  fireEvent.click(getByText(/namespace-1/i));
  expect(onChange).toHaveBeenCalledTimes(1);
});
