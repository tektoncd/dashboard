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
import { action } from '@storybook/addon-actions';
import { Dropdown } from 'carbon-components-react';
import {
  Add16 as Add,
  TrashCan32 as Delete,
  Restart16 as Rerun,
  Renew16 as RerunAll
} from '@carbon/icons-react';

import Table from './Table';

function getFilters(showFilters) {
  return showFilters ? (
    <Dropdown
      id="status-filter"
      initialSelectedItem="All"
      items={['All', 'Succeeded', 'Failed']}
      light
      label="Status"
      titleText="Status:"
      type="inline"
    />
  ) : null;
}

export default {
  args: {
    loading: false,
    showFilters: false,
    title: 'Resource Name'
  },
  argTypes: {
    size: {
      type: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl']
    }
  },
  component: Table,
  title: 'Components/Table'
};

export const Simple = args => (
  <Table
    emptyTextAllNamespaces="No rows in any namespace"
    emptyTextSelectedNamespace="No rows in selected namespace"
    filters={getFilters(args.showFilters)}
    headers={args.headers}
    loading={args.loading}
    rows={[]}
    selectedNamespace={args.selectedNamespace}
    size={args.size}
    title={args.title}
  />
);
Simple.args = {
  headers: [
    { key: 'name', header: 'Name' },
    { key: 'namespace', header: 'Namespace' },
    { key: 'date', header: 'Date created' }
  ],
  selectedNamespace: '*'
};
Simple.parameters = {
  notes: 'simple table with title, no rows, no buttons'
};

export const ToolbarButton = args => (
  <Table
    emptyTextAllNamespaces="No rows in any namespace"
    emptyTextSelectedNamespace="No rows in selected namespace"
    filters={getFilters(args.showFilters)}
    headers={[
      { key: 'name', header: 'Name' },
      { key: 'namespace', header: 'Namespace' },
      { key: 'date', header: 'Date created' }
    ]}
    loading={args.loading}
    rows={args.rows}
    selectedNamespace="*"
    size={args.size}
    title={args.title}
    toolbarButtons={[{ onClick: action('handleNew'), text: 'Add', icon: Add }]}
  />
);
ToolbarButton.args = {
  rows: [
    {
      id: 'namespace1:resource-one',
      name: 'resource-one',
      namespace: 'namespace1',
      date: '100 years ago'
    }
  ]
};
ToolbarButton.parameters = {
  notes: 'table with 1 row, 1 toolbar button, no batch actions'
};

export const BatchActions = args => (
  <Table
    batchActionButtons={[
      { onClick: action('handleDelete'), text: 'Delete', icon: Delete }
    ]}
    filters={getFilters(args.showFilters)}
    headers={[
      { key: 'name', header: 'Name' },
      { key: 'namespace', header: 'Namespace' },
      { key: 'date', header: 'Created' }
    ]}
    loading={args.loading}
    rows={args.rows}
    selectedNamespace="*"
    size={args.size}
    title={args.title}
  />
);
BatchActions.args = {
  rows: [
    {
      id: 'namespace1:resource-one',
      name: 'resource-one',
      namespace: 'namespace1',
      date: '100 years ago'
    }
  ]
};
BatchActions.parameters = {
  notes: 'table with 1 row, 1 batch action'
};

export const Sorting = args => {
  const rows = [
    {
      id: 'namespace1:resource-one',
      name: 'resource-one',
      namespace: 'namespace1',
      date: '100 years ago'
    },
    {
      id: 'default:resource-two',
      name: 'resource-two',
      namespace: 'default',
      date: '2 weeks ago'
    },
    {
      id: 'tekton:resource-three',
      name: 'resource-three',
      namespace: 'tekton',
      date: '2 minutes ago'
    }
  ];

  return (
    <Table
      batchActionButtons={[
        { onClick: action('handleDelete'), text: 'Delete', icon: Delete },
        { onClick: action('handleRerun'), text: 'Rerun', icon: Rerun }
      ]}
      emptyTextAllNamespaces="No rows in any namespace"
      emptyTextSelectedNamespace="No rows in selected namespace"
      filters={getFilters(args.showFilters)}
      headers={[
        { key: 'name', header: 'Name' },
        { key: 'namespace', header: 'Namespace' },
        { key: 'date', header: 'Date created' }
      ]}
      isSortable={args.isSortable}
      loading={args.loading}
      rows={rows}
      selectedNamespace="*"
      size={args.size}
      title={args.title}
      toolbarButtons={[
        { onClick: action('handleNew'), text: 'Add', icon: Add },
        {
          onClick: action('handleRerunAll'),
          text: 'RerunAll',
          icon: RerunAll
        }
      ]}
    />
  );
};
Sorting.args = {
  isSortable: true
};
Sorting.parameters = {
  notes: 'table with sortable rows, 2 batch actions, and 2 toolbar buttons'
};
