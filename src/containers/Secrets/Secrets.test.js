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
import { fireEvent, waitForElement } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Route } from 'react-router-dom';
import { urls } from '@tektoncd/dashboard-utils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@tektoncd/dashboard-components/src/utils/test';

import Secrets from '.';
import * as API from '../../api';
import * as PipelinesAPI from '../../api/pipelines';
import * as SecretsAPI from '../../api/secrets';
import * as ServiceAccountsAPI from '../../api/serviceAccounts';
import * as selectors from '../../reducers';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const byNamespace = {
  default: [
    {
      metadata: {
        uid: '0',
        name: 'github-repo-access-secret',
        namespace: 'default',
        annotations: {
          'tekton.dev/git-0': 'https://github.ibm.com',
          badannotation: 'badcontent'
        }
      },
      type: 'kubernetes.io/basic-auth',
      data: {
        username: 'bXl1c2VybmFtZQ==' // This is "myusername"
      }
    },
    {
      metadata: {
        uid: '0',
        name: 'another-secret-with-label',
        namespace: 'default',
        annotations: {
          'tekton.dev/git-0': 'https://github.com'
        },
        labels: {
          baz: 'bam'
        }
      },
      type: 'kubernetes.io/basic-auth',
      data: {
        username: '5rWL6K+V' // This is "测试"
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
  properties: {},
  serviceAccounts: {
    byId: serviceAccountsById,
    byNamespace: serviceAccountsByNamespace,
    isFetching: false
  }
});

describe('Secrets', () => {
  beforeEach(() => {
    jest.spyOn(PipelinesAPI, 'getPipelines').mockImplementation(() => {});
    jest.spyOn(selectors, 'isReadOnly').mockImplementation(() => false);
  });

  it('click add new secret and create secret UI appears', () => {
    const currentProps = {
      history: {
        push: jest.fn()
      },
      secrets: [
        {
          metadata: {
            name: 'github-repo-access-secret',
            annotations: {
              'tekton.dev/git-0': 'https://github.ibm.com'
            }
          }
        }
      ]
    };

    jest.spyOn(SecretsAPI, 'getSecrets').mockImplementation(() => []);
    jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);
    jest
      .spyOn(ServiceAccountsAPI, 'getServiceAccounts')
      .mockImplementation(() => []);

    const { getByText } = renderWithRouter(
      <Provider store={store}>
        <Route
          path={urls.secrets.all()}
          render={props => <Secrets {...props} {...currentProps} />}
        />
      </Provider>,
      { route: urls.secrets.all() }
    );

    fireEvent.click(getByText('Create'));
    expect(currentProps.history.push).toHaveBeenCalledWith(
      `${urls.secrets.create()}?secretType=password`
    );
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
      ]
    };

    const { getByTestId, getByText, queryByTestId } = renderWithRouter(
      <Provider store={store}>
        <Route
          path={urls.secrets.all()}
          render={props => <Secrets {...props} {...currentProps} />}
        />
      </Provider>,
      { route: urls.secrets.all() }
    );

    expect(queryByTestId('deleteModal')).toBeFalsy();

    fireEvent.click(getByText('Delete'));

    expect(
      getByTestId('deleteModal').className.includes('is-visible')
    ).toBeTruthy();
  });

  it('renders with one secret', () => {
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

  it('only renders tekton.dev annotations', () => {
    const currentProps = {
      secrets: [
        {
          name: 'github-repo-access-secret',
          annotations: {
            'tekton.dev/git-0': 'https://github.ibm.com'
          }
        }
      ]
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

  it('renders username in regular form (not encoded)', () => {
    const { queryByText, getByText } = renderWithRouter(
      <Provider store={store}>
        <Route
          path={urls.secrets.all()}
          render={props => <Secrets {...props} />}
        />
      </Provider>,
      { route: urls.secrets.all() }
    );
    expect(queryByText(/github-repo-access-secret/i)).toBeTruthy();
    expect(getByText('myusername')).toBeTruthy();
    expect(getByText('测试')).toBeTruthy();
  });

  it('can be filtered on a single label filter', async () => {
    const { getByTestId, getByText, queryByText } = renderWithRouter(
      <Provider store={store}>
        <Route
          path={urls.secrets.all()}
          render={props => <Secrets {...props} />}
        />
      </Provider>,
      { route: urls.secrets.all() }
    );

    const filterValue = 'baz:bam';
    const filterInputField = getByTestId('filter-search-bar');
    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(queryByText(filterValue)).toBeTruthy();
    expect(queryByText('github-repo-access-secret')).toBeFalsy();
    expect(queryByText('another-secret-with-label')).toBeTruthy();
  });

  it('can not be created when in read-only mode', async () => {
    jest.spyOn(selectors, 'isReadOnly').mockImplementation(() => true);

    const { queryByText } = renderWithRouter(
      <Provider store={store}>
        <Route
          path={urls.secrets.all()}
          render={props => <Secrets {...props} />}
        />
      </Provider>,
      { route: urls.secrets.all() }
    );
    await waitForElement(() => queryByText(/github-repo-access-secret/i));
    expect(queryByText('Create')).toBeFalsy();
  });

  it('can be created when not in read-only mode', async () => {
    jest.spyOn(selectors, 'isReadOnly').mockImplementation(() => false);

    const { queryByText } = renderWithRouter(
      <Provider store={store}>
        <Route
          path={urls.secrets.all()}
          render={props => <Secrets {...props} />}
        />
      </Provider>,
      { route: urls.secrets.all() }
    );
    await waitForElement(() => queryByText(/github-repo-access-secret/i));
    expect(queryByText('Create')).toBeTruthy();
  });
});
