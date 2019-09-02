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
import SecretsModal from '.';
import * as API from '../../api';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const secrets = {
  byNamespace: {},
  errorMessage: null,
  isFetching: false
};

const namespaces = {
  byName: {
    default: {
      metadata: {
        name: 'default',
        selfLink: '/api/v1/namespaces/default',
        uid: '32b35d3b-6ce1-11e9-af21-025000000001',
        resourceVersion: '4',
        creationTimestamp: '2019-05-02T13:50:08Z'
      }
    }
  },
  errorMessage: null,
  isFetching: false,
  selected: 'default'
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

const store = mockStore({
  secrets,
  namespaces,
  notifications: {},
  serviceAccounts: {
    byId: serviceAccountsById,
    byNamespace: serviceAccountsByNamespace,
    isFetching: false
  }
});

it('SecretsModal renders blank', () => {
  const props = {
    open: true
  };

  jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);
  jest.spyOn(API, 'getServiceAccounts').mockImplementation(() => []);

  const { queryByText } = render(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  expect(queryByText('Create Secret')).toBeTruthy();
  expect(queryByText('Close')).toBeTruthy();
  expect(queryByText('Submit')).toBeTruthy();
});

it('Test SecretsModal click events', () => {
  const handleNew = jest.fn();
  const handleSubmit = jest.fn();
  const props = {
    open: true,
    handleNew
  };

  jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);
  jest.spyOn(API, 'getServiceAccounts').mockImplementation(() => []);

  const { queryByText, rerender } = render(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.click(queryByText('Close'));
  expect(handleNew).toHaveBeenCalledTimes(1);
  rerender(
    <Provider store={store}>
      <SecretsModal open={false} />
    </Provider>
  );
  fireEvent.click(queryByText('Submit'));
  expect(handleSubmit).toHaveBeenCalledTimes(0);
});
