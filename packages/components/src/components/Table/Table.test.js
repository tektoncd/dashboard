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
import { fireEvent } from '@testing-library/react';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import { render } from '../../utils/test';
import Table from './Table';

const rows = [
  {
    id: 'namespace1:resource-one',
    name: 'resource-one',
    namespace: 'namespace1',
    date: '16 minutes ago'
  },
  {
    id: 'namespace2:resource-two',
    name: 'resource-two',
    namespace: 'namespace2',
    date: '20 hours ago'
  }
];

const headers = [
  { key: 'name', header: 'Name' },
  { key: 'namespace', header: 'Namespace' },
  { key: 'date', header: 'Date created' }
];

const toolbarButtons = [
  { onClick: () => {}, text: 'Add', icon: null },
  { onClick: () => {}, text: 'Rerun all', icon: null }
];

const batchActionButtons = [
  { onClick: () => {}, text: 'Delete', icon: null },
  { onClick: () => {}, text: 'Rerun', icon: null }
];

const emptyTextAllNamespaces = 'No rows in any namespace';
const emptyTextSelectedNamespace = 'No rows in selected namespace';
const title = 'Resource';

describe('Table', () => {
  it('renders plain with ALL_NAMESPACES no rows', () => {
    const props = {
      loading: false,
      rows: [],
      headers,
      selectedNamespace: ALL_NAMESPACES,
      emptyTextAllNamespaces,
      emptyTextSelectedNamespace
    };
    const { queryByLabelText, queryByText } = render(<Table {...props} />);

    expect(queryByText(title)).toBeFalsy();
    expect(
      queryByText('Name').parentNode.className.includes('sort')
    ).toBeFalsy();
    expect(queryByText('Name')).toBeTruthy();
    expect(queryByText('Namespace')).toBeTruthy();
    expect(queryByText('Date created')).toBeTruthy();
    expect(queryByText(/Delete/i)).toBeFalsy();
    expect(queryByText(/Add/i)).toBeFalsy();
    expect(queryByText(emptyTextAllNamespaces)).toBeTruthy();
    expect(queryByText(emptyTextSelectedNamespace)).toBeNull();
    expect(queryByLabelText('Select all rows')).toBeFalsy();
    expect(queryByLabelText('Select row')).toBeFalsy();
  });

  it('renders title with no rows, selected namespace, 1 filter, 1 batch, and 1 toolbar button, checkboxes and non-sortable', () => {
    const filters = 'FAKE_FILTERS';
    const props = {
      batchActionButtons: batchActionButtons.slice(0, 1),
      emptyTextAllNamespaces,
      emptyTextSelectedNamespace,
      filters,
      headers,
      loading: false,
      rows: [],
      selectedNamespace: 'default',
      title,
      toolbarButtons: toolbarButtons.slice(0, 1)
    };
    const { queryByText, queryByLabelText } = render(<Table {...props} />);

    expect(queryByText('Resource')).toBeTruthy();
    expect(
      queryByText('Name').parentNode.className.includes('sort')
    ).toBeFalsy();
    expect(queryByText(/Delete/i)).toBeFalsy();
    expect(queryByText(/Add/i)).toBeTruthy();
    expect(queryByLabelText('Select all rows')).toBeFalsy();
    expect(queryByLabelText('Select row')).toBeFalsy();
    expect(queryByText(filters)).toBeTruthy();
    expect(queryByText(emptyTextSelectedNamespace)).toBeTruthy();
    expect(queryByText(emptyTextAllNamespaces)).toBeFalsy();
  });

  it('renders plain with one row, ALL_NAMESPACES', () => {
    const props = {
      loading: false,
      rows: rows.slice(0, 1),
      headers,
      selectedNamespace: ALL_NAMESPACES
    };
    const { queryByText, queryByLabelText } = render(<Table {...props} />);

    expect(queryByText(title)).toBeNull();
    expect(
      queryByText('Name').parentNode.className.includes('sort')
    ).toBeFalsy();
    expect(queryByText(/resource-one/i)).toBeTruthy();
    expect(queryByText(/namespace1/i)).toBeTruthy();
    expect(queryByText(/16 minutes ago/i)).toBeTruthy();
    expect(queryByText(/Delete/i)).toBeNull();
    expect(queryByText(/Add/i)).toBeNull();
    expect(queryByLabelText('Select all rows')).toBeNull();
    expect(queryByLabelText('Select row')).toBeNull();
    expect(queryByText(emptyTextSelectedNamespace)).toBeNull();
    expect(queryByText(emptyTextSelectedNamespace)).toBeNull();
  });

  it('renders plain with one row, ALL_NAMESPACES and sortable', () => {
    const props = {
      loading: false,
      rows: rows.slice(0, 1),
      headers,
      selectedNamespace: ALL_NAMESPACES,
      isSortable: true
    };
    const { queryByText } = render(<Table {...props} />);

    expect(
      queryByText('Name').parentNode.className.includes('sort')
    ).toBeTruthy();
  });

  it('renders filters', () => {
    const filters = 'FAKE_FILTERS';
    const props = {
      filters,
      loading: false,
      headers,
      rows: rows.slice(0, 1),
      selectedNamespace: ALL_NAMESPACES
    };
    const { queryByText } = render(<Table {...props} />);

    expect(queryByText(filters)).toBeTruthy();
  });

  it('renders with one row, ALL_NAMESPACES, 1 toolbar button only, no checkboxes and non-sortable', () => {
    const props = {
      loading: false,
      rows: rows.slice(0, 1),
      headers,
      selectedNamespace: ALL_NAMESPACES,
      toolbarButtons: toolbarButtons.slice(0, 1)
    };
    const { queryByText, queryByLabelText } = render(<Table {...props} />);

    expect(
      queryByText('Name').parentNode.className.includes('sort')
    ).toBeFalsy();
    expect(queryByText(/Delete/i)).toBeNull();
    expect(queryByText(/Rerun all/i)).toBeNull();
    expect(queryByText(/Add/i)).toBeTruthy();
    expect(queryByLabelText('Select all rows')).toBeNull();
    expect(queryByLabelText('Select row')).toBeNull();
  });

  it('renders with one row, ALL_NAMESPACES, 2 toolbar buttons only, no checkboxes and non-sortable', () => {
    const props = {
      loading: false,
      rows: rows.slice(0, 1),
      headers,
      selectedNamespace: ALL_NAMESPACES,
      toolbarButtons
    };
    const { queryByText, queryByLabelText } = render(<Table {...props} />);

    expect(
      queryByText('Name').parentNode.className.includes('sort')
    ).toBeFalsy();
    expect(queryByText(/Delete/i)).toBeNull();
    expect(queryByText(/Add/i)).toBeTruthy();
    expect(queryByText(/Rerun all/i)).toBeTruthy();
    expect(queryByLabelText('Select all rows')).toBeNull();
    expect(queryByLabelText('Select row')).toBeNull();
  });

  it('renders with one row, ALL_NAMESPACES, 1 batch button only with checkboxes and non-sortable', () => {
    const props = {
      batchActionButtons: batchActionButtons.slice(0, 1),
      loading: false,
      rows: rows.slice(0, 1),
      headers,
      selectedNamespace: ALL_NAMESPACES
    };
    const { queryByText, queryByLabelText } = render(<Table {...props} />);

    expect(
      queryByText('Name').parentNode.className.includes('sort')
    ).toBeFalsy();
    expect(queryByText(/Delete/i)).toBeTruthy();
    expect(queryByText(/Add/i)).toBeNull();
    expect(queryByText(/Rerun/i)).toBeNull();
    expect(queryByLabelText('Select all rows')).toBeTruthy();
    expect(queryByLabelText('Select row')).toBeTruthy();
  });

  it('renders with one row, ALL_NAMESPACES, 2 batch buttons only with checkboxes and non-sortable', () => {
    const props = {
      batchActionButtons,
      loading: false,
      rows: rows.slice(0, 1),
      headers,
      selectedNamespace: ALL_NAMESPACES
    };
    const { queryByText, queryByLabelText } = render(<Table {...props} />);

    expect(
      queryByText('Name').parentNode.className.includes('sort')
    ).toBeFalsy();
    expect(queryByText(/Delete/i)).toBeTruthy();
    expect(queryByText(/Rerun/i)).toBeTruthy();
    expect(queryByText(/Rerun all/i)).toBeNull();
    expect(queryByText(/Add/i)).toBeNull();
    expect(queryByLabelText('Select all rows')).toBeTruthy();
    expect(queryByLabelText('Select row')).toBeTruthy();
  });

  it('renders with two rows, ALL_NAMESPACES, 2 batch and 2 toolbar buttons, checkboxes and sortable', () => {
    const props = {
      batchActionButtons,
      loading: false,
      rows,
      headers,
      selectedNamespace: ALL_NAMESPACES,
      toolbarButtons,
      isSortable: true
    };
    const { queryAllByLabelText, queryByText, queryByLabelText } = render(
      <Table {...props} />
    );

    expect(
      queryByText('Name').parentNode.className.includes('sort')
    ).toBeTruthy();
    expect(queryByText(/Add/i)).toBeTruthy();
    expect(queryByText(/Delete/i)).toBeTruthy();
    expect(queryByText('Rerun')).toBeTruthy();
    expect(queryByText('Rerun all')).toBeTruthy();
    expect(queryByLabelText('Select all rows')).toBeTruthy();
    expect(queryAllByLabelText('Select row')[0]).toBeTruthy();
  });

  it('loading with no rows, ALL_NAMESPACES, 1 toolbar button, no checkboxes and non-sortable', () => {
    const props = {
      loading: true,
      rows: [],
      headers,
      selectedNamespace: ALL_NAMESPACES,
      toolbarButtons: toolbarButtons.slice(0, 1)
    };
    const { queryByText } = render(<Table {...props} />);

    expect(queryByText(/Add/i).disabled).toBeTruthy();
  });

  it('loading plain with one row and ALL_NAMESPACES', () => {
    const props = {
      loading: true,
      rows: rows.slice(0, 1),
      headers,
      selectedNamespace: ALL_NAMESPACES
    };
    const { queryByText, queryByLabelText } = render(<Table {...props} />);

    expect(queryByText(/Resources/i)).toBeNull();
    expect(queryByText('Name')).toBeTruthy();
    expect(queryByText('Namespace')).toBeTruthy();
    expect(queryByText('Date created')).toBeTruthy();
    expect(queryByText(/Delete/i)).toBeNull();
    expect(queryByText(/Add/i)).toBeNull();
    expect(queryByLabelText('Select all rows')).toBeNull();
    expect(queryByLabelText('Select row')).toBeNull();
  });

  it('batch action button specifies correct arguments for callback with one row selected', () => {
    const handleDelete = jest.fn();

    const props = {
      batchActionButtons: batchActionButtons.slice(0, 1),
      loading: false,
      rows: rows.slice(0, 1),
      headers,
      selectedNamespace: ALL_NAMESPACES
    };
    props.batchActionButtons[0].onClick = handleDelete;
    const { queryByText, queryByLabelText } = render(<Table {...props} />);

    expect(queryByText(/Delete/i)).toBeTruthy();
    expect(queryByText(/Add/i)).toBeNull();

    fireEvent.click(queryByLabelText('Select row'));
    fireEvent.click(queryByText(/Delete/i));

    expect(handleDelete).toHaveBeenCalledTimes(1);

    expect(handleDelete.mock.calls[0][0].map(row => row.id)).toEqual(
      props.rows.map(row => row.id)
    );

    expect(typeof handleDelete.mock.calls[0][1]).toEqual('function');
  });

  it('batch action button specifies correct arguments for callback with two rows selected', () => {
    const handleDelete = jest.fn();

    const props = {
      batchActionButtons: batchActionButtons.slice(0, 1),
      loading: false,
      rows,
      headers,
      selectedNamespace: ALL_NAMESPACES
    };
    props.batchActionButtons[0].onClick = handleDelete;
    const { queryByText, queryByLabelText } = render(<Table {...props} />);

    expect(queryByText(/Delete/i)).toBeTruthy();
    expect(queryByText(/Add/i)).toBeNull();

    fireEvent.click(queryByLabelText('Select all rows'));
    fireEvent.click(queryByText(/Delete/i));

    expect(handleDelete).toHaveBeenCalledTimes(1);

    expect(handleDelete.mock.calls[0][0].map(row => row.id)).toEqual(
      props.rows.map(row => row.id)
    );

    expect(typeof handleDelete.mock.calls[0][1]).toEqual('function');
  });

  it('toolbar button responds correctly', () => {
    const handleAdd = jest.fn();

    const props = {
      loading: false,
      rows,
      headers,
      selectedNamespace: ALL_NAMESPACES,
      toolbarButtons: toolbarButtons.slice(0, 1)
    };
    props.toolbarButtons[0].onClick = handleAdd;
    const { queryByText } = render(<Table {...props} />);

    expect(queryByText(/Delete/i)).toBeNull();
    expect(queryByText(/Add/i)).toBeTruthy();

    fireEvent.click(queryByText(/Add/i));
    fireEvent.click(queryByText(/Add/i));
    fireEvent.click(queryByText(/Add/i));

    expect(handleAdd).toHaveBeenCalledTimes(3);
  });
});
