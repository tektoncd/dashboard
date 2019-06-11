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
import { DataTable, DataTableSkeleton } from 'carbon-components-react';
import Add from '@carbon/icons-react/lib/add--alt/24';
import Close from '@carbon/icons-react/lib/misuse/24';
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
  const { handleDelete, handleNew, loading, secrets } = props;

  const initialHeaders = [
    { key: 'secret', header: 'Secret' },
    { key: 'annotations', header: 'Annotations' },
    { key: 'add', header: <Add /> }
  ];

  const secretsFormatted = secrets.map(secret => {
    let annotations = '';
    Object.keys(secret.annotations).forEach(function annotationSetup(key) {
      annotations += `${key}: ${secret.annotations[key]}\n`;
    });
    return {
      id: secret.uid,
      secret: secret.name,
      annotations,
      add: <Close />
    };
  });

  return loading ? (
    <DataTableSkeleton rowCount={1} columnCount={initialHeaders.length} />
  ) : (
    <DataTable
      rows={secretsFormatted}
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
            {secretsFormatted.length !== 0 ? (
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
                          className="cellText"
                        >
                          {cell.value}
                        </TableCell>
                      ))}
                      <TableCell
                        key={lastCell.id}
                        id={secretName}
                        className="cellIcon"
                        onClick={handleDelete}
                        data-testid="deleteIcon"
                      >
                        {lastCell.value}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow className="row">
                  {headers.splice(0, headers.length - 1).map(header => (
                    <TableCell
                      key={`${header.key}-empty`}
                      id={`${header.key}-empty`}
                      className="cellTextNone"
                    >
                      -
                    </TableCell>
                  ))}
                  <TableCell id="icon-empty" className="cellIconNone">
                    -
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      )}
    />
  );
};

export default SecretsTable;
