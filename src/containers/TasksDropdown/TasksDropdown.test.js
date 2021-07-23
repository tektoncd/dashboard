/*
Copyright 2020-2021 The Tekton Authors
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
import { render } from '../../utils/test';

import TasksDropdown from './TasksDropdown';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';
import * as TasksAPI from '../../api/tasks';

const props = {
  id: 'tasks-dropdown',
  onChange: () => {}
};

const tasks = [
  {
    metadata: {
      name: 'task-1',
      namespace: 'blue',
      uid: 'id-task-1'
    }
  },
  {
    metadata: {
      name: 'task-2',
      namespace: 'blue',
      uid: 'id-task-2'
    }
  },
  {
    metadata: {
      name: 'task-3',
      namespace: 'green',
      uid: 'id-task-3'
    }
  }
];

const initialTextRegExp = new RegExp('select task', 'i');

const checkDropdownItems = ({
  queryByText,
  getAllByText,
  testDict,
  itemPrefixRegExp = new RegExp('task-', 'i')
}) => {
  testDict.forEach(item => {
    expect(queryByText(new RegExp(item.metadata.name, 'i'))).toBeTruthy();
  });
  getAllByText(itemPrefixRegExp).forEach(node => {
    expect(
      testDict.some(item => getNodeText(node) === item.metadata.name)
    ).toBeTruthy();
  });
};

const middleware = [thunk];
const mockStore = configureStore(middleware);

describe('TasksDropdown', () => {
  beforeEach(() => {
    jest
      .spyOn(API, 'useNamespaces')
      .mockImplementation(() => ({ data: ['blue', 'green'] }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'blue' }));
  });

  it('renders items', () => {
    jest
      .spyOn(TasksAPI, 'useTasks')
      .mockImplementation(() => ({ data: tasks }));
    const store = mockStore({
      notifications: {}
    });
    const { getByPlaceholderText, getAllByText, queryByText } = render(
      <Provider store={store}>
        <TasksDropdown {...props} />
      </Provider>
    );
    // View items
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: tasks
    });
  });

  it('renders controlled selection', () => {
    jest
      .spyOn(TasksAPI, 'useTasks')
      .mockImplementation(() => ({ data: tasks }));
    const store = mockStore({
      notifications: {}
    });
    // Select item 'task-1'
    const { queryByDisplayValue, queryByPlaceholderText, rerender } = render(
      <Provider store={store}>
        <TasksDropdown {...props} selectedItem={{ text: 'task-1' }} />
      </Provider>
    );
    expect(queryByDisplayValue(/task-1/i)).toBeTruthy();
    // Select item 'task-2'
    render(
      <Provider store={store}>
        <TasksDropdown {...props} selectedItem={{ text: 'task-2' }} />
      </Provider>,
      { rerender }
    );
    expect(queryByDisplayValue(/task-2/i)).toBeTruthy();
    // No selected item (select item '')
    render(
      <Provider store={store}>
        <TasksDropdown {...props} selectedItem="" />
      </Provider>,
      { rerender }
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
  });

  it('renders empty', () => {
    jest.spyOn(TasksAPI, 'useTasks').mockImplementation(() => ({ data: [] }));
    const store = mockStore({
      notifications: {}
    });
    const { queryByPlaceholderText } = render(
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
    jest.spyOn(TasksAPI, 'useTasks').mockImplementation(() => ({ data: [] }));
    const store = mockStore({
      notifications: {}
    });
    const { queryByPlaceholderText } = render(
      <Provider store={store}>
        <TasksDropdown {...props} namespace={ALL_NAMESPACES} />
      </Provider>
    );
    expect(queryByPlaceholderText(/no tasks found/i)).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('renders loading state', () => {
    jest
      .spyOn(TasksAPI, 'useTasks')
      .mockImplementation(() => ({ isFetching: true }));
    const store = mockStore({
      notifications: {}
    });
    const { queryByPlaceholderText } = render(
      <Provider store={store}>
        <TasksDropdown {...props} />
      </Provider>
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('handles onChange event', () => {
    jest
      .spyOn(TasksAPI, 'useTasks')
      .mockImplementation(() => ({ data: tasks }));
    const store = mockStore({
      notifications: {}
    });
    const onChange = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <TasksDropdown {...props} onChange={onChange} />
      </Provider>
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    fireEvent.click(getByText(/task-1/i));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
