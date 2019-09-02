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
import Secrets from '.';
import * as API from '../../api';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const byNamespace = {
  default: [
    {
      uid: '0',
      name: 'github-repo-access-secret',
      type: 'userpass',
      annotations: {
        'tekton.dev/git-0': 'https://github.ibm.com'
      }
    }
  ]
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
      },
      spec: {
        finalizers: ['kubernetes']
      },
      status: {
        phase: 'Active'
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

let store = mockStore({
  secrets: {
    byNamespace,
    isFetching: false,
    errorMessage: null
  },
  namespaces,
  notifications: {},
  serviceAccounts: {
    byId: serviceAccountsById,
    byNamespace: serviceAccountsByNamespace,
    isFetching: false
  }
});

it('click add new secret & modal appears', () => {
  const props = {
    secrets: [
      {
        name: 'github-repo-access-secret',
        annotations: {
          'tekton.dev/git-0': 'https://github.ibm.com'
        }
      }
    ],
    loading: false,
    error: null
  };

  jest.spyOn(API, 'getCredentials').mockImplementation(() => []);

  jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);

  jest.spyOn(API, 'getServiceAccounts').mockImplementation(() => []);

  const { getByTestId, queryByText } = render(
    <Provider store={store}>
      <Secrets {...props} />
    </Provider>
  );

  expect(queryByText('Create Secret')).toBeFalsy();
  expect(queryByText('Close')).toBeFalsy();
  expect(queryByText('Submit')).toBeFalsy();

  fireEvent.click(getByTestId('addButton'));

  expect(queryByText('Create Secret')).toBeTruthy();
  expect(queryByText('Close')).toBeTruthy();
  expect(queryByText('Submit')).toBeTruthy();
});

it('click add delete secret & modal appears', () => {
  const props = {
    secrets: [
      {
        name: 'github-repo-access-secret',
        annotations: {
          'tekton.dev/git-0': 'https://github.ibm.com'
        }
      }
    ],
    loading: false,
    error: null
  };

  const { getByTestId, queryByText } = render(
    <Provider store={store}>
      <Secrets {...props} />
    </Provider>
  );

  expect(queryByText('Delete Secret')).toBeFalsy();

  fireEvent.click(getByTestId('deleteButton'));

  expect(queryByText('Delete Secret')).toBeTruthy();
  expect(queryByText('Cancel')).toBeTruthy();
  expect(queryByText('Delete')).toBeTruthy();
});

it('error notification appears', () => {
  const props = {
    secrets: [],
    loading: false,
    error: 'error'
  };

  store = mockStore({
    secrets: {
      byNamespace,
      isFetching: false,
      errorMessage: 'Some error message'
    },
    namespaces,
    notifications: {}
  });
  const { getByTestId } = render(
    <Provider store={store}>
      <Secrets {...props} />
    </Provider>
  );

  expect(getByTestId('errorNotificationComponent')).toBeTruthy();
});
