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
import { fireEvent, render, waitForElement } from 'react-testing-library';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import SecretsModal from '.';

// Declares scrollIntoView as a function for testing purposes
window.HTMLElement.prototype.scrollIntoView = function() {};

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

it('Test SecretsModal Server URL examples', async () => {
  const handleNew = jest.fn();
  const props = {
    open: true,
    handleNew
  };

  const { getByLabelText, getByText } = render(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  let annotationValue0 = getByLabelText(/Annotation Value#0/i);
  expect(annotationValue0.placeholder).toEqual('https://github.com');
  fireEvent.click(await waitForElement(() => getByText(/Git Server/i)));
  fireEvent.click(await waitForElement(() => getByText(/Docker Registry/i)));

  annotationValue0 = getByLabelText(/Annotation Value#0/i);
  expect(annotationValue0.placeholder).toEqual('https://index.docker.io/v1/');

  fireEvent.click(document.getElementsByClassName('addIcon').item(0));
  let annotationValue1 = getByLabelText(/Annotation Value#1/i);
  expect(annotationValue1.placeholder).toEqual('https://index.docker.io/v1/');

  fireEvent.click(await waitForElement(() => getByText(/Docker Registry/i)));
  fireEvent.click(await waitForElement(() => getByText(/Git Server/i)));

  annotationValue0 = getByLabelText(/Annotation Value#0/i);
  expect(annotationValue0.placeholder).toEqual('https://github.com');
  annotationValue1 = getByLabelText(/Annotation Value#1/i);
  expect(annotationValue1.placeholder).toEqual('https://github.com');
});
