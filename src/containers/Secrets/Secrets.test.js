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
import Secrets from './Secrets';
import * as API from '../../api';

const middleware = [thunk];
const mockStore = configureStore(middleware);

it('click add new secret & modal appears', () => {
  const props = {
    secrets: [
      {
        uid: '0',
        name: 'github-repo-access-secret',
        type: 'userpass',
        annotations: {
          'tekton.dev/git-0': 'https://github.ibm.com'
        }
      }
    ],
    loading: false,
    error: null
  };

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

  const byId = {
    'github-repo-access-secret': {
      name: 'github-repo-access-secret',
      username: 'cjlg@ibm.com',
      password: '********',
      description: '',
      type: 'userpass',
      resourceVersion: '291257',
      url: {
        'tekton.dev/git-0': 'https://github.ibm.com'
      },
      serviceAccount: 'default'
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
        },
        spec: {
          finalizers: ['kubernetes']
        },
        status: {
          phase: 'Active'
        }
      },
      docker: {
        metadata: {
          name: 'docker',
          selfLink: '/api/v1/namespaces/docker',
          uid: '571796bd-6ce1-11e9-af21-025000000001',
          resourceVersion: '413',
          creationTimestamp: '2019-05-02T13:51:09Z'
        },
        spec: {
          finalizers: ['kubernetes']
        },
        status: {
          phase: 'Active'
        }
      },
      'kube-public': {
        metadata: {
          name: 'kube-public',
          selfLink: '/api/v1/namespaces/kube-public',
          uid: '351f8763-6ce1-11e9-af21-025000000001',
          resourceVersion: '31',
          creationTimestamp: '2019-05-02T13:50:12Z'
        },
        spec: {
          finalizers: ['kubernetes']
        },
        status: {
          phase: 'Active'
        }
      },
      'kube-system': {
        metadata: {
          name: 'kube-system',
          selfLink: '/api/v1/namespaces/kube-system',
          uid: '33426195-6ce1-11e9-af21-025000000001',
          resourceVersion: '12',
          creationTimestamp: '2019-05-02T13:50:09Z'
        },
        spec: {
          finalizers: ['kubernetes']
        },
        status: {
          phase: 'Active'
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

  const secretName = 'secretName';

  jest
    .spyOn(API, 'getCredentials')
    .mockImplementation(() => []);

  jest
    .spyOn(API, 'getNamespaces')
    .mockImplementation(() => []);

  const store = mockStore({
    secrets: {
      byNamespace,
      byId,
      isFetching: false,
      errorMessage: null
    },
    namespaces
  });
  const { getByTestId, queryByText } = render(
    <Provider store={store}>
      <Secrets {...props} />
    </Provider>
  );

  expect(queryByText('Create Secret')).toBeFalsy();
  expect(queryByText('Close')).toBeFalsy();
  expect(queryByText('Submit')).toBeFalsy();

  fireEvent.click(getByTestId('addIcon'));

  expect(queryByText('Create Secret')).toBeTruthy();
  expect(queryByText('Close')).toBeTruthy();
  expect(queryByText('Submit')).toBeTruthy();
});

it('click add delete secret & modal appears', () => {
  const props = {
    secrets: [
      {
        uid: '0',
        name: 'github-repo-access-secret',
        type: 'userpass',
        annotations: {
          'tekton.dev/git-0': 'https://github.ibm.com'
        }
      }
    ],
    loading: false,
    error: null
  };

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

  const byId = {
    'github-repo-access-secret': {
      name: 'github-repo-access-secret',
      username: 'cjlg@ibm.com',
      password: '********',
      description: '',
      type: 'userpass',
      resourceVersion: '291257',
      url: {
        'tekton.dev/git-0': 'https://github.ibm.com'
      },
      serviceAccount: 'default'
    }
  };

  const namespaces = {
    selected: 'default'
  };

  const store = mockStore({
    secrets: {
      byNamespace,
      byId,
      isFetching: false,
      errorMessage: null
    },
    namespaces
  });
  const { getByTestId, queryByText } = render(
    <Provider store={store}>
      <Secrets {...props} />
    </Provider>
  );

  expect(queryByText('Delete Secret')).toBeFalsy();
  expect(queryByText('Cancel')).toBeFalsy();
  expect(queryByText('Delete')).toBeFalsy();

  fireEvent.click(getByTestId('deleteIcon'));

  expect(queryByText('Delete Secret')).toBeTruthy();
  expect(queryByText('Cancel')).toBeTruthy();
  expect(queryByText('Delete')).toBeTruthy();
});

it('error notification appears', () => {
  const props = {
    secrets: [],
    loading: false
  };

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
    selected: 'default'
  };

  const store = mockStore({
    secrets: {
      byNamespace,
      isFetching: false,
      errorMessage: 'Some error message'
    },
    namespaces
  });
  const { getByTestId } = render(
    <Provider store={store}>
      <Secrets {...props} />
    </Provider>
  );

  expect(getByTestId('errorNotificationComponent')).toBeTruthy();
});
