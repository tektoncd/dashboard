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

import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import {
  Button,
  DataTable,
  TableBatchAction,
  TableBatchActions,
  TableSelectAll,
  TableSelectRow,
  TableToolbar,
  TableToolbarContent
} from '@carbon/react';
import { ALL_NAMESPACES, classNames } from '@tektoncd/dashboard-utils';

import DataTableSkeleton from '../DataTableSkeleton';

const {
  TableContainer,
  Table: CarbonTable,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader
} = DataTable;

/* istanbul ignore next */
function getTranslateWithId(intl) {
  return function translateWithId(id, state) {
    switch (id) {
      case 'carbon.table.all.collapse':
        return intl.formatMessage({
          id: 'carbon.table.all.collapse',
          defaultMessage: 'Collapse all rows'
        });
      case 'carbon.table.all.expand':
        return intl.formatMessage({
          id: 'carbon.table.all.expand',
          defaultMessage: 'Expand all rows'
        });
      case 'carbon.table.all.select':
        return intl.formatMessage({
          id: 'carbon.table.all.select',
          defaultMessage: 'Select all rows'
        });
      case 'carbon.table.all.unselect':
        return intl.formatMessage({
          id: 'carbon.table.all.unselect',
          defaultMessage: 'Unselect all rows'
        });
      case 'carbon.table.batch.cancel':
        return intl.formatMessage({
          id: 'carbon.table.batch.cancel',
          defaultMessage: 'Cancel'
        });
      case 'carbon.table.batch.item.selected':
        return intl.formatMessage({
          id: 'carbon.table.batch.item.selected',
          defaultMessage: '1 item selected'
        });
      case 'carbon.table.batch.items.selected':
        return intl.formatMessage(
          {
            id: 'carbon.table.batch.items.selected',
            defaultMessage: '{totalSelected, plural, other {# items}} selected'
          },
          {
            totalSelected: state.totalSelected
          }
        );
      case 'carbon.table.batch.selectAll':
        return intl.formatMessage(
          {
            id: 'carbon.table.batch.selectAll',
            defaultMessage: 'Select all ({totalCount})'
          },
          { totalCount: state.totalCount }
        );
      case 'carbon.table.row.collapse':
        return intl.formatMessage({
          id: 'carbon.table.row.collapse',
          defaultMessage: 'Collapse current row'
        });
      case 'carbon.table.row.expand':
        return intl.formatMessage({
          id: 'carbon.table.row.expand',
          defaultMessage: 'Expand current row'
        });
      case 'carbon.table.row.select':
        return intl.formatMessage({
          id: 'carbon.table.row.select',
          defaultMessage: 'Select row'
        });
      case 'carbon.table.row.unselect':
        return intl.formatMessage({
          id: 'carbon.table.row.unselect',
          defaultMessage: 'Unselect row'
        });
      default:
        return '';
    }
  };
}

const defaults = {
  batchActionButtons: [],
  toolbarButtons: []
};

