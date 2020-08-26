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

import TasksDropdown from './TasksDropdown';

const props = {
  onChange: action('onChange')
};

const tasksByNamespace = {
  default: {
    'task-1': 'id-task-1',
    'task-2': 'id-task-2',
    'task-3': 'id-task-3'
  }
};

const tasksById = {
  'id-task-1': {
    metadata: {
      name: 'task-1',
      namespace: 'default',
      uid: 'id-task-1'
    }
  },
  'id-task-2': {
    metadata: {
      name: 'task-2',
      namespace: 'default',
      uid: 'id-task-2'
    }
  },
  'id-task-3': {
    metadata: {
      name: 'task-3',
      namespace: 'default',
      uid: 'id-task-3'
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
  component: TasksDropdown,
  title: 'Containers/Dropdowns/TasksDropdown'
};

export const Base = () => <TasksDropdown {...props} />;
Base.decorators = [
  storyFn => {
    const store = mockStore({
      tasks: {
        byId: tasksById,
        byNamespace: tasksByNamespace,
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

export const Empty = () => <TasksDropdown {...props} />;
Empty.decorators = [
  storyFn => {
    const store = mockStore({
      tasks: {
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
