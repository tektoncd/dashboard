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

it('SecretsModal renders blank', () => {
  const props = {
    open: true
  };

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

  jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);

  const store = mockStore({
    secrets,
    namespaces
  });
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

  jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);

  const store = mockStore({
    secrets,
    namespaces
  });

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
