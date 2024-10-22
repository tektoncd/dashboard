/*
Copyright 2024 The Tekton Authors
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

import { usePrefix } from '@carbon/react';
import { classNames } from '@tektoncd/dashboard-utils';

export default function DataTableSkeleton({
  filters,
  headers,
  rowCount = 5,
  columnCount = 5,
  compact = false,
  className,
  showDescription,
  showHeader = true,
  showToolbar = true,
  size,
  ...rest
}) {
  const prefix = usePrefix();

  const dataTableSkeletonClasses = classNames(className, {
    [`${prefix}--skeleton`]: true,
    [`${prefix}--data-table`]: true,
    [`${prefix}--data-table--compact`]: compact,
    [`${prefix}--data-table--${size}`]: true
  });

  const rows = Array(rowCount);
  const columnsArray = Array.from({ length: columnCount }, (_, index) => index);
  for (let i = 0; i < rowCount; i += 1) {
    rows[i] = (
      <tr key={i}>
        {columnsArray.map(j => (
          // eslint-disable-next-line jsx-a11y/control-has-associated-label
          <td key={j}>
            <span />
          </td>
        ))}
      </tr>
    );
  }

  return (
    <div className={`${prefix}--skeleton ${prefix}--data-table-container`}>
      {showHeader ? (
        <div className={`${prefix}--data-table-header`}>
          <div className={`${prefix}--data-table-header__title`} />
          {showDescription && (
            <div className={`${prefix}--data-table-header__description`} />
          )}
        </div>
      ) : null}
      {showToolbar ? (
        <section
          aria-label="data table toolbar"
          className={`${prefix}--table-toolbar`}
        >
          <div className={`${prefix}--toolbar-content`}>
            {filters || (
              <span
                className={`${prefix}--skeleton ${prefix}--btn ${prefix}--btn--sm`}
              />
            )}
          </div>
        </section>
      ) : null}
      <table className={dataTableSkeletonClasses} {...rest}>
        <thead>
          <tr>
            {columnsArray.map(i => (
              <th key={i}>
                {headers ? (
                  <div className={`${prefix}--table-header-label`}>
                    {headers[i]?.header}
                  </div>
                ) : (
                  <span />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}
