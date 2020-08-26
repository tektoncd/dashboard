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

import PipelinesDropdown from './PipelinesDropdown';

const props = {
  onChange: action('onChange')
};

const pipelinesByNamespace = {
  default: {
    'pipeline-1': 'id-pipeline-1',
    'pipeline-2': 'id-pipeline-2',
    'pipeline-3': 'id-pipeline-3'
  }
};

const pipelinesById = {
  'id-pipeline-1': {
    metadata: {
      name: 'pipeline-1',
      namespace: 'default',
      uid: 'id-pipeline-1'
    }
  },
  'id-pipeline-2': {
    metadata: {
      name: 'pipeline-2',
      namespace: 'default',
      uid: 'id-pipeline-2'
    }
  },
  'id-pipeline-3': {
    metadata: {
      name: 'pipeline-3',
      namespace: 'default',
      uid: 'id-pipeline-3'
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
  component: PipelinesDropdown,
  title: 'Containers/Dropdowns/PipelinesDropdown'
};

export const Base = () => <PipelinesDropdown {...props} />;
Base.decorators = [
  storyFn => {
    const store = mockStore({
      pipelines: {
        byId: pipelinesById,
        byNamespace: pipelinesByNamespace,
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

export const Empty = () => <PipelinesDropdown {...props} />;
Empty.decorators = [
  storyFn => {
    const store = mockStore({
      pipelines: {
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