const Table = ({
  batchActionButtons = defaults.batchActionButtons,
  className,
  emptyTextAllNamespaces = null,
  emptyTextSelectedNamespace = null,
  filters,
  hasDetails,
  headers: dataHeaders,
  id = null,
  isSortable = false,
  loading = false,
  rows: dataRows,
  selectedNamespace = null,
  size = hasDetails ? 'xl' : undefined,
  skeletonRowCount,
  title = null,
  toolbarButtons = defaults.toolbarButtons
}) => {
  const intl = useIntl();
  const shouldRenderBatchActions = !!(
    dataRows.length && batchActionButtons.length
  );
  const translateWithId = getTranslateWithId(intl);

  const hasToolbar = !!(
    filters ||
    toolbarButtons.length ||
    shouldRenderBatchActions
  );

  const tableClassNames = classNames('tkn--table', className, {
    'tkn--table-with-details': hasDetails,
    'tkn--table-with-filters': filters
  });

  if (loading) {
    return (
      <div className={tableClassNames} id={id}>
        <DataTableSkeleton
          aria-label={title}
          columnCount={dataHeaders.length}
          filters={filters}
          headers={dataHeaders}
          rowCount={skeletonRowCount}
          showHeader={!!title}
          showToolbar={hasToolbar}
          size={size}
        />
      </div>
    );
  }

  return (
    <div className={tableClassNames} id={id}>
      <DataTable
        key={selectedNamespace}
        rows={dataRows}
        headers={dataHeaders}
        isSortable={isSortable}
        size={size}
        translateWithId={translateWithId}
        render={({
          rows,
          headers,
          getBatchActionProps,
          getHeaderProps,
          getRowProps,
          getSelectionProps,
          getTableContainerProps,
          getTableProps,
          getToolbarProps,
          selectedRows,
          selectRow
        }) => {
          const batchActionProps = {
            ...getBatchActionProps(),
            onSelectAll: () => {
              rows.forEach(row => {
                if (!row.isSelected) {
                  selectRow(row.id);
                }
              });
            }
          };

          return (
            <TableContainer {...getTableContainerProps()} title={title}>
              {hasToolbar && (
                <TableToolbar {...getToolbarProps()}>
                  {filters}
                  {shouldRenderBatchActions && (
                    <TableBatchActions
                      {...batchActionProps}
                      translateWithId={translateWithId}
                    >
                      {batchActionButtons.map(button => (
                        <TableBatchAction
                          tabIndex={
                            batchActionProps.shouldShowBatchActions ? 0 : -1
                          }
                          renderIcon={button.icon}
                          key={`${button.text}Button`}
                          onClick={() => {
                            button.onClick(
                              selectedRows,
                              batchActionProps.onCancel
                            );
                          }}
                        >
                          {button.text}
                        </TableBatchAction>
                      ))}
                    </TableBatchActions>
                  )}
                  <TableToolbarContent>
                    {toolbarButtons.map(({ icon, onClick, text, ...rest }) => (
                      <Button
                        disabled={loading}
                        key={`${text}Button`}
                        onClick={onClick}
                        renderIcon={icon}
                        {...rest}
                      >
                        {text}
                      </Button>
                    ))}
                  </TableToolbarContent>
                </TableToolbar>
              )}
              <CarbonTable {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {shouldRenderBatchActions && (
                      <TableSelectAll {...getSelectionProps()} />
                    )}
                    {headers.map(header =>
                      header.header ? (
                        <TableHeader
                          {...getHeaderProps({ header })}
                          key={header.key}
                        >
                          {header.header}
                        </TableHeader>
                      ) : (
                        <TableHeader key={header.key} />
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={headers.length}>
                        <div className="noRows">
                          {selectedNamespace === ALL_NAMESPACES
                            ? emptyTextAllNamespaces
                            : emptyTextSelectedNamespace}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {rows.map(row => (
                    <TableRow {...getRowProps({ row })} key={row.id}>
                      {shouldRenderBatchActions && (
                        <TableSelectRow {...getSelectionProps({ row })} />
                      )}
                      {row.cells.map(cell => (
                        <TableCell
                          key={cell.id}
                          id={id ? `${id}:${cell.id}` : cell.id}
                          className={`cell-${cell.info.header}`}
                          {...(typeof cell.value === 'string' && {
                            title: cell.value
                          })}
                        >
                          {cell.value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </CarbonTable>
            </TableContainer>
          );
        }}
      />
    </div>
  );
};

Table.propTypes = {
  batchActionButtons: PropTypes.arrayOf(PropTypes.object),
  emptyTextAllNamespaces: PropTypes.string,
  emptyTextSelectedNamespace: PropTypes.string,
  headers: PropTypes.arrayOf(PropTypes.object).isRequired,
  id: PropTypes.string,
  isSortable: PropTypes.bool,
  loading: PropTypes.bool,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedNamespace: PropTypes.string,
  title: PropTypes.string,
  toolbarButtons: PropTypes.arrayOf(PropTypes.object)
};

export default Table;
