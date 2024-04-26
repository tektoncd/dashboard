/*
Copyright 2020-2024 The Tekton Authors
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

import { fireEvent, getNodeText } from '@testing-library/react';
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

const initialTextRegExp = /select task/i;

const checkDropdownItems = ({
  queryByText,
  getAllByText,
  testDict,
  itemPrefixRegExp = /task-/i
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

describe('TasksDropdown', () => {
  beforeEach(() => {
    vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [{ metadata: { name: 'blue' } }, { metadata: { name: 'green' } }]
    }));
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: 'blue'
    }));
  });

  it('renders items', () => {
    vi.spyOn(TasksAPI, 'useTasks').mockImplementation(() => ({ data: tasks }));
    const { getByPlaceholderText, getAllByText, queryByText } = render(
      <TasksDropdown {...props} />
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
    vi.spyOn(TasksAPI, 'useTasks').mockImplementation(() => ({ data: tasks }));
    // Select item 'task-1'
    const { queryByDisplayValue, queryByPlaceholderText, rerender } = render(
      <TasksDropdown {...props} selectedItem={{ text: 'task-1' }} />
    );
    expect(queryByDisplayValue(/task-1/i)).toBeTruthy();
    // Select item 'task-2'
    render(<TasksDropdown {...props} selectedItem={{ text: 'task-2' }} />, {
      rerender
    });
    expect(queryByDisplayValue(/task-2/i)).toBeTruthy();
    // No selected item (select item '')
    render(<TasksDropdown {...props} selectedItem="" />, { rerender });
    expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
  });

  it('renders empty', () => {
    vi.spyOn(TasksAPI, 'useTasks').mockImplementation(() => ({ data: [] }));
    const { queryByPlaceholderText } = render(<TasksDropdown {...props} />);
    expect(
      queryByPlaceholderText(/no tasks found in the 'blue' namespace/i)
    ).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('for all namespaces renders empty', () => {
    vi.spyOn(TasksAPI, 'useTasks').mockImplementation(() => ({ data: [] }));
    const { queryByPlaceholderText } = render(
      <TasksDropdown {...props} namespace={ALL_NAMESPACES} />
    );
    expect(queryByPlaceholderText(/no tasks found/i)).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('renders loading state', () => {
    vi.spyOn(TasksAPI, 'useTasks').mockImplementation(() => ({
      isFetching: true
    }));
    const { queryByPlaceholderText } = render(<TasksDropdown {...props} />);
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('handles onChange event', () => {
    vi.spyOn(TasksAPI, 'useTasks').mockImplementation(() => ({ data: tasks }));
    const onChange = vi.fn();
    const { getByPlaceholderText, getByText } = render(
      <TasksDropdown {...props} onChange={onChange} />
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    fireEvent.click(getByText(/task-1/i));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
