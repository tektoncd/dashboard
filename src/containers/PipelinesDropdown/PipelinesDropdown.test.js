/*
Copyright 2019-2021 The Tekton Authors
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

import PipelinesDropdown from './PipelinesDropdown';
import * as API from '../../api/pipelines';
import * as APIUtils from '../../api/utils';

const props = {
  id: 'pipelines-dropdown',
  onChange: () => {}
};

const pipelines = [
  {
    metadata: {
      name: 'pipeline-1',
      namespace: 'blue',
      uid: 'id-pipeline-1'
    }
  },
  {
    metadata: {
      name: 'pipeline-2',
      namespace: 'blue',
      uid: 'id-pipeline-2'
    }
  },
  {
    metadata: {
      name: 'pipeline-3',
      namespace: 'green',
      uid: 'id-pipeline-3'
    }
  }
];

const initialTextRegExp = new RegExp('select pipeline', 'i');

const checkDropdownItems = ({
  queryByText,
  getAllByText,
  testDict,
  itemPrefixRegExp = new RegExp('pipeline-', 'i')
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

describe('PipelinesDropdown', () => {
  it('renders items', () => {
    jest
      .spyOn(API, 'usePipelines')
      .mockImplementation(() => ({ data: pipelines }));
    const store = mockStore({
      notifications: {}
    });
    const { getByPlaceholderText, getAllByText, queryByText } = render(
      <Provider store={store}>
        <PipelinesDropdown {...props} />
      </Provider>
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: pipelines
    });
  });

  it('renders controlled selection', () => {
    jest
      .spyOn(API, 'usePipelines')
      .mockImplementation(() => ({ data: pipelines }));
    const store = mockStore({
      notifications: {}
    });
    // Select item 'pipeline-1'
    const { queryByDisplayValue, queryByPlaceholderText, rerender } = render(
      <Provider store={store}>
        <PipelinesDropdown {...props} selectedItem={{ text: 'pipeline-1' }} />
      </Provider>
    );
    expect(queryByDisplayValue(/pipeline-1/i)).toBeTruthy();
    // Select item 'pipeline-2'
    render(
      <Provider store={store}>
        <PipelinesDropdown {...props} selectedItem={{ text: 'pipeline-2' }} />
      </Provider>,
      { rerender }
    );
    expect(queryByDisplayValue(/pipeline-2/i)).toBeTruthy();
    // No selected item (select item '')
    render(
      <Provider store={store}>
        <PipelinesDropdown {...props} selectedItem="" />
      </Provider>,
      { rerender }
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
  });

  it('renders empty', () => {
    jest.spyOn(API, 'usePipelines').mockImplementation(() => ({ data: [] }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'blue' }));
    const store = mockStore({
      notifications: {}
    });
    const { queryByPlaceholderText } = render(
      <Provider store={store}>
        <PipelinesDropdown {...props} />
      </Provider>
    );
    expect(
      queryByPlaceholderText(/no pipelines found in the 'blue' namespace/i)
    ).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('for all namespaces renders empty', () => {
    jest.spyOn(API, 'usePipelines').mockImplementation(() => ({ data: [] }));
    const store = mockStore({
      notifications: {}
    });
    const { queryByPlaceholderText } = render(
      <Provider store={store}>
        <PipelinesDropdown {...props} namespace={ALL_NAMESPACES} />
      </Provider>
    );
    expect(queryByPlaceholderText(/no pipelines found/i)).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('renders loading state', () => {
    jest
      .spyOn(API, 'usePipelines')
      .mockImplementation(() => ({ isFetching: true }));
    const store = mockStore({
      notifications: {}
    });
    const { queryByPlaceholderText } = render(
      <Provider store={store}>
        <PipelinesDropdown {...props} />
      </Provider>
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('handles onChange event', () => {
    jest
      .spyOn(API, 'usePipelines')
      .mockImplementation(() => ({ data: pipelines }));
    const store = mockStore({
      notifications: {}
    });
    const onChange = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <PipelinesDropdown {...props} onChange={onChange} />
      </Provider>
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    fireEvent.click(getByText(/pipeline-1/i));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
