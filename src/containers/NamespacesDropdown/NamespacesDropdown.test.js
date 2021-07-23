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

import { render } from '../../utils/test';
import * as API from '../../api';
import NamespacesDropdown from './NamespacesDropdown';

const props = {
  id: 'namespaces-dropdown',
  onChange: () => {}
};

const namespaces = ['namespace-1', 'namespace-2', 'namespace-3'];

const initialTextRegExp = new RegExp('select namespace', 'i');

it('NamespacesDropdown renders items', () => {
  jest
    .spyOn(API, 'useNamespaces')
    .mockImplementation(() => ({ data: namespaces }));
  const { getAllByText, getByPlaceholderText, queryByText } = render(
    <NamespacesDropdown {...props} />
  );
  fireEvent.click(getByPlaceholderText(initialTextRegExp));
  namespaces.forEach(item => {
    expect(queryByText(new RegExp(item, 'i'))).toBeTruthy();
  });
  getAllByText(/namespace-/i).forEach(node => {
    expect(namespaces.includes(getNodeText(node))).toBeTruthy();
  });
});

it('NamespacesDropdown renders controlled selection', () => {
  jest
    .spyOn(API, 'useNamespaces')
    .mockImplementation(() => ({ data: namespaces }));
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
  jest.spyOn(API, 'useNamespaces').mockImplementation(() => ({ data: [] }));
  const { queryByPlaceholderText } = render(<NamespacesDropdown {...props} />);
  expect(queryByPlaceholderText(/no namespaces found/i)).toBeTruthy();
});

it('NamespacesDropdown renders loading skeleton based on Redux state', () => {
  jest
    .spyOn(API, 'useNamespaces')
    .mockImplementation(() => ({ isFetching: true }));
  const { queryByPlaceholderText } = render(<NamespacesDropdown {...props} />);
  expect(queryByPlaceholderText(initialTextRegExp)).toBeFalsy();
});

it('NamespacesDropdown handles onChange event', () => {
  jest
    .spyOn(API, 'useNamespaces')
    .mockImplementation(() => ({ data: namespaces }));
  const onChange = jest.fn();
  const { getByPlaceholderText, getByText } = render(
    <NamespacesDropdown {...props} onChange={onChange} />
  );
  fireEvent.click(getByPlaceholderText(initialTextRegExp));
  fireEvent.click(getByText(/namespace-1/i));
  expect(onChange).toHaveBeenCalledTimes(1);
});

it('NamespacesDropdown renders tenant namespace in single namespace mode', () => {
  jest.spyOn(API, 'useTenantNamespace').mockImplementation(() => 'fake');
  jest.spyOn(API, 'useNamespaces').mockImplementation(() => ({ data: [] }));
  const { getByPlaceholderText, getByText } = render(
    <NamespacesDropdown {...props} />
  );
  fireEvent.click(getByPlaceholderText(initialTextRegExp));
  expect(getByText(/fake/i)).toBeTruthy();
});
