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
import ServiceAccountsDropdown from './ServiceAccountsDropdown';
import * as API from '../../api';

const props = {
  id: 'service-accounts-dropdown'
};

const serviceAccountsByNamespace = {
  default: {
    default: 'id-default',
    'service-account-1': 'id-service-account-1',
    'service-account-2': 'id-service-account-2'
  },
  green: {
    'service-account-3': 'id-service-account-3'
  }
};

const serviceAccountsById = {
  'id-default': {
    metadata: {
      name: 'default',
      namespace: 'default',
      uid: 'id-default'
    }
  },
  'id-service-account-1': {
    metadata: {
      name: 'service-account-1',
      namespace: 'default',
      uid: 'id-service-account-1'
    }
  },
  'id-service-account-2': {
    metadata: {
      name: 'service-account-2',
      namespace: 'default',
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

const namespacesByName = {
  default: '',
  green: '',
  blue: ''
};

const initialTextRegExp = new RegExp('select service account', 'i');

const middleware = [thunk];
const mockStore = configureStore(middleware);

beforeEach(() => {
  jest
    .spyOn(API, 'getServiceAccounts')
    .mockImplementation(() => serviceAccountsById);
});

it('ServiceAccountsDropdown renders items based on Redux state', () => {
  const store = mockStore({
    serviceAccounts: {
      byId: serviceAccountsById,
      byNamespace: serviceAccountsByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'default'
    }
  });
  const { getByText, queryByText } = render(
    <Provider store={store}>
      <ServiceAccountsDropdown {...props} />
    </Provider>
  );
  fireEvent.click(getByText(initialTextRegExp));
  Object.keys(serviceAccountsByNamespace.default).forEach(item => {
    const re = new RegExp(item, 'i');
    expect(queryByText(re)).toBeTruthy();
  });
  fireEvent.click(getByText(/service-account-1/i));
  Object.keys(serviceAccountsByNamespace.default).forEach(item => {
    if (item !== 'service-account-1') {
      const re = new RegExp(item, 'i');
      expect(queryByText(re)).toBeFalsy();
    }
  });
  expect(queryByText(/service-account-1/i)).toBeTruthy();
  expect(queryByText(initialTextRegExp)).toBeFalsy();
});

it('ServiceAccountsDropdown renders items based on Redux state when namespace changes', () => {
  const store = mockStore({
    serviceAccounts: {
      byId: serviceAccountsById,
      byNamespace: serviceAccountsByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'default'
    }
  });
  const { container, getByText, queryByText } = render(
    <Provider store={store}>
      <ServiceAccountsDropdown {...props} />
    </Provider>
  );
  fireEvent.click(getByText(initialTextRegExp));
  Object.keys(serviceAccountsByNamespace.default).forEach(item => {
    const re = new RegExp(item, 'i');
    expect(queryByText(re)).toBeTruthy();
  });
  fireEvent.click(getByText('service-account-1'));
  expect(queryByText(/service-account-1/i)).toBeTruthy();
  expect(queryByText(initialTextRegExp)).toBeFalsy();

  // Change selected namespace to verify the ServiceAccounts Dropdown updates items accordingly
  // selected item 'service-account-1' should be reset to ''
  const newStore = mockStore({
    serviceAccounts: {
      byId: serviceAccountsById,
      byNamespace: serviceAccountsByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'green'
    }
  });
  render(
    <Provider store={newStore}>
      <ServiceAccountsDropdown {...props} />
    </Provider>,
    { container }
  );
  fireEvent.click(getByText(initialTextRegExp));
  Object.keys(serviceAccountsByNamespace.green).forEach(item => {
    const re = new RegExp(item, 'i');
    expect(queryByText(re)).toBeTruthy();
  });
  Object.keys(serviceAccountsByNamespace.default).forEach(item => {
    const re = new RegExp(item, 'i');
    expect(queryByText(re)).toBeFalsy();
  });
  fireEvent.click(getByText('service-account-3'));
  expect(queryByText(/service-account-3/i)).toBeTruthy();
  expect(queryByText(initialTextRegExp)).toBeFalsy();
});

it('ServiceAccountsDropdown renders loading skeleton based on Redux state', () => {
  const store = mockStore({
    serviceAccounts: {
      byId: serviceAccountsById,
      byNamespace: serviceAccountsByNamespace,
      isFetching: true
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'default'
    }
  });
  const { queryByText } = render(
    <Provider store={store}>
      <ServiceAccountsDropdown {...props} fetchServiceAccounts={() => {}} />
    </Provider>
  );
  expect(queryByText(initialTextRegExp)).toBeFalsy();
});

it('ServiceAccountsDropdown handles onChange event', () => {
  const store = mockStore({
    serviceAccounts: {
      byId: serviceAccountsById,
      byNamespace: serviceAccountsByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'default'
    }
  });
  const onChange = jest.fn();
  const { getByText } = render(
    <Provider store={store}>
      <ServiceAccountsDropdown {...props} onChange={onChange} />
    </Provider>
  );
  fireEvent.click(getByText(initialTextRegExp));
  fireEvent.click(getByText(/default/i));
  expect(onChange).toHaveBeenCalledTimes(1);
});

it('ServiceAccountsDropdown handles onChange event when namespace changes', () => {
  const storeDefaultNamespace = mockStore({
    serviceAccounts: {
      byId: serviceAccountsById,
      byNamespace: serviceAccountsByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'default'
    }
  });
  const onChange = jest.fn();
  const { container, getByText } = render(
    <Provider store={storeDefaultNamespace}>
      <ServiceAccountsDropdown {...props} onChange={onChange} />
    </Provider>
  );
  fireEvent.click(getByText(initialTextRegExp));
  fireEvent.click(getByText(/default/i));

  // Should call onChange because selected item was 'default' and now it will be reset to ''
  const storeGreenNamespace = mockStore({
    serviceAccounts: {
      byId: serviceAccountsById,
      byNamespace: serviceAccountsByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'green'
    }
  });
  render(
    <Provider store={storeGreenNamespace}>
      <ServiceAccountsDropdown {...props} onChange={onChange} />
    </Provider>,
    { container }
  );

  // Should not call onChange because selected item was '' and now it will be reset to ''
  const storeBlueNamespace = mockStore({
    serviceAccounts: {
      byId: serviceAccountsById,
      byNamespace: serviceAccountsByNamespace,
      isFetching: false
    },
    namespaces: {
      byName: namespacesByName,
      selected: 'blue'
    }
  });
  render(
    <Provider store={storeBlueNamespace}>
      <ServiceAccountsDropdown {...props} onChange={onChange} />
    </Provider>,
    { container }
  );
  expect(onChange).toHaveBeenCalledTimes(2);
});
