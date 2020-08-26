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
import { action } from '@storybook/addon-actions';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import ServiceAccountsDropdown from './ServiceAccountsDropdown';

const props = {
  id: 'ServiceAccounts dropdown',
  onChange: action('onChange')
};

const serviceAccountsByNamespace = {
  default: {
    default: 'id-default',
    'service-account-1': 'id-service-account-1',
    'service-account-2': 'id-service-account-2',
    'service-account-3': 'id-service-account-3'
  }
};

const serviceAccountsById = {
  'id-default': {
    metadata: {
      name: 'default',
      namespace: 'default',
      uid: 'id-default'
    }
  },
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
      namespace: 'default',
      uid: 'id-service-account-3'
    }
  }
};

const namespacesByName = {
  default: '',
  'kube-public': '',
  'kube-system': '',
  'tekton-pipelines': ''
};

const middleware = [thunk];
const mockStore = configureStore(middleware);

export default {
  component: ServiceAccountsDropdown,
  title: 'Containers/Dropdowns/ServiceAccountsDropdown'
};

export const Base = () => <ServiceAccountsDropdown {...props} />;
Base.decorators = [
  storyFn => {
    const store = mockStore({
      serviceAccounts: {
        byId: serviceAccountsById,
        byNamespace: serviceAccountsByNamespace,
        isFetching: false
      },
      namespaces: {
        byName: namespacesByName,
        selected: 'default'
      },
      notifications: {}
    });
    return <Provider store={store}>{storyFn()}</Provider>;
  }
];

export const Empty = () => <ServiceAccountsDropdown {...props} />;
Empty.decorators = [
  storyFn => {
    const store = mockStore({
      serviceAccounts: {
        byId: {},
        byNamespace: {},
        isFetching: false
      },
      namespaces: {
        byName: namespacesByName,
        selected: 'default'
      },
      notifications: {}
    });
    return <Provider store={store}>{storyFn()}</Provider>;
  }
];
