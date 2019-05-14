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
import { fireEvent, render } from 'react-testing-library';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import NamespacesDropdown from './NamespacesDropdown';

const props = {
  id: 'namespaces-dropdown',
  label: 'Namespace'
};

const byName = {
  default: '',
  'kube-public': '',
  'kube-system': '',
  'tekton-pipelines': ''
};

const middleware = [thunk];
const mockStore = configureStore(middleware);

it('NamespacesDropdown renders items based on Redux state', () => {
  const store = mockStore({
    namespaces: {
      byName,
      isFetching: false
    }
  });
  const { getByText, queryByText } = render(
    <Provider store={store}>
      <NamespacesDropdown {...props} />
    </Provider>
  );
  fireEvent.click(getByText(/namespace/i));
  Object.keys(byName).forEach(item => {
    const re = new RegExp(item, 'i');
    expect(queryByText(re)).toBeTruthy();
  });
});

it('NamespacesDropdown renders the selected namespace', () => {
  const store = mockStore({
    namespaces: {
      byName,
      isFetching: false
    }
  });
  const { getByText, queryByText } = render(
    <Provider store={store}>
      <NamespacesDropdown {...props} />
    </Provider>
  );
  fireEvent.click(getByText(/namespace/i));
  fireEvent.click(getByText(/default/i));
  Object.keys(byName).forEach(item => {
    if (item !== 'default') {
      const re = new RegExp(item, 'i');
      expect(queryByText(re)).toBeFalsy();
    }
  });
  expect(queryByText(/default/i)).toBeTruthy();
  expect(queryByText(/namespace/i)).toBeFalsy();
});

it('NamespacesDropdown renders loading skeleton based on Redux state', () => {
  const store = mockStore({
    namespaces: {
      byName,
      isFetching: true
    }
  });

  const { queryByText } = render(
    <Provider store={store}>
      <NamespacesDropdown {...props} />
    </Provider>
  );
  expect(queryByText(/namespace/i)).toBeFalsy();
});

it('NamespacesDropdown handles onChange event', () => {
  const store = mockStore({
    namespaces: {
      byName,
      isFetching: false
    }
  });
  const onChange = jest.fn();
  const { getByText } = render(
    <Provider store={store}>
      <NamespacesDropdown {...props} onChange={onChange} />
    </Provider>
  );
  fireEvent.click(getByText(/namespace/i));
  fireEvent.click(getByText(/default/i));
  expect(onChange).toHaveBeenCalledTimes(1);
});
