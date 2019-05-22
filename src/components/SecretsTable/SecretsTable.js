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

const SecretsTable = props => {
  const { initialRows, initialHeaders, handleNew } = props;

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
                        key={header.key}
                      >
                        {header.header}
                      </TableHeader>
                    ) : (
                      <TableHeader
                        key={header.key}
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
              {rows.map((row, index) => {
                const lastCell =
                  rows[index].cells[rows[index].cells.length - 1];
                const secretName = row.cells[0].value;
                return (
                  <TableRow key={row.id} className="row">
                    {row.cells.splice(0, row.cells.length - 1).map(cell => (
                      <TableCell
                        key={cell.id}
                        id={cell.id}
                        className={initialRows[index].classText}
                      >
                        {cell.value}
                      </TableCell>
                    ))}
                    <TableCell
                      key={lastCell.id}
                      id={secretName}
                      className={initialRows[index].classIcon}
                      onClick={initialRows[index].handler}
                      data-testid={initialRows[index].testId}
                    >
                      {lastCell.value}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    />
  );
};

export default SecretsTable;
