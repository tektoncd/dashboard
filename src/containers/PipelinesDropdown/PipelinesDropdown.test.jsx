/*
Copyright 2019-2024 The Tekton Authors
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

const initialTextRegExp = /select pipeline/i;

const checkDropdownItems = ({
  queryByText,
  getAllByText,
  testDict,
  itemPrefixRegExp = /pipeline-/i
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

describe('PipelinesDropdown', () => {
  it('renders items', () => {
    vi.spyOn(API, 'usePipelines').mockImplementation(() => ({
      data: pipelines
    }));
    const { getByPlaceholderText, getAllByText, queryByText } = render(
      <PipelinesDropdown {...props} />
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    checkDropdownItems({
      getAllByText,
      queryByText,
      testDict: pipelines
    });
  });

  it('renders controlled selection', () => {
    vi.spyOn(API, 'usePipelines').mockImplementation(() => ({
      data: pipelines
    }));
    // Select item 'pipeline-1'
    const { queryByDisplayValue, queryByPlaceholderText, rerender } = render(
      <PipelinesDropdown {...props} selectedItem={{ text: 'pipeline-1' }} />
    );
    expect(queryByDisplayValue(/pipeline-1/i)).toBeTruthy();
    // Select item 'pipeline-2'
    render(
      <PipelinesDropdown {...props} selectedItem={{ text: 'pipeline-2' }} />,
      { rerender }
    );
    expect(queryByDisplayValue(/pipeline-2/i)).toBeTruthy();
    // No selected item (select item '')
    render(<PipelinesDropdown {...props} selectedItem="" />, { rerender });
    expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
  });

  it('renders empty', () => {
    vi.spyOn(API, 'usePipelines').mockImplementation(() => ({ data: [] }));
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: 'blue'
    }));
    const { queryByPlaceholderText } = render(<PipelinesDropdown {...props} />);
    expect(
      queryByPlaceholderText(/no pipelines found in the 'blue' namespace/i)
    ).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('for all namespaces renders empty', () => {
    vi.spyOn(API, 'usePipelines').mockImplementation(() => ({ data: [] }));
    const { queryByPlaceholderText } = render(
      <PipelinesDropdown {...props} namespace={ALL_NAMESPACES} />
    );
    expect(queryByPlaceholderText(/no pipelines found/i)).toBeTruthy();
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('renders loading state', () => {
    vi.spyOn(API, 'usePipelines').mockImplementation(() => ({
      isFetching: true
    }));
    const { queryByPlaceholderText } = render(<PipelinesDropdown {...props} />);
    expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
  });

  it('handles onChange event', () => {
    vi.spyOn(API, 'usePipelines').mockImplementation(() => ({
      data: pipelines
    }));
    const onChange = vi.fn();
    const { getByPlaceholderText, getByText } = render(
      <PipelinesDropdown {...props} onChange={onChange} />
    );
    fireEvent.click(getByPlaceholderText(initialTextRegExp));
    fireEvent.click(getByText(/pipeline-1/i));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
