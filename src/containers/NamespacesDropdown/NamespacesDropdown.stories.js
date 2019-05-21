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
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import NamespacesDropdown from './NamespacesDropdown';

const props = {
  id: 'namespaces dropdown',
  onChange: action('onChange')
};

const byName = {
  default: '',
  'kube-public': '',
  'kube-system': '',
  'tekton-pipelines': ''
};

const middleware = [thunk];
const mockStore = configureStore(middleware);

storiesOf('NamespacesDropdown', module)
  .add('default', () => {
    const store = mockStore({
      namespaces: {
        byName,
        isFetching: false
      }
    });
    return (
      <Provider store={store}>
        <NamespacesDropdown {...props} />
      </Provider>
    );
  })
  .add('loading', () => {
    const store = mockStore({
      namespaces: {
        byName,
        isFetching: true
      }
    });
    return (
      <Provider store={store}>
        <NamespacesDropdown {...props} />
      </Provider>
    );
  });
