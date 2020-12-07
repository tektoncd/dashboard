/*
Copyright 2019-2020 The Tekton Authors
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

import PipelinesDropdown from './PipelinesDropdown';
import * as API from '../../api/pipelines';

const props = {
  id: 'pipelines-dropdown',
  onChange: () => {}
};

const pipelinesByNamespace = {
  blue: {
    'pipeline-1': 'id-pipeline-1',
    'pipeline-2': 'id-pipeline-2'
  },
  green: {
    'pipeline-3': 'id-pipeline-3'
  }
};

const pipelinesById = {
  'id-pipeline-1': {
    metadata: {
      name: 'pipeline-1',
      namespace: 'blue',
      uid: 'id-pipeline-1'
    }
  },
  'id-pipeline-2': {
    metadata: {
      name: 'pipeline-2',
      namespace: 'blue',
      uid: 'id-pipeline-2'
    }
  },
  'id-pipeline-3': {
    metadata: {
      name: 'pipeline-3',
      namespace: 'green',
      uid: 'id-pipeline-3'
    }
  }
};

const pipelinesStoreDefault = {
  pipelines: {
    byId: pipelinesById,
    byNamespace: pipelinesByNamespace,
    isFetching: false
  }
};

const pipelinesStoreFetching = {
  pipelines: {
    byId: pipelinesById,
    byNamespace: pipelinesByNamespace,
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

const initialTextRegExp = new RegExp('select pipeline', 'i');

const checkDropdownItems = ({
  queryByText,
  getAllByText,
  testDict,
  itemPrefixRegExp = new RegExp('pipeline-', 'i')
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

describe('PipelinesDropdown', () => {
  beforeEach(() => {
    jest.spyOn(API, 'getPipelines').mockImplementation(() => pipelinesById);
  });

  it('renders items based on Redux state', () => {
    const store = mockStore({
      ...pipelinesStoreDefault,
      ...namespacesStoreBlue,
      notifications: {}
    });
    const { getByPlaceholderText, getAllByText, queryByText } = renderWithIntl(
      <Provider store={store}>
        <PipelinesDropdown {...props} />
      </Provider>
    );
    // View items
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: pipelinesByNamespace.blue
    });
  });

  it('renders items based on Redux state when namespace changes', () => {
    const blueStore = mockStore({
      ...pipelinesStoreDefault,
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
        <PipelinesDropdown {...props} />
      </Provider>
    );
    // View items
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: pipelinesByNamespace.blue
    });
    fireEvent.click(getByPlaceholderText(initialTextRegExp));

    // Change selected namespace from 'blue' to 'green'
    const greenStore = mockStore({
      ...pipelinesStoreDefault,
      ...namespacesStoreGreen,
      notifications: {}
    });
    renderWithIntl(
      <Provider store={greenStore}>
        <PipelinesDropdown {...props} />
      </Provider>,
      { rerender }
    );
    // View items
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: pipelinesByNamespace.green
    });
  });

  it('renders controlled selection', () => {
    const store = mockStore({
      ...pipelinesStoreDefault,
      ...namespacesStoreBlue,
      notifications: {}
    });
    // Select item 'pipeline-1'
    const {
      queryByDisplayValue,
      queryByPlaceholderText,
      rerender
    } = renderWithIntl(
      <Provider store={store}>
        <PipelinesDropdown {...props} selectedItem={{ text: 'pipeline-1' }} />
      </Provider>
    );
    expect(queryByDisplayValue(/pipeline-1/i)).toBeTruthy();
    // Select item 'pipeline-2'
    renderWithIntl(
      <Provider store={store}>
        <PipelinesDropdown {...props} selectedItem={{ text: 'pipeline-2' }} />
      </Provider>,
      { rerender }
    );
    expect(queryByDisplayValue(/pipeline-2/i)).toBeTruthy();
    // No selected item (select item '')
    renderWithIntl(
      <Provider store={store}>
        <PipelinesDropdown {...props} selectedItem="" />
      </Provider>,
      { rerender }
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
  });

  it('renders controlled namespace', () => {
    const store = mockStore({
      ...pipelinesStoreDefault,
      ...namespacesStoreBlue,
      notifications: {}
    });
    // Select namespace 'green'
    const { queryByText, getByPlaceholderText, getAllByText } = renderWithIntl(
      <Provider store={store}>
        <PipelinesDropdown {...props} namespace="green" />
      </Provider>
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: pipelinesByNamespace.green
    });
  });

  it('renders empty', () => {
    const store = mockStore({
      pipelines: {
        byId: {},
        byNamespace: {},
        isFetching: false
      },
      ...namespacesStoreBlue,
      notifications: {}
    });
    const { queryByPlaceholderText } = renderWithIntl(
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
    const store = mockStore({
      pipelines: {
        byId: {},
        byNamespace: {},
        isFetching: false
      },
      ...namespacesStoreBlue,
      notifications: {}
    });
    const { queryByPlaceholderText } = renderWithIntl(
      <Provider store={store}>
        <PipelinesDropdown {...props} namespace={ALL_NAMESPACES} />
      </Provider>
    );
    expect(queryByPlaceholderText(/no pipelines found/i)).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('renders loading skeleton based on Redux state', () => {
    const store = mockStore({
      ...pipelinesStoreFetching,
      ...namespacesStoreBlue,
      notifications: {}
    });
    const { queryByPlaceholderText } = renderWithIntl(
      <Provider store={store}>
        <PipelinesDropdown {...props} />
      </Provider>
    );
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('handles onChange event', () => {
    const store = mockStore({
      ...pipelinesStoreDefault,
      ...namespacesStoreBlue,
      notifications: {}
    });
    const onChange = jest.fn();
    const { getByPlaceholderText, getByText } = renderWithIntl(
      <Provider store={store}>
        <PipelinesDropdown {...props} onChange={onChange} />
      </Provider>
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    fireEvent.click(getByText(/pipeline-1/i));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
