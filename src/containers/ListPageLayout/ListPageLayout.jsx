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

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { InlineNotification, Pagination } from 'carbon-components-react';
import { getErrorMessage } from '@tektoncd/dashboard-utils';

import LabelFilter from '../LabelFilter';

export const ListPageLayout = ({
  children,
  error,
  filters,
  resources = [],
  title
}) => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();

  const [pageSize, setPageSize] = useState(100);
  const [page, setPage] = useState(1); // pagination component counts from 1

  useEffect(() => {
    const savedPageSize = localStorage.getItem('tkn-page-size');
    if (savedPageSize) {
      setPageSize(parseInt(savedPageSize, 10));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tkn-page-size', pageSize);
  }, [pageSize]);

  const resourcesForCurrentPage = resources.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <>
      <div className="tkn--list-page--header">
        <h1 id="main-content-header">{title}</h1>
      </div>
      {filters && (
        <LabelFilter
          filters={filters}
          location={location}
          navigate={navigate}
        />
      )}
      {error && (
        <InlineNotification
          iconDescription={intl.formatMessage({
            id: 'dashboard.notification.clear',
            defaultMessage: 'Clear notification'
          })}
          kind="error"
          lowContrast
          {...(error.clear && { onCloseButtonClick: error.clear })}
          subtitle={getErrorMessage(error.error)}
          title={
            error.title ||
            intl.formatMessage({
              id: 'dashboard.error.title',
              defaultMessage: 'Error:'
            })
          }
        />
      )}
      {children({ resources: resourcesForCurrentPage })}
      {resources.length > 10 && (
        <Pagination
          backwardText={intl.formatMessage({
            id: 'dashboard.pagination.previousPage',
            defaultMessage: 'Previous page'
          })}
          forwardText={intl.formatMessage({
            id: 'dashboard.pagination.nextPage',
            defaultMessage: 'Next page'
          })}
          itemsPerPageText={intl.formatMessage({
            id: 'dashboard.pagination.pageSize',
            defaultMessage: 'Items per page:'
          })}
          onChange={({ page: newPage, pageSize: newPageSize }) => {
            setPage(newPage);
            setPageSize(newPageSize);
          }}
          page={page}
          pageSize={pageSize}
          pageSizes={[10, 25, 50, 100]}
          totalItems={resources.length}
        />
      )}
    </>
  );
};

export default ListPageLayout;

ListPageLayout.propTypes = {
  children: PropTypes.func.isRequired
};
