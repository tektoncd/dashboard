/*
Copyright 2019 The Tekton Authors
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
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { boolean, text } from '@storybook/addon-knobs';
import Add from '@carbon/icons-react/lib/add/16';
import Delete from '@carbon/icons-react/lib/delete/16';
import Rerun from '@carbon/icons-react/lib/restart/16';
import RerunAll from '@carbon/icons-react/lib/renew/16';

import Table from './Table';

storiesOf('Table', module)
  .add('simple table with title no rows, no buttons, no checkboxes', () => {
    const headers = [
      { key: 'name', header: text('header1', 'Name') },
      { key: 'namespace', header: text('header2', 'Namespace') },
      { key: 'date', header: text('header3', 'Date Modified') }
    ];

    return (
      <Table
        title={text('title', 'Resource Name')}
        rows={[]}
        headers={headers}
        selectedNamespace={text('selectedNamespace', '*')}
        loading={boolean('loading', false)}
        emptyTextAllNamespaces={text(
          'emptyTextAllNamespaces',
          'No rows in any namespace'
        )}
        emptyTextSelectedNamespace={text(
          'emptyTextSelectedNamespace',
          'No rows in selected namespace'
        )}
      />
    );
  })
  .add('table with one row, 1 toolbar button, no checkboxes', () => {
    const rows = [
      {
        id: 'namespace1:resource-one',
        name: text('Name', 'resource-one'),
        namespace: text('Namespace', 'namespace1'),
        date: text('Date', '100 years ago')
      }
    ];

    return (
      <Table
        title={text('title', 'Resource Name')}
        rows={rows}
        headers={[
          { key: 'name', header: 'Name' },
          { key: 'namespace', header: 'Namespace' },
          { key: 'date', header: 'Date Modified' }
        ]}
        selectedNamespace="*"
        loading={boolean('loading', false)}
        toolbarButtons={[
          { onClick: action('handleNew'), text: 'Add', icon: Add }
        ]}
        emptyTextAllNamespaces="No rows in any namespace"
        emptyTextSelectedNamespace="No rows in selected namespace"
      />
    );
  })
  .add('table with one row, 1 batchAction button and checkboxes', () => {
    const rows = [
      {
        id: 'namespace1:resource-one',
        name: text('Name', 'resource-one'),
        namespace: text('Namespace', 'namespace1'),
        date: text('Date', '100 years ago')
      }
    ];

    return (
      <Table
        title={text('title', 'Resource Name')}
        rows={rows}
        headers={[
          { key: 'name', header: 'Name' },
          { key: 'namespace', header: 'Namespace' },
          { key: 'date', header: 'Date Modified' }
        ]}
        selectedNamespace="*"
        loading={boolean('loading', false)}
        batchActionButtons={[
          { onClick: action('handleDelete'), text: 'Delete', icon: Delete }
        ]}
      />
    );
  })
  .add(
    'table with one sortable row, 2 batchAction and 2 toolbar buttons checkboxes',
    () => {
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
          title={text('title', 'Resource Name')}
          rows={rows}
          headers={[
            { key: 'name', header: 'Name' },
            { key: 'namespace', header: 'Namespace' },
            { key: 'date', header: 'Date Modified' }
          ]}
          selectedNamespace="*"
          isSortable={boolean('isSortable', true)}
          batchActionButtons={[
            { onClick: action('handleDelete'), text: 'Delete', icon: Delete },
            { onClick: action('handleRerun'), text: 'Rerun', icon: Rerun }
          ]}
          toolbarButtons={[
            { onClick: action('handleNew'), text: 'Add', icon: Add },
            {
              onClick: action('handleRerunAll'),
              text: 'RerunAll',
              icon: RerunAll
            }
          ]}
          loading={false}
          emptyTextAllNamespaces="No rows in any namespace"
          emptyTextSelectedNamespace="No rows in selected namespace"
        />
      );
    }
  );

/*
  HOW TO USE:
  - Required Props:
      - headers: Array containing each column (in form of object)
        appearing in data table.
        Example:
          [
            { key: 'name', header: 'Name' },
            { key: 'namespace', header: 'Namespace' },
            { key: 'date', header: 'Date Modified' }
          ]

      - rows: Array containing each row (in form of object)
        appearing in data table.
        *all keys in dataHeaders must be specified in each row object*
          Example:
            [
              {
                **id: 'namespace1:resource-one',
                name: 'resource-one',
                namespace: 'namespace1',
                date: '16 minutes ago'
              }
            ]
          ** Must be specified for React to know which rows have changed,
            are added, or are removed. **

      - selectedNamespace: String Retrieved from Redux store and passed as prop.
        Used when no rows are available and allows us to tell the user in which
        namespace.

     - emptyTextAllNamespaces: String used to denote user that there are no rows
     in any namespace.

     - emptyTextAllNamespaces: String used to denote user that there are no rows
      in selected namespace.

    Optional Props:

      - loading: Boolean Retrieved from Redux store and passed as prop from the container.

      - sortable: Boolean enables sorted by a specific column.

      - title: if String is supplied, a Title element will render with table.

      - batchActionButtons: Array containing buttons with the purpose of manipulating one,
          a few or all rows in table. If no elements are prersent in the array, the
          checkboxes will not appear.
        Example:
          [
            {
              **onClick: ()=>{},
              text: Delete,
              *icon: CarbonDesingIcon
            },
            {
              **onClick: ()=>{},
              text: Rerun,
              *icon: null
            }
          ]
        ** Must take 2 arguments, selectedRows (Array) and cancel batch action (function) to unselect rows once deletion is
        finished. It is recommended to save batchAction as state for future use. When called the table will revert to its default view**

      - toolbarButtons: Array containing buttonss with the purpose of adding to the table or manipulating all rows.
        Example:
          [
            {
              **onClick: ()=>{},
              text: Add,
              *icon: CarbonDesingIcon
            },
            {
              **onClick: ()=>{},
              text: DeleteAll,
              *icon: null
            },
            {
              **onClick: ()=>{},
              text: Rerun All,
              *icon: CarbonDesingIcon
            }
          ]
        ** Does not take arguments since all rows are either affected or not at all. **

  */
