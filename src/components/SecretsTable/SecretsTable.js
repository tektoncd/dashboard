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
import { DataTable } from 'carbon-components-react';
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

function getClassNameCell(rows, cells, current, loading) {
  if ((rows === 0 || loading) && cells === current + 1) return 'cellIconNone';
  if (cells === current + 1) return 'cellIcon';
  if (rows === 0 || loading) return 'cellTextNone';
  return 'cellText';
}

const SecretsTable = props => {
  const {
    initialRows,
    initialHeaders,
    handleNew,
    handleDelete,
    loading,
    secretsLength
  } = props;

  return (
    <DataTable
      rows={initialRows}
      headers={initialHeaders}
      isSortable
      useZebraStyles
      render={({ rows, headers, getHeaderProps }) => (
        <TableContainer>
          <Table className="secrets">
            <TableHead className="header">
              <TableRow>
                {headers.map((header, i) => {
                  const headerCell =
                    headers.length !== i + 1 ? (
                      <TableHeader
                        {...getHeaderProps({ header })}
                        className="cellText"
                      >
                        {header.header}
                      </TableHeader>
                    ) : (
                      <TableHeader
                        key="add"
                        data-testid="addIcon"
                        className="cellIcon"
                        {...getHeaderProps({
                          header,
                          onClick: handleNew
                        })}
                      >
                        {header.header}
                      </TableHeader>
                    );

                  return headerCell;
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id} className="row">
                  {row.cells.map((cell, i) => (
                    <TableCell
                      key={cell.id}
                      id={
                        row.cells.length === i + 1 && !loading
                          ? row.cells[0].value
                          : null
                      }
                      className={getClassNameCell(
                        secretsLength,
                        row.cells.length,
                        i,
                        loading
                      )}
                      onClick={
                        row.cells.length === i + 1 &&
                        !loading &&
                        secretsLength !== 0
                          ? handleDelete
                          : null
                      }
                      data-testid={
                        row.cells.length === i + 1 &&
                        !loading &&
                        secretsLength !== 0
                          ? 'deleteIcon'
                          : null
                      }
                    >
                      {cell.value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    />
  );
};

export default SecretsTable;
