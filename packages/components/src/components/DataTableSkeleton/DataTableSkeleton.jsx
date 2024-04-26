/*
Copyright 2020-2024 The Tekton Authors
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

// disable `control-has-associated-label` check due to a bug in the jsx-a11y
// plugin incorrectly flagging this on elements that are not form controls
/* eslint-disable jsx-a11y/control-has-associated-label */

import PropTypes from 'prop-types';
import { getCarbonPrefix } from '@tektoncd/dashboard-utils';

const carbonPrefix = getCarbonPrefix();

const tableSizeClassNames = {
  xs: `${carbonPrefix}--data-table--xs`,
  sm: `${carbonPrefix}--data-table--sm`,
  md: `${carbonPrefix}--data-table--md`,
  lg: `${carbonPrefix}--data-table--lg`,
  xl: `${carbonPrefix}--data-table--xl`
};

const defaults = {
  headers: []
};

const DataTableSkeleton = ({
  className = '',
  columnCount = 5,
  headers = defaults.headers,
  rowCount = 5,
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

  const sizeClassName = tableSizeClassNames[size] || '';

  return (
    <table
      className={`${className} ${sizeClassName} ${carbonPrefix}--data-table ${carbonPrefix}--skeleton tkn--data-table-skeleton`}
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

export default DataTableSkeleton;
