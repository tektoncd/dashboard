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
import { fireEvent, getNodeText, render } from 'react-testing-library';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ServiceAccountsDropdown from './ServiceAccountsDropdown';
import * as API from '../../api';

const props = {
  id: 'service-accounts-dropdown'
};

const serviceAccountsByNamespace = {
  blue: {
    'service-account-1': 'id-service-account-1',
    'service-account-2': 'id-service-account-2'
  },
  green: {
    'service-account-3': 'id-service-account-3'
  }
};

const serviceAccountsById = {
  'id-service-account-1': {
    metadata: {
      name: 'service-account-1',
      namespace: 'blue',
      uid: 'id-service-account-1'
    }
  },
  'id-service-account-2': {
    metadata: {
      name: 'service-account-2',
      namespace: 'blue',
      uid: 'id-service-account-2'
    }
  },
  'id-service-account-3': {
    metadata: {
      name: 'service-account-3',
      namespace: 'green',
      uid: 'id-service-account-3'
    }
  }
};

const serviceAccountsStoreDefault = {
  serviceAccounts: {
    byId: serviceAccountsById,
    byNamespace: serviceAccountsByNamespace,
    isFetching: false
  }
};

const serviceAccountsStoreFetching = {
  serviceAccounts: {
    byId: serviceAccountsById,
    byNamespace: serviceAccountsByNamespace,
    isFetching: true
  }
};

const namespacesByName = {
  blue: '',
  green: ''
};

const namespacesStoreBlue = {
  namespaces: {
    byName: namespacesByName,
    selected: 'blue'
  }
};

const namespacesStoreGreen = {
  namespaces: {
    byName: namespacesByName,
    selected: 'green'
  }
};

const initialTextRegExp = new RegExp('select service account', 'i');

const checkDropdownItems = ({
  queryByText,
  getAllByText,
  testDict,
  itemPrefixRegExp = new RegExp('service-account-', 'i')
}) => {
  Object.keys(testDict).forEach(item => {
    expect(queryByText(new RegExp(item, 'i'))).toBeTruthy();
  });
  getAllByText(itemPrefixRegExp).forEach(node => {
    expect(getNodeText(node) in testDict).toBeTruthy();
  });
};

const middleware = [thunk];
const mockStore = configureStore(middleware);

beforeEach(() => {
  jest
    .spyOn(API, 'getServiceAccounts')
    .mockImplementation(() => serviceAccountsById);
});

it('ServiceAccountsDropdown renders items based on Redux state', () => {
  const store = mockStore({
    ...serviceAccountsStoreDefault,
    ...namespacesStoreBlue
  });
  const { getByText, getAllByText, queryByText } = render(
    <Provider store={store}>
      <ServiceAccountsDropdown {...props} />
    </Provider>
  );
  // View items
  fireEvent.click(getByText(initialTextRegExp));
  checkDropdownItems({
    getAllByText,
    queryByText,
    testDict: serviceAccountsByNamespace.blue
  });
});

it('ServiceAccountsDropdown renders items based on Redux state when namespace changes', () => {
  const blueStore = mockStore({
    ...serviceAccountsStoreDefault,
    ...namespacesStoreBlue
  });
  const { container, getByText, getAllByText, queryByText } = render(
    <Provider store={blueStore}>
      <ServiceAccountsDropdown {...props} />
    </Provider>
  );
  // View items
  fireEvent.click(getByText(initialTextRegExp));
  checkDropdownItems({
    getAllByText,
    queryByText,
    testDict: serviceAccountsByNamespace.blue
  });
  fireEvent.click(getByText(initialTextRegExp));

  // Change selected namespace from 'blue' to 'green'
  const greenStore = mockStore({
    ...serviceAccountsStoreDefault,
    ...namespacesStoreGreen
  });
  render(
    <Provider store={greenStore}>
      <ServiceAccountsDropdown {...props} />
    </Provider>,
    { container }
  );
  // View items
  fireEvent.click(getByText(initialTextRegExp));
  checkDropdownItems({
    getAllByText,
    queryByText,
    testDict: serviceAccountsByNamespace.green
  });
});

it('ServiceAccountsDropdown renders controlled selection', () => {
  const store = mockStore({
    ...serviceAccountsStoreDefault,
    ...namespacesStoreBlue
  });
  // Select item 'service-account-1'
  const { container, queryByText } = render(
    <Provider store={store}>
      <ServiceAccountsDropdown
        {...props}
        selectedItem={{ text: 'service-account-1' }}
      />
    </Provider>
  );
  expect(queryByText(/service-account-1/i)).toBeTruthy();
  // Select item 'service-account-2'
  render(
    <Provider store={store}>
      <ServiceAccountsDropdown
        {...props}
        selectedItem={{ text: 'service-account-2' }}
      />
    </Provider>,
    { container }
  );
  expect(queryByText(/service-account-2/i)).toBeTruthy();
  // No selected item (select item '')
  render(
    <Provider store={store}>
      <ServiceAccountsDropdown {...props} selectedItem="" />
    </Provider>,
    { container }
  );
  expect(queryByText(initialTextRegExp)).toBeTruthy();
});

it('ServiceAccountsDropdown renders controlled namespace', () => {
  const store = mockStore({
    ...serviceAccountsStoreDefault,
    ...namespacesStoreBlue
  });
  // Select namespace 'green'
  const { queryByText, getByText, getAllByText } = render(
    <Provider store={store}>
      <ServiceAccountsDropdown {...props} namespace="green" />
    </Provider>
  );
  fireEvent.click(getByText(initialTextRegExp));
  checkDropdownItems({
    getAllByText,
    queryByText,
    testDict: serviceAccountsByNamespace.green
  });
});

it('ServiceAccountsDropdown renders empty', () => {
  const store = mockStore({
    serviceAccounts: {
      byId: {},
      byNamespace: {},
      isFetching: false
    },
    ...namespacesStoreBlue
  });
  // Select item 'service-account-1'
  const { queryByText } = render(
    <Provider store={store}>
      <ServiceAccountsDropdown {...props} />
    </Provider>
  );
  expect(
    queryByText(/no service accounts found in the 'blue' namespace/i)
  ).toBeTruthy();
  expect(queryByText(initialTextRegExp)).toBeFalsy();
});

it('ServiceAccountsDropdown renders loading skeleton based on Redux state', () => {
  const store = mockStore({
    ...serviceAccountsStoreFetching,
    ...namespacesStoreBlue
  });
  const { queryByText } = render(
    <Provider store={store}>
      <ServiceAccountsDropdown {...props} />
    </Provider>
  );
  expect(queryByText(initialTextRegExp)).toBeFalsy();
});

it('ServiceAccountsDropdown handles onChange event', () => {
  const store = mockStore({
    ...serviceAccountsStoreDefault,
    ...namespacesStoreBlue
  });
  const onChange = jest.fn();
  const { getByText } = render(
    <Provider store={store}>
      <ServiceAccountsDropdown {...props} onChange={onChange} />
    </Provider>
  );
  fireEvent.click(getByText(initialTextRegExp));
  fireEvent.click(getByText(/service-account-1/i));
  expect(onChange).toHaveBeenCalledTimes(1);
});
