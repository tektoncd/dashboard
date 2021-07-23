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
import PipelineResourcesDropdown from './PipelineResourcesDropdown';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';
import * as PipelineResourcesAPI from '../../api/pipelineResources';

const props = {
  id: 'pipeline-resources-dropdown',
  onChange: () => {}
};

const pipelineResourcesByNamespace = {
  blue: {
    'pipeline-resource-1': 'id-pipeline-resource-1',
    'pipeline-resource-2': 'id-pipeline-resource-2'
  },
  green: {
    'pipeline-resource-3': 'id-pipeline-resource-3'
  }
};

const pipelineResource1 = {
  metadata: {
    name: 'pipeline-resource-1',
    namespace: 'blue',
    uid: 'id-pipeline-resource-1'
  },
  spec: { type: 'type-1' }
};

const pipelineResource2 = {
  metadata: {
    name: 'pipeline-resource-2',
    namespace: 'blue',
    uid: 'id-pipeline-resource-2'
  },
  spec: { type: 'type-2' }
};

const pipelineResource3 = {
  metadata: {
    name: 'pipeline-resource-3',
    namespace: 'green',
    uid: 'id-pipeline-resource-3'
  },
  spec: { type: 'type-1' }
};

const initialTextRegExp = new RegExp('select pipelineresource', 'i');

