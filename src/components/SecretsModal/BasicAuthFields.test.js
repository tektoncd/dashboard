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
import { render } from 'react-testing-library';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BasicAuthFields from './BasicAuthFields';

const middleware = [thunk];
const mockStore = configureStore(middleware);

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

const serviceAccounts = [
  {
    metadata: {
      name: 'service-account-1',
      namespace: 'blue',
      uid: 'id-service-account-1'
    }
  },
  {
    metadata: {
      name: 'service-account-2',
      namespace: 'blue',
      uid: 'id-service-account-2'
    }
  },
  {
    metadata: {
      name: 'service-account-3',
      namespace: 'green',
      uid: 'id-service-account-3'
    }
  }
];

const store = mockStore({
  namespaces
});

it('BasicAuthFields renders with blank inputs', () => {
  const props = {
    username: '',
    password: '',
    serviceAccount: '',
    handleChange() {},
    invalidFields: {},
    serviceAccounts
  };

  const { getByLabelText, getAllByDisplayValue } = render(
    <Provider store={store}>
      <BasicAuthFields {...props} />
    </Provider>
  );
  expect(getByLabelText(/Username/i)).toBeTruthy();
  expect(getByLabelText(/Password\/Token/i)).toBeTruthy();
  expect(getByLabelText(/Service Account/i)).toBeTruthy();
  expect(getAllByDisplayValue('').length).toEqual(2);
});

it('BasicAuthFields incorrect fields', () => {
  const props = {
    username: 'text',
    password: 'text',
    serviceAccount: '',
    handleChange() {},
    invalidFields: { username: true, password: true },
    serviceAccounts
  };

  const { getByLabelText } = render(
    <Provider store={store}>
      <BasicAuthFields {...props} />
    </Provider>
  );

  const usernameInput = getByLabelText(/Username/i);
  const passwordInput = getByLabelText(/Password\/Token/i);
  const serviceAccountInput = getByLabelText(/Service Account/i);

  expect(usernameInput.getAttribute('data-invalid')).toBeTruthy();
  expect(passwordInput.getAttribute('data-invalid')).toBeTruthy();
  expect(serviceAccountInput.getAttribute('data-invalid')).toBeFalsy();
});
