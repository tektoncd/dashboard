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
import { render } from '../../utils/test';

import ClusterTasksDropdown from './ClusterTasksDropdown';
import * as API from '../../api/clusterTasks';

const props = {
  id: 'clustertasks-dropdown',
  onChange: () => {}
};

const clusterTasks = [
  {
    metadata: {
      name: 'clustertask-1'
    }
  },
  {
    metadata: {
      name: 'clustertask-2'
    }
  },
  {
    metadata: {
      name: 'clustertask-3'
    }
  }
];

const initialTextRegExp = /select clustertask/i;

const checkDropdownItems = ({
  queryByText,
  getAllByText,
  testDict,
  itemPrefixRegExp = /clustertask-/i
}) => {
  testDict.forEach(item => {
    expect(queryByText(new RegExp(item.metadata.name, 'i'))).toBeTruthy();
  });
  getAllByText(itemPrefixRegExp).forEach(node => {
    expect(
      testDict.some(item => item.metadata.name === getNodeText(node))
    ).toBeTruthy();
  });
};

describe('ClusterTasksDropdown', () => {
  it('renders items', () => {
    vi.spyOn(API, 'useClusterTasks').mockImplementation(() => ({
      data: clusterTasks
    }));
    const { getByPlaceholderText, getAllByText, queryByText } = render(
      <ClusterTasksDropdown {...props} />
    );
    // View items
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: clusterTasks
    });
  });

  it('renders controlled selection', () => {
    vi.spyOn(API, 'useClusterTasks').mockImplementation(() => ({
      data: clusterTasks
    }));
    // Select item 'clustertask-1'
    const { queryByDisplayValue, queryByPlaceholderText, rerender } = render(
      <ClusterTasksDropdown
        {...props}
        selectedItem={{ text: 'clustertask-1' }}
      />
    );
    expect(queryByDisplayValue(/clustertask-1/i)).toBeTruthy();
    // Select item 'clustertask-2'
    render(
      <ClusterTasksDropdown
        {...props}
        selectedItem={{ text: 'clustertask-2' }}
      />,
      { rerender }
    );
    expect(queryByDisplayValue(/clustertask-2/i)).toBeTruthy();
    // No selected item (select item '')
    render(<ClusterTasksDropdown {...props} selectedItem="" />, { rerender });
    expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
  });

  it('renders empty', () => {
    vi.spyOn(API, 'useClusterTasks').mockImplementation(() => ({ data: [] }));

    const { queryByPlaceholderText } = render(
      <ClusterTasksDropdown {...props} />
    );
    expect(queryByPlaceholderText(/no clustertasks found/i)).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('renders loading state', () => {
    vi.spyOn(API, 'useClusterTasks').mockImplementation(() => ({
      isFetching: true
    }));
    const { queryByPlaceholderText } = render(
      <ClusterTasksDropdown {...props} />
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('handles onChange event', () => {
    vi.spyOn(API, 'useClusterTasks').mockImplementation(() => ({
      data: clusterTasks
    }));
    const onChange = vi.fn();
    const { getByPlaceholderText, getByText } = render(
      <ClusterTasksDropdown {...props} onChange={onChange} />
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    fireEvent.click(getByText(/clustertask-1/i));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
