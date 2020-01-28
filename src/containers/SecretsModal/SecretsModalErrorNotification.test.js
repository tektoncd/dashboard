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
import { fireEvent, waitForElement } from 'react-testing-library';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithIntl } from '../../utils/test';
import SecretsModal from '.';
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

const serviceAccountsById = {
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

const serviceAccountsByNamespace = {
  default: {
    'service-account-1': 'id-service-account-1',
    'service-account-2': 'id-service-account-2'
  },
  green: {
    'service-account-3': 'id-service-account-3'
  }
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

it('error notification appears', async () => {
  const props = {
    open: true
  };
  const store = mockStore({
    secrets: {
      byNamespace,
      isFetching: false,
      errorMessage: 'Some error message'
    },
    namespaces,
    notifications: {},
    serviceAccount: 'service-account-1',
    serviceAccounts: {
      byId: serviceAccountsById,
      byNamespace: serviceAccountsByNamespace,
      isFetching: false
    }
  });

  jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);
  jest
    .spyOn(API, 'getServiceAccounts')
    .mockImplementation(() => [{ metadata: { name: 'service-account-1' } }]);

  const {
    getByTestId,
    getByPlaceholderText,
    getByText,
    queryByText
  } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );

  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'test-secret' }
  });
  fireEvent.click(getByText(/select namespace/i));
  await waitForElement(() => getByText(/default/i));
  fireEvent.click(getByText(/default/i));

  fireEvent.change(getByPlaceholderText(/username/i), {
    target: { value: 'test-name' }
  });
  fireEvent.change(getByPlaceholderText(/\*\*\*\*\*\*\*\*/i), {
    target: { value: 'test-password' }
  });
  fireEvent.click(getByText(/select service account/i));
  await waitForElement(() => getByText(/service-account-1/i));
  fireEvent.click(getByText(/service-account-1/i));
  fireEvent.click(queryByText('Create'));

  expect(getByTestId('errorNotificationComponent')).toBeTruthy();
});
