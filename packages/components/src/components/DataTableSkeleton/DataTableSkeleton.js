/*
Copyright 2020-2021 The Tekton Authors
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
/* istanbul ignore file */

import PropTypes from 'prop-types';
import React from 'react';

const DataTableSkeleton = ({
  className,
  columnCount,
  headers,
  rowCount,
  size,
  ...rest
}) => {
  const rowRepeat = rowCount - 1;
  const columns =
    headers ||
    Array.from({ length: columnCount }, (_, index) => ({ key: index }));
  const rows = Array.from({ length: rowRepeat }, (_, index) => (
    <tr key={index}>
      {columns.map(({ key }) => (
        <td key={key} />
      ))}
    </tr>
  ));

  const sizeClassName = size ? `bx--data-table--${size}` : '';

  return (
    <table
      className={`${className} ${sizeClassName} bx--data-table bx--skeleton tkn--data-table-skeleton`}
      {...rest}
    >
      <thead>
        <tr>
          {columns.map(({ key, header }) => (
            <th key={key}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {columns.map(({ key }) => (
            <td key={key}>
              <span />
            </td>
          ))}
        </tr>
        {rows}
      </tbody>
    </table>
  );
};

DataTableSkeleton.propTypes = {
  className: PropTypes.string,
  columnCount: PropTypes.number,
  headers: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.shape({
      key: PropTypes.string,
      header: PropTypes.node
    })
  ]),
  rowCount: PropTypes.number
};
DataTableSkeleton.defaultProps = {
  className: '',
  columnCount: 5,
  headers: [],
  rowCount: 5
};

export default DataTableSkeleton;
