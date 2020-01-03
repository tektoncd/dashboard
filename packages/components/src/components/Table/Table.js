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
import PropTypes from 'prop-types';
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

import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import './Table.scss';

const {
  TableContainer,
  Table: CarbonTable,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader
} = DataTable;

const Table = props => {
  const {
    batchActionButtons,
    emptyTextAllNamespaces,
    emptyTextSelectedNamespace,
    headers: dataHeaders,
    isSortable,
    loading,
    rows: dataRows,
    selectedNamespace,
    title,
    toolbarButtons
  } = props;

  return (
    <div className="tableComponent">
      <DataTable
        useZebraStyles
        rows={dataRows}
        headers={dataHeaders}
        isSortable={isSortable}
        render={({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getSelectionProps,
          getBatchActionProps,
          selectedRows
        }) => (
          <TableContainer title={title}>
            {(toolbarButtons.length !== 0 ||
              batchActionButtons.length !== 0) && (
              <TableToolbar>
                <TableBatchActions {...getBatchActionProps()}>
                  {batchActionButtons.map(button => (
                    <TableBatchAction
                      renderIcon={button.icon}
                      key={`${button.text}Button`}
                      onClick={() => {
                        button.onClick(
                          selectedRows,
                          getBatchActionProps().onCancel
                        );
                      }}
                    >
                      {button.text}
                    </TableBatchAction>
                  ))}
                </TableBatchActions>
                <TableToolbarContent>
                  {toolbarButtons.map(button => (
                    <Button
                      disabled={loading}
                      onClick={button.onClick}
                      renderIcon={button.icon}
                      key={`${button.text}Button`}
                    >
                      {button.text}
                    </Button>
                  ))}
                </TableToolbarContent>
              </TableToolbar>
            )}
            {loading ? (
              <DataTableSkeleton
                useZebraStyles
                rowCount={1}
                columnCount={headers.length}
              />
            ) : (
              <CarbonTable {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {batchActionButtons.length > 0 && (
                      <TableSelectAll {...getSelectionProps()} />
                    )}
                    {headers.map(header => {
                      return header.header ? (
                        <TableHeader
                          {...getHeaderProps({ header })}
                          className="cellText"
                          key={header.key}
                        >
                          {header.header}
                        </TableHeader>
                      ) : (
                        <TableHeader key={header.key} />
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loading && dataRows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={
                          headers.length + (batchActionButtons.length ? 1 : 0)
                        }
                      >
                        <div className="noRows">
                          {selectedNamespace === ALL_NAMESPACES
                            ? emptyTextAllNamespaces
                            : emptyTextSelectedNamespace}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {rows.map(row => {
                    return (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        {batchActionButtons.length > 0 && (
                          <TableSelectRow {...getSelectionProps({ row })} />
                        )}
                        {row.cells.map(cell => (
                          <TableCell key={cell.id} id={cell.id}>
                            {cell.value}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </CarbonTable>
            )}
          </TableContainer>
        )}
      />
    </div>
  );
};

Table.defaultProps = {
  batchActionButtons: [],
  toolbarButtons: [],
  loading: false,
  isSortable: false,
  title: null
};

Table.propTypes = {
  emptyTextAllNamespaces: PropTypes.string.isRequired,
  emptyTextSelectedNamespace: PropTypes.string.isRequired,
  headers: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool,
  isSortable: PropTypes.bool,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedNamespace: PropTypes.string.isRequired,
  title: PropTypes.string,
  batchActionButtons: PropTypes.arrayOf(PropTypes.object),
  toolbarButtons: PropTypes.arrayOf(PropTypes.object)
};

export default Table;
