/*
Copyright 2020 The Tekton Authors
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

import ClusterTasksDropdown from './ClusterTasksDropdown';

const props = {
  onChange: action('onChange')
};

const clusterTasksByName = {
  'clustertask-1': {
    metadata: {
      name: 'clustertask-1'
    }
  },
  'clustertask-2': {
    metadata: {
      name: 'clustertask-2'
    }
  },
  'clustertask-3': {
    metadata: {
      name: 'clustertask-3'
    }
  }
};

const middleware = [thunk];
const mockStore = configureStore(middleware);

export default {
  component: ClusterTasksDropdown,
  title: 'Containers/Dropdowns/ClusterTasksDropdown'
};

export const normal = () => <ClusterTasksDropdown {...props} />;
normal.decorators = [
  storyFn => {
    const store = mockStore({
      clusterTasks: {
        byName: clusterTasksByName,
        isFetching: false
      },
      notifications: {}
    });
    return <Provider store={store}>{storyFn()}</Provider>;
  }
];

export const empty = () => <ClusterTasksDropdown {...props} />;
empty.decorators = [
  storyFn => {
    const store = mockStore({
      clusterTasks: {
        byName: {},
        isFetching: false
      },
      notifications: {}
    });
    return <Provider store={store}>{storyFn()}</Provider>;
  }
];
