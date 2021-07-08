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

const initialTextRegExp = new RegExp('select clustertask', 'i');

const checkDropdownItems = ({
  queryByText,
  getAllByText,
  testDict,
  itemPrefixRegExp = new RegExp('clustertask-', 'i')
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

const middleware = [thunk];
const mockStore = configureStore(middleware);

describe('ClusterTasksDropdown', () => {
  it('renders items', () => {
    jest
      .spyOn(API, 'useClusterTasks')
      .mockImplementation(() => ({ data: clusterTasks }));
    const store = mockStore({
      notifications: {}
    });
    const { getByPlaceholderText, getAllByText, queryByText } = render(
      <Provider store={store}>
        <ClusterTasksDropdown {...props} />
      </Provider>
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
    jest
      .spyOn(API, 'useClusterTasks')
      .mockImplementation(() => ({ data: clusterTasks }));
    const store = mockStore({
      notifications: {}
    });
    // Select item 'clustertask-1'
    const { queryByDisplayValue, queryByPlaceholderText, rerender } = render(
      <Provider store={store}>
        <ClusterTasksDropdown
          {...props}
          selectedItem={{ text: 'clustertask-1' }}
        />
      </Provider>
    );
    expect(queryByDisplayValue(/clustertask-1/i)).toBeTruthy();
    // Select item 'clustertask-2'
    render(
      <Provider store={store}>
        <ClusterTasksDropdown
          {...props}
          selectedItem={{ text: 'clustertask-2' }}
        />
      </Provider>,
      { rerender }
    );
    expect(queryByDisplayValue(/clustertask-2/i)).toBeTruthy();
    // No selected item (select item '')
    render(
      <Provider store={store}>
        <ClusterTasksDropdown {...props} selectedItem="" />
      </Provider>,
      { rerender }
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
  });

  it('renders empty', () => {
    jest.spyOn(API, 'useClusterTasks').mockImplementation(() => ({ data: [] }));

    const store = mockStore({
      notifications: {}
    });
    const { queryByPlaceholderText } = render(
      <Provider store={store}>
        <ClusterTasksDropdown {...props} />
      </Provider>
    );
    expect(queryByPlaceholderText(/no clustertasks found/i)).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('renders loading state', () => {
    jest
      .spyOn(API, 'useClusterTasks')
      .mockImplementation(() => ({ isFetching: true }));
    const store = mockStore({
      notifications: {}
    });
    const { queryByPlaceholderText } = render(
      <Provider store={store}>
        <ClusterTasksDropdown {...props} />
      </Provider>
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('handles onChange event', () => {
    jest
      .spyOn(API, 'useClusterTasks')
      .mockImplementation(() => ({ data: clusterTasks }));
    const store = mockStore({
      notifications: {}
    });
    const onChange = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <ClusterTasksDropdown {...props} onChange={onChange} />
      </Provider>
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    fireEvent.click(getByText(/clustertask-1/i));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
