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
import {
  Button,
  DataTable,
  DataTableSkeleton,
  TableBatchAction,
  TableBatchActions,
  TableSelectAll,
  TableSelectRow,
  TableToolbar,
  TableToolbarContent
} from 'carbon-components-react';
import Add from '@carbon/icons-react/lib/add/16';
import Delete from '@carbon/icons-react/lib/delete/16';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import './Secrets.scss';

const {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader
} = DataTable;

const SecretsTable = props => {
  const {
    handleDelete,
    handleNew,
    loading,
    secrets,
    selectedNamespace
  } = props;

  const initialHeaders = [
    { key: 'secret', header: 'Secret' },
    { key: 'annotations', header: 'Annotations' }
  ];

  if (selectedNamespace === ALL_NAMESPACES) {
    initialHeaders.splice(1, 0, { key: 'namespace', header: 'Namespace' });
  }

  const secretsFormatted = secrets.map(secret => {
    let annotations = '';
    Object.keys(secret.annotations).forEach(function annotationSetup(key) {
      annotations += `${key}: ${secret.annotations[key]}\n`;
    });
    const formattedSecret = {
      id: `${secret.namespace}:${secret.name}`,
      secret: secret.name,
      annotations
    };

    if (selectedNamespace === ALL_NAMESPACES) {
      formattedSecret.namespace = secret.namespace;
    }

    return formattedSecret;
  });

  return (
    <div className="secrets">
      <DataTable
        useZebraStyles
        rows={secretsFormatted}
        headers={initialHeaders}
        isSortable
        render={({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getSelectionProps,
          getBatchActionProps,
          selectedRows
        }) => (
          <TableContainer title="Secrets">
            <TableToolbar>
              <TableBatchActions {...getBatchActionProps()}>
                <TableBatchAction
                  id="delete-btn"
                  data-testid="deleteButton"
                  renderIcon={Delete}
                  onClick={() => {
                    handleDelete(
                      selectedRows.map(secret => ({
                        namespace: secret.id.split(':')[0],
                        name: secret.id.split(':')[1]
                      }))
                    );
                    getBatchActionProps().onCancel();
                  }}
                >
                  Delete
                </TableBatchAction>
              </TableBatchActions>
              <TableToolbarContent>
                <Button
                  disabled={loading}
                  id="add-btn"
                  data-testid="addButton"
                  onClick={handleNew}
                  renderIcon={Add}
                >
                  Add Secret
                </Button>
              </TableToolbarContent>
            </TableToolbar>
            {loading ? (
              <DataTableSkeleton
                rowCount={1}
                columnCount={initialHeaders.length}
              />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableSelectAll {...getSelectionProps()} />
                    {headers.map(header => {
                      return (
                        <TableHeader
                          {...getHeaderProps({ header })}
                          className="cellText"
                          key={header.key}
                        >
                          {header.header}
                        </TableHeader>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(row => {
                    return (
                      <TableRow
                        {...getRowProps({ row })}
                        key={row.id}
                        className="row"
                      >
                        <TableSelectRow {...getSelectionProps({ row })} />
                        {row.cells.map(cell => (
                          <TableCell
                            key={cell.id}
                            id={cell.id}
                            className="cellText"
                          >
                            {cell.value}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        )}
      />
      {secrets.length === 0 && selectedNamespace === ALL_NAMESPACES && (
        <div className="noSecrets">
          <p>
            {
              "No secrets created under any namespace, click 'Add Secret' button to add a new one."
            }
          </p>
        </div>
      )}
      {secrets.length === 0 && selectedNamespace !== ALL_NAMESPACES && (
        <div className="noSecrets">
          <p>
            {`No secrets created under namespace '${selectedNamespace}', click 'Add Secret' button to
            add a new one.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default SecretsTable;