const checkDropdownItems = ({
  queryByText,
  getAllByText,
  testDict,
  itemPrefixRegExp = new RegExp('pipeline-resource-', 'i')
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

describe('PipelineResourcesDropdown', () => {
  beforeEach(() => {
    jest
      .spyOn(API, 'useNamespaces')
      .mockImplementation(() => ({ data: ['blue', 'green'] }));
  });

  it('renders items', () => {
    jest
      .spyOn(PipelineResourcesAPI, 'usePipelineResources')
      .mockImplementation(() => ({
        data: [pipelineResource1, pipelineResource2]
      }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'blue' }));
    const store = mockStore({
      notifications: {}
    });
    const { getByPlaceholderText, getAllByText, queryByText } = render(
      <Provider store={store}>
        <PipelineResourcesDropdown {...props} />
      </Provider>
    );
    // View items
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: pipelineResourcesByNamespace.blue
    });
  });

  it('renders items based on type', () => {
    jest
      .spyOn(PipelineResourcesAPI, 'usePipelineResources')
      .mockImplementation(() => ({
        data: [pipelineResource1, pipelineResource2]
      }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'blue' }));
    const store = mockStore({
      notifications: {}
    });
    const { getByPlaceholderText, queryByText, rerender } = render(
      <Provider store={store}>
        <PipelineResourcesDropdown {...props} type="type-1" />
      </Provider>
    );
    // View items
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    expect(queryByText(/pipeline-resource-1/i)).toBeTruthy();
    expect(queryByText(/pipeline-resource-2/i)).toBeFalsy();
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    render(
      <Provider store={store}>
        <PipelineResourcesDropdown {...props} type="type-2" />
      </Provider>,
      { rerender }
    );
    // View items
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    expect(queryByText(/pipeline-resource-1/i)).toBeFalsy();
    expect(queryByText(/pipeline-resource-2/i)).toBeTruthy();
  });

  it('renders controlled selection', () => {
    jest
      .spyOn(PipelineResourcesAPI, 'usePipelineResources')
      .mockImplementation(() => ({
        data: [pipelineResource1, pipelineResource2]
      }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'blue' }));
    const store = mockStore({
      notifications: {}
    });
    // Select item 'pipeline-resource-1'
    const { queryByPlaceholderText, queryByDisplayValue, rerender } = render(
      <Provider store={store}>
        <PipelineResourcesDropdown
          {...props}
          selectedItem={{ text: 'pipeline-resource-1' }}
        />
      </Provider>
    );
    expect(queryByDisplayValue(/pipeline-resource-1/i)).toBeTruthy();
    // Select item 'pipeline-resource-2'
    render(
      <Provider store={store}>
        <PipelineResourcesDropdown
          {...props}
          selectedItem={{ text: 'pipeline-resource-2' }}
        />
      </Provider>,
      { rerender }
    );
    expect(queryByDisplayValue(/pipeline-resource-2/i)).toBeTruthy();
    // No selected item (select item '')
    render(
      <Provider store={store}>
        <PipelineResourcesDropdown {...props} selectedItem="" />
      </Provider>,
      { rerender }
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
  });

  it('renders controlled namespace', () => {
    jest
      .spyOn(PipelineResourcesAPI, 'usePipelineResources')
      .mockImplementation(() => ({ data: [pipelineResource3] }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'blue' }));
    const store = mockStore({
      notifications: {}
    });
    // Select namespace 'green'
    const { queryByText, getByPlaceholderText, getAllByText } = render(
      <Provider store={store}>
        <PipelineResourcesDropdown {...props} namespace="green" />
      </Provider>
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: pipelineResourcesByNamespace.green
    });
  });

  it('renders empty', () => {
    jest
      .spyOn(PipelineResourcesAPI, 'usePipelineResources')
      .mockImplementation(() => ({ data: [] }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'blue' }));
    const store = mockStore({
      notifications: {}
    });
    const { queryByPlaceholderText } = render(
      <Provider store={store}>
        <PipelineResourcesDropdown {...props} />
      </Provider>
    );
    expect(
      queryByPlaceholderText(
        /no pipelineresources found in the 'blue' namespace/i
      )
    ).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('renders empty all namespaces', () => {
    jest
      .spyOn(PipelineResourcesAPI, 'usePipelineResources')
      .mockImplementation(() => ({ data: [] }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: ALL_NAMESPACES }));
    const store = mockStore({
      notifications: {}
    });
    const { queryByPlaceholderText } = render(
      <Provider store={store}>
        <PipelineResourcesDropdown {...props} />
      </Provider>
    );
    expect(queryByPlaceholderText(/no pipelineresources found/i)).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('renders empty with type', () => {
    jest
      .spyOn(PipelineResourcesAPI, 'usePipelineResources')
      .mockImplementation(() => ({ data: [] }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'blue' }));
    const store = mockStore({
      notifications: {}
    });
    const { queryByPlaceholderText } = render(
      <Provider store={store}>
        <PipelineResourcesDropdown {...props} type="bogus" />
      </Provider>
    );
    expect(
      queryByPlaceholderText(
        /no pipelineresources found of type 'bogus' in the 'blue' namespace/i
      )
    ).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('renders empty with type and all namespaces', () => {
    jest
      .spyOn(PipelineResourcesAPI, 'usePipelineResources')
      .mockImplementation(() => ({ data: [] }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: ALL_NAMESPACES }));
    const store = mockStore({
      notifications: {}
    });
    const { queryByPlaceholderText } = render(
      <Provider store={store}>
        <PipelineResourcesDropdown {...props} type="bogus" />
      </Provider>
    );
    expect(
      queryByPlaceholderText(/no pipelineresources found of type 'bogus'/i)
    ).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('renders loading state', () => {
    jest
      .spyOn(PipelineResourcesAPI, 'usePipelineResources')
      .mockImplementation(() => ({ isFetching: true }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'blue' }));
    const store = mockStore({
      notifications: {}
    });
    const { queryByPlaceholderText } = render(
      <Provider store={store}>
        <PipelineResourcesDropdown {...props} />
      </Provider>
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('handles onChange event', () => {
    jest
      .spyOn(PipelineResourcesAPI, 'usePipelineResources')
      .mockImplementation(() => ({
        data: [pipelineResource1]
      }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'blue' }));
    const store = mockStore({
      notifications: {}
    });
    const onChange = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <PipelineResourcesDropdown {...props} onChange={onChange} />
      </Provider>
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    fireEvent.click(getByText(/pipeline-resource-1/i));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
