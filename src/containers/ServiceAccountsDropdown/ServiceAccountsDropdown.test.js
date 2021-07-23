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
import { fireEvent, getNodeText } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render } from '../../utils/test';

import ServiceAccountsDropdown from './ServiceAccountsDropdown';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';
import * as ServiceAccountsAPI from '../../api/serviceAccounts';

const props = {
  id: 'service-accounts-dropdown',
  onChange: () => {}
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

const serviceAccount1 = {
  metadata: {
    name: 'service-account-1',
    namespace: 'blue',
    uid: 'id-service-account-1'
  }
};

const serviceAccount2 = {
  metadata: {
    name: 'service-account-2',
    namespace: 'blue',
    uid: 'id-service-account-2'
  }
};

const serviceAccount3 = {
  metadata: {
    name: 'service-account-3',
    namespace: 'green',
    uid: 'id-service-account-3'
  }
};

const initialTextRegExp = new RegExp('select serviceaccount', 'i');

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

describe('ServiceAccountsDropdown', () => {
  beforeEach(() => {
    jest
      .spyOn(API, 'useNamespaces')
      .mockImplementation(() => ({ data: ['blue', 'green'] }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'blue' }));
  });

  it('renders items', () => {
    jest
      .spyOn(ServiceAccountsAPI, 'useServiceAccounts')
      .mockImplementation(() => ({
        data: [serviceAccount1, serviceAccount2]
      }));
    const store = mockStore({
      notifications: {}
    });
    const { getByPlaceholderText, getAllByText, queryByText } = render(
      <Provider store={store}>
        <ServiceAccountsDropdown {...props} />
      </Provider>
    );
    // View items
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: serviceAccountsByNamespace.blue
    });
  });

  it('renders controlled selection', () => {
    jest
      .spyOn(ServiceAccountsAPI, 'useServiceAccounts')
      .mockImplementation(() => ({
        data: [serviceAccount1, serviceAccount2]
      }));
    const store = mockStore({
      notifications: {}
    });
    // Select item 'service-account-1'
    const { queryByPlaceholderText, queryByDisplayValue, rerender } = render(
      <Provider store={store}>
        <ServiceAccountsDropdown
          {...props}
          selectedItem={{ text: 'service-account-1' }}
        />
      </Provider>
    );
    expect(queryByDisplayValue(/service-account-1/i)).toBeTruthy();
    // Select item 'service-account-2'
    render(
      <Provider store={store}>
        <ServiceAccountsDropdown
          {...props}
          selectedItem={{ text: 'service-account-2' }}
        />
      </Provider>,
      { rerender }
    );
    expect(queryByDisplayValue(/service-account-2/i)).toBeTruthy();
    // No selected item (select item '')
    render(
      <Provider store={store}>
        <ServiceAccountsDropdown {...props} selectedItem="" />
      </Provider>,
      { rerender }
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
  });

  it('renders controlled namespace', () => {
    jest
      .spyOn(ServiceAccountsAPI, 'useServiceAccounts')
      .mockImplementation(({ namespace }) => ({
        data: namespace === 'green' ? [serviceAccount3] : []
      }));
    const store = mockStore({
      notifications: {}
    });
    // Select namespace 'green'
    const { queryByText, getByPlaceholderText, getAllByText } = render(
      <Provider store={store}>
        <ServiceAccountsDropdown {...props} namespace="green" />
      </Provider>
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: serviceAccountsByNamespace.green
    });
  });

  it('renders empty', () => {
    jest
      .spyOn(ServiceAccountsAPI, 'useServiceAccounts')
      .mockImplementation(() => ({ data: [] }));
    const store = mockStore({
      notifications: {}
    });
    // Select item 'service-account-1'
    const { queryByPlaceholderText } = render(
      <Provider store={store}>
        <ServiceAccountsDropdown {...props} />
      </Provider>
    );
    expect(
      queryByPlaceholderText(
        /no serviceaccounts found in the 'blue' namespace/i
      )
    ).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('renders loading skeleton based on Redux state', () => {
    jest
      .spyOn(ServiceAccountsAPI, 'useServiceAccounts')
      .mockImplementation(() => ({ isFetching: true }));
    const store = mockStore({
      notifications: {}
    });
    const { queryByText } = render(
      <Provider store={store}>
        <ServiceAccountsDropdown {...props} />
      </Provider>
    );
    expect(queryByText(initialTextRegExp)).toBeFalsy();
  });

  it('handles onChange event', () => {
    jest
      .spyOn(ServiceAccountsAPI, 'useServiceAccounts')
      .mockImplementation(() => ({
        data: [serviceAccount1, serviceAccount2]
      }));
    const store = mockStore({
      notifications: {}
    });
    const onChange = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <ServiceAccountsDropdown {...props} onChange={onChange} />
      </Provider>
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    fireEvent.click(getByText(/service-account-1/i));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
