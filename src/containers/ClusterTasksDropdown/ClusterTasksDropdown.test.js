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
import { renderWithIntl } from '@tektoncd/dashboard-components/src/utils/test';

import ClusterTasksDropdown from './ClusterTasksDropdown';
import * as API from '../../api/clusterTasks';

const props = {
  id: 'clustertasks-dropdown',
  onChange: () => {}
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

const clusterTasksStoreDefault = {
  clusterTasks: {
    byName: clusterTasksByName,
    isFetching: false
  }
};

const clusterTasksStoreFetching = {
  clusterTasks: {
    byName: clusterTasksByName,
    isFetching: true
  }
};

const initialTextRegExp = new RegExp('select clustertask', 'i');

const checkDropdownItems = ({
  queryByText,
  getAllByText,
  testDict,
  itemPrefixRegExp = new RegExp('clustertask-', 'i')
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

describe('ClusterTasksDropdown', () => {
  beforeEach(() => {
    jest
      .spyOn(API, 'getClusterTasks')
      .mockImplementation(() => clusterTasksByName);
  });

  it('renders items based on Redux state', () => {
    const store = mockStore({
      ...clusterTasksStoreDefault,
      notifications: {}
    });
    const { getByPlaceholderText, getAllByText, queryByText } = renderWithIntl(
      <Provider store={store}>
        <ClusterTasksDropdown {...props} />
      </Provider>
    );
    // View items
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: clusterTasksByName
    });
  });

  it('renders controlled selection', () => {
    const store = mockStore({
      ...clusterTasksStoreDefault,
      notifications: {}
    });
    // Select item 'clustertask-1'
    const {
      queryByDisplayValue,
      queryByPlaceholderText,
      rerender
    } = renderWithIntl(
      <Provider store={store}>
        <ClusterTasksDropdown
          {...props}
          selectedItem={{ text: 'clustertask-1' }}
        />
      </Provider>
    );
    expect(queryByDisplayValue(/clustertask-1/i)).toBeTruthy();
    // Select item 'clustertask-2'
    renderWithIntl(
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
    renderWithIntl(
      <Provider store={store}>
        <ClusterTasksDropdown {...props} selectedItem="" />
      </Provider>,
      { rerender }
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
  });

  it('renders empty', () => {
    const store = mockStore({
      clusterTasks: {
        byName: {},
        isFetching: false
      },
      notifications: {}
    });
    const { queryByPlaceholderText } = renderWithIntl(
      <Provider store={store}>
        <ClusterTasksDropdown {...props} />
      </Provider>
    );
    expect(queryByPlaceholderText(/no clustertasks found/i)).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('renders loading skeleton based on Redux state', () => {
    const store = mockStore({
      ...clusterTasksStoreFetching,
      notifications: {}
    });
    const { queryByPlaceholderText } = renderWithIntl(
      <Provider store={store}>
        <ClusterTasksDropdown {...props} />
      </Provider>
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('handles onChange event', () => {
    const store = mockStore({
      ...clusterTasksStoreDefault,
      notifications: {}
    });
    const onChange = jest.fn();
    const { getByPlaceholderText, getByText } = renderWithIntl(
      <Provider store={store}>
        <ClusterTasksDropdown {...props} onChange={onChange} />
      </Provider>
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    fireEvent.click(getByText(/clustertask-1/i));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
