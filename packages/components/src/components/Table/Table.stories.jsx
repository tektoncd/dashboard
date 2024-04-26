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

import { action } from '@storybook/addon-actions';
import { Dropdown } from 'carbon-components-react';
import {
  Add16 as Add,
  TrashCan32 as Delete,
  Restart16 as Rerun,
  Renew16 as RerunAll
} from '@carbon/icons-react';

import Table from './Table';

export default {
  args: {
    emptyTextAllNamespaces: 'No rows in any namespace',
    emptyTextSelectedNamespace: 'No rows in selected namespace',
    loading: false,
    size: 'md',
    title: 'Resource Name'
  },
  argTypes: {
    size: {
      type: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl']
    }
  },
  component: Table,
  title: 'Table'
};

export const Simple = {
  args: {
    headers: [
      { key: 'name', header: 'Name' },
      { key: 'namespace', header: 'Namespace' },
      { key: 'date', header: 'Date created' }
    ],
    rows: [],
    selectedNamespace: '*'
  },
  parameters: {
    notes: 'simple table with title, no rows, no buttons'
  }
};

export const ToolbarButton = {
  args: {
    ...Simple.args,
    rows: [
      {
        id: 'namespace1:resource-one',
        name: 'resource-one',
        namespace: 'namespace1',
        date: '100 years ago'
      }
    ],
    toolbarButtons: [{ onClick: action('handleNew'), text: 'Add', icon: Add }]
  },

  parameters: {
    notes: 'table with 1 row, 1 toolbar button, no batch actions'
  }
};

export const BatchActions = {
  args: {
    ...Simple.args,
    rows: ToolbarButton.args.rows,
    batchActionButtons: [
      { onClick: action('handleDelete'), text: 'Delete', icon: Delete }
    ]
  },
  parameters: {
    notes: 'table with 1 row, 1 batch action'
  }
};

export const Sorting = {
  args: {
    ...Simple.args,
    batchActionButtons: [
      { onClick: action('handleDelete'), text: 'Delete', icon: Delete },
      { onClick: action('handleRerun'), text: 'Rerun', icon: Rerun }
    ],
    isSortable: true,
    rows: [
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
    ],
    toolbarButtons: [
      {
        icon: RerunAll,
        kind: 'secondary',
        onClick: action('handleRerunAll'),
        text: 'RerunAll'
      },
      {
        icon: Add,
        onClick: action('handleNew'),
        text: 'Add'
      }
    ]
  },
  parameters: {
    notes: 'table with sortable rows, 2 batch actions, and 2 toolbar buttons'
  }
};

export const Filters = {
  args: {
    ...ToolbarButton.args,
    filters: (
      <Dropdown
        id="status-filter"
        initialSelectedItem="All"
        items={['All', 'Succeeded', 'Failed']}
        light
        label="Status"
        titleText="Status:"
        type="inline"
      />
    )
  },
  parameters: {
    notes: 'table with filters'
  }
};
