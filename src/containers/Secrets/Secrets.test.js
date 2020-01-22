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
import { createIntl } from 'react-intl';
import { fireEvent } from 'react-testing-library';
import { Provider } from 'react-redux';
import { Route } from 'react-router-dom';
import { urls } from '@tektoncd/dashboard-utils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '../../utils/test';
import Secrets from '.';
import * as API from '../../api';

beforeEach(jest.resetAllMocks);

const middleware = [thunk];
const mockStore = configureStore(middleware);

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

const byNamespace = {
  default: [
    {
      uid: '0',
      name: 'github-repo-access-secret',
      type: 'userpass',
      annotations: {
        'tekton.dev/git-0': 'https://github.ibm.com',
        badannotation: 'badcontent'
      }
    },
    {
      uid: '0',
      type: 'userpass',
      name: 'another-secret-with-label',
      annotations: {
        'tekton.dev/git-0': 'https://github.com'
      },
      labels: {
        baz: 'bam'
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
  default: {
    'service-account-1': 'id-service-account-1',
    'service-account-2': 'id-service-account-2',
    'service-account-3': 'id-service-account-3'
  }
};

const serviceAccountsById = {
  'id-service-account-1': {
    metadata: {
      name: 'service-account-1',
      namespace: 'default',
      uid: 'id-service-account-1'
    },
    secrets: [{ name: 'github-repo-access-secret' }]
  },
  'id-service-account-2': {
    metadata: {
      name: 'service-account-2',
      namespace: 'default',
      uid: 'id-service-account-2'
    },
    secrets: []
  },
  'id-service-account-3': {
    metadata: {
      name: 'service-account-3',
      namespace: 'default',
      uid: 'id-service-account-3'
    },
    secrets: []
  }
};

const store = mockStore({
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
  const currentProps = {
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

  const { getByTestId, getByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path={urls.secrets.all()}
        render={props => <Secrets {...props} {...currentProps} />}
      />
    </Provider>,
    { route: urls.secrets.all() }
  );

  expect(getByTestId('modal').className.includes('is-visible')).toBeFalsy();

  fireEvent.click(getByText('Create'));

  expect(getByTestId('modal').className.includes('is-visible')).toBeTruthy();
});

it('click delete secret & modal appears', () => {
  const currentProps = {
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

  const { getByTestId, getByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path={urls.secrets.all()}
        render={props => <Secrets {...props} {...currentProps} />}
      />
    </Provider>,
    { route: urls.secrets.all() }
  );

  expect(
    getByTestId('deleteModal').className.includes('is-visible')
  ).toBeFalsy();

  fireEvent.click(getByText('Delete'));

  expect(
    getByTestId('deleteModal').className.includes('is-visible')
  ).toBeTruthy();
});

it('SecretsTable renders with one secret', () => {
  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path={urls.secrets.all()}
        render={props => <Secrets {...props} />}
      />
    </Provider>,
    { route: urls.secrets.all() }
  );

  expect(queryByText(/github-repo-access-secret/i)).toBeTruthy();
  expect(queryByText(/service-account-1/i)).toBeTruthy();
  expect(
    queryByText(/tekton.dev\/git-0: https:\/\/github.ibm.com/i)
  ).toBeTruthy();
});

it('SecretsTable only renders tekton.dev annotations', () => {
  const currentProps = {
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

  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path={urls.secrets.all()}
        render={props => <Secrets {...props} {...currentProps} />}
      />
    </Provider>,
    { route: urls.secrets.all() }
  );

  expect(
    queryByText(/tekton.dev\/git-0: https:\/\/github.ibm.com/i)
  ).toBeTruthy();

  expect(queryByText(/badannotation/i)).toBeFalsy();

  expect(queryByText(/badcontent/i)).toBeFalsy();
});

it('Secrets can be filtered on a single label filter', async () => {
  const currentProps = {
    loading: false,
    error: null,
    intl
  };

  const { getByTestId, getByText, queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path={urls.secrets.all()}
        render={props => <Secrets {...props} {...currentProps} />}
      />
    </Provider>,
    { route: urls.secrets.all() }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.click(getByText('Add filter'));

  expect(queryByText(filterValue)).toBeTruthy();
  expect(queryByText('github-repo-access-secret')).toBeFalsy();
  expect(queryByText('another-secret-with-label')).toBeTruthy();
});
