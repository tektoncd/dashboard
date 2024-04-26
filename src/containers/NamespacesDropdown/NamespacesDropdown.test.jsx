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

import { render } from '../../utils/test';
import * as API from '../../api';
import NamespacesDropdown from './NamespacesDropdown';

const props = {
  id: 'namespaces-dropdown',
  onChange: () => {}
};

const namespaces = ['namespace-2', 'namespace-1', 'namespace-3'];
const namespaceResources = namespaces.map(namespace => ({
  metadata: { name: namespace }
}));

const initialTextRegExp = /select namespace/i;

it('NamespacesDropdown renders items', () => {
  vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
    data: namespaceResources
  }));
  const { getAllByText, getByPlaceholderText, queryByText } = render(
    <NamespacesDropdown {...props} />
  );
  fireEvent.click(getByPlaceholderText(initialTextRegExp));
  namespaces.forEach(item => {
    expect(queryByText(new RegExp(item, 'i'))).toBeTruthy();
  });
  const sortedNamespaces = [...namespaces].sort();
  getAllByText(/namespace-/i).forEach((node, index) => {
    expect(getNodeText(node)).toBe(sortedNamespaces[index]);
  });
});

it('NamespacesDropdown renders controlled selection', () => {
  vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
    data: namespaceResources
  }));
  // Select item 'namespace-1'
  const { queryByPlaceholderText, queryByDisplayValue, rerender } = render(
    <NamespacesDropdown {...props} selectedItem={{ text: 'namespace-1' }} />
  );
  expect(queryByDisplayValue(/namespace-1/i)).toBeTruthy();
  // Select item 'namespace-2'
  render(
    <NamespacesDropdown {...props} selectedItem={{ text: 'namespace-2' }} />,
    { rerender }
  );
  expect(queryByDisplayValue(/namespace-2/i)).toBeTruthy();
  // No selected item (select item '')
  render(<NamespacesDropdown {...props} selectedItem="" />, { rerender });
  expect(queryByPlaceholderText(initialTextRegExp)).toBeTruthy();
});

it('NamespacesDropdown renders empty', () => {
  vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({ data: [] }));
  const { queryByPlaceholderText } = render(<NamespacesDropdown {...props} />);
  expect(queryByPlaceholderText(/no namespaces found/i)).toBeTruthy();
});

it('NamespacesDropdown renders loading skeleton', () => {
  vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
    isFetching: true
  }));
  const { queryByPlaceholderText } = render(<NamespacesDropdown {...props} />);
  expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
});

it('NamespacesDropdown handles onChange event', () => {
  vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
    data: namespaceResources
  }));
  const onChange = vi.fn();
  const { getByPlaceholderText, getByText } = render(
    <NamespacesDropdown {...props} onChange={onChange} />
  );
  fireEvent.click(getByPlaceholderText(initialTextRegExp));
  fireEvent.click(getByText(/namespace-1/i));
  expect(onChange).toHaveBeenCalledTimes(1);
});

it('NamespacesDropdown renders tenant namespace in tenant namespace mode', () => {
  vi.spyOn(API, 'useTenantNamespaces').mockImplementation(() => ['fake']);
  vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({ data: [] }));
  const { getByPlaceholderText, getByText } = render(
    <NamespacesDropdown {...props} />
  );
  fireEvent.click(getByPlaceholderText(initialTextRegExp));
  expect(getByText(/fake/i)).toBeTruthy();
});
