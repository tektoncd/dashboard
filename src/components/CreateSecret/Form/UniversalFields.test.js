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
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithIntl } from '@tektoncd/dashboard-components/src/utils/test';

import UniversalFields from './UniversalFields';

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
      }
    },
    docker: {
      metadata: {
        name: 'docker',
        selfLink: '/api/v1/namespaces/docker',
        uid: '571796bd-6ce1-11e9-af21-025000000001',
        resourceVersion: '413',
        creationTimestamp: '2019-05-02T13:51:09Z'
      }
    },
    'kube-public': {
      metadata: {
        name: 'kube-public',
        selfLink: '/api/v1/namespaces/kube-public',
        uid: '351f8763-6ce1-11e9-af21-025000000001',
        resourceVersion: '31',
        creationTimestamp: '2019-05-02T13:50:12Z'
      }
    },
    'kube-system': {
      metadata: {
        name: 'kube-system',
        selfLink: '/api/v1/namespaces/kube-system',
        uid: '33426195-6ce1-11e9-af21-025000000001',
        resourceVersion: '12',
        creationTimestamp: '2019-05-02T13:50:09Z'
      }
    },
    'tekton-pipelines': {
      metadata: {
        name: 'tekton-pipelines',
        selfLink: '/api/v1/namespaces/tekton-pipelines',
        uid: 'd30b0dbf-6d08-11e9-af21-025000000001',
        resourceVersion: '12915',
        creationTimestamp: '2019-05-02T18:33:47Z',
        annotations: {
          'kubectl.kubernetes.io/last-applied-configuration':
            '{"apiVersion":"v1","kind":"Namespace","metadata":{"annotations":{},"name":"tekton-pipelines"}}\n'
        }
      }
    }
  },
  errorMessage: null,
  isFetching: false,
  selected: 'default'
};

const store = mockStore({
  namespaces,
  properties: {}
});

it('UniversalFields renders with blank inputs', () => {
  const props = {
    name: '',
    handleChangeNamespace() {},
    handleChangeTextInput() {},
    selectedNamespace: '',
    invalidFields: {},
    handleSecretType() {},
    secretType: '',
    loading: false
  };
  const {
    getByLabelText,
    getAllByDisplayValue,
    getAllByLabelText,
    getByPlaceholderText
  } = renderWithIntl(
    <Provider store={store}>
      <UniversalFields {...props} />
    </Provider>
  );
  expect(getByLabelText('Name')).toBeTruthy();
  expect(getAllByLabelText('Namespace')[0]).toBeTruthy();
  expect(getByPlaceholderText(/Select Namespace/i)).toBeTruthy();
  expect(getAllByDisplayValue('').length).toEqual(2);
});

it('UniversalFields incorrect fields', () => {
  const props = {
    invalidFields: { name: true, namespace: true },
    name: '',
    handleChangeNamespace() {},
    handleChangeTextInput() {},
    selectedNamespace: '',
    handleSecretType() {},
    secretType: '',
    loading: false
  };
  const { getByLabelText, getByText } = renderWithIntl(
    <Provider store={store}>
      <UniversalFields {...props} />
    </Provider>
  );

  const nameInput = getByLabelText('Name');

  expect(nameInput.getAttribute('data-invalid')).toBeTruthy();
  expect(getByText(/Namespace required./i)).toBeTruthy();
});

it('UniversalFields disabled when loading', () => {
  const props = {
    invalidFields: {},
    name: '',
    handleChangeNamespace() {},
    handleChangeTextInput() {},
    selectedNamespace: 'default',
    handleSecretType() {},
    secretType: '',
    loading: true
  };
  const { getByLabelText, getAllByLabelText } = renderWithIntl(
    <Provider store={store}>
      <UniversalFields {...props} />
    </Provider>
  );

  const nameInput = getByLabelText('Name');
  const namespaceDropdown = getAllByLabelText('Namespace')[1];

  expect(nameInput.disabled).toBeTruthy();
  expect(namespaceDropdown.disabled).toBeTruthy();
});
