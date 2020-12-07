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
import { fireEvent, getNodeText } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { renderWithIntl } from '@tektoncd/dashboard-components/src/utils/test';

import TasksDropdown from './TasksDropdown';
import * as API from '../../api/tasks';

const props = {
  id: 'tasks-dropdown',
  onChange: () => {}
};

const tasksByNamespace = {
  blue: {
    'task-1': 'id-task-1',
    'task-2': 'id-task-2'
  },
  green: {
    'task-3': 'id-task-3'
  }
};

const tasksById = {
  'id-task-1': {
    metadata: {
      name: 'task-1',
      namespace: 'blue',
      uid: 'id-task-1'
    }
  },
  'id-task-2': {
    metadata: {
      name: 'task-2',
      namespace: 'blue',
      uid: 'id-task-2'
    }
  },
  'id-task-3': {
    metadata: {
      name: 'task-3',
      namespace: 'green',
      uid: 'id-task-3'
    }
  }
};

const tasksStoreDefault = {
  tasks: {
    byId: tasksById,
    byNamespace: tasksByNamespace,
    isFetching: false
  }
};

const tasksStoreFetching = {
  tasks: {
    byId: tasksById,
    byNamespace: tasksByNamespace,
    isFetching: true
  }
};

const namespacesByName = {
  blue: '',
  green: ''
};

const namespacesStoreBlue = {
  namespaces: {
    byName: namespacesByName,
    selected: 'blue'
  }
};

const namespacesStoreGreen = {
  namespaces: {
    byName: namespacesByName,
    selected: 'green'
  }
};

const initialTextRegExp = new RegExp('select task', 'i');

const checkDropdownItems = ({
  queryByText,
  getAllByText,
  testDict,
  itemPrefixRegExp = new RegExp('task-', 'i')
}) => {
  Object.keys(testDict).forEach(item => {
    expect(queryByText(new RegExp(item, 'i'))).toBeTruthy();
  });
  getAllByText(itemPrefixRegExp).forEach(node => {
    expect(getNodeText(node) in testDict).toBeTruthy();
  });
};

const middleware = [thunk];
const mockStore = configureStore(middleware);

describe('TasksDropdown', () => {
  beforeEach(() => {
    jest.spyOn(API, 'getTasks').mockImplementation(() => tasksById);
  });

  it('renders items based on Redux state', () => {
    const store = mockStore({
      ...tasksStoreDefault,
      ...namespacesStoreBlue,
      notifications: {}
    });
    const { getByPlaceholderText, getAllByText, queryByText } = renderWithIntl(
      <Provider store={store}>
        <TasksDropdown {...props} />
      </Provider>
    );
    // View items
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: tasksByNamespace.blue
    });
  });

  it('renders items based on Redux state when namespace changes', () => {
    const blueStore = mockStore({
      ...tasksStoreDefault,
      ...namespacesStoreBlue,
      notifications: {}
    });
    const {
      getByPlaceholderText,
      getAllByText,
      queryByText,
      rerender
    } = renderWithIntl(
      <Provider store={blueStore}>
        <TasksDropdown {...props} />
      </Provider>
    );
    // View items
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: tasksByNamespace.blue
    });
    fireEvent.click(getByPlaceholderText(initialTextRegExp));

    // Change selected namespace from 'blue' to 'green'
    const greenStore = mockStore({
      ...tasksStoreDefault,
      ...namespacesStoreGreen,
      notifications: {}
    });
    renderWithIntl(
      <Provider store={greenStore}>
        <TasksDropdown {...props} />
      </Provider>,
      { rerender }
    );
    // View items
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: tasksByNamespace.green
    });
  });

  it('renders controlled selection', () => {
    const store = mockStore({
      ...tasksStoreDefault,
      ...namespacesStoreBlue,
      notifications: {}
    });
    // Select item 'task-1'
    const {
      queryByDisplayValue,
      queryByPlaceholderText,
      rerender
    } = renderWithIntl(
      <Provider store={store}>
        <TasksDropdown {...props} selectedItem={{ text: 'task-1' }} />
      </Provider>
    );
    expect(queryByDisplayValue(/task-1/i)).toBeTruthy();
    // Select item 'task-2'
    renderWithIntl(
      <Provider store={store}>
        <TasksDropdown {...props} selectedItem={{ text: 'task-2' }} />
      </Provider>,
      { rerender }
    );
    expect(queryByDisplayValue(/task-2/i)).toBeTruthy();
    // No selected item (select item '')
    renderWithIntl(
      <Provider store={store}>
        <TasksDropdown {...props} selectedItem="" />
      </Provider>,
      { rerender }
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
  });

  it('renders controlled namespace', () => {
    const store = mockStore({
      ...tasksStoreDefault,
      ...namespacesStoreBlue,
      notifications: {}
    });
    // Select namespace 'green'
    const { queryByText, getByPlaceholderText, getAllByText } = renderWithIntl(
      <Provider store={store}>
        <TasksDropdown {...props} namespace="green" />
      </Provider>
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: tasksByNamespace.green
    });
  });

  it('renders empty', () => {
    const store = mockStore({
      tasks: {
        byId: {},
        byNamespace: {},
        isFetching: false
      },
      ...namespacesStoreBlue,
      notifications: {}
    });
    const { queryByPlaceholderText } = renderWithIntl(
      <Provider store={store}>
        <TasksDropdown {...props} />
      </Provider>
    );
    expect(
      queryByPlaceholderText(/no tasks found in the 'blue' namespace/i)
    ).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('for all namespaces renders empty', () => {
    const store = mockStore({
      tasks: {
        byId: {},
        byNamespace: {},
        isFetching: false
      },
      ...namespacesStoreBlue,
      notifications: {}
    });
    const { queryByPlaceholderText } = renderWithIntl(
      <Provider store={store}>
        <TasksDropdown {...props} namespace={ALL_NAMESPACES} />
      </Provider>
    );
    expect(queryByPlaceholderText(/no tasks found/i)).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('renders loading skeleton based on Redux state', () => {
    const store = mockStore({
      ...tasksStoreFetching,
      ...namespacesStoreBlue,
      notifications: {}
    });
    const { queryByPlaceholderText } = renderWithIntl(
      <Provider store={store}>
        <TasksDropdown {...props} />
      </Provider>
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('handles onChange event', () => {
    const store = mockStore({
      ...tasksStoreDefault,
      ...namespacesStoreBlue,
      notifications: {}
    });
    const onChange = jest.fn();
    const { getByPlaceholderText, getByText } = renderWithIntl(
      <Provider store={store}>
        <TasksDropdown {...props} onChange={onChange} />
      </Provider>
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    fireEvent.click(getByText(/task-1/i));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
