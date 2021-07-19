/*
Copyright 2019-2021 The Tekton Authors
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
import { injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import {
  Link as CarbonLink,
  InlineNotification
} from 'carbon-components-react';
import {
  ALL_NAMESPACES,
  getErrorMessage,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
import { Table } from '@tektoncd/dashboard-components';

import { useExtensions, useTenantNamespace } from '../../api';

function Extensions(props) {
  const { intl } = props;

  useTitleSync({
    page: intl.formatMessage({
      id: 'dashboard.extensions.title',
      defaultMessage: 'Extensions'
    })
  });

  const tenantNamespace = useTenantNamespace();
  const { data: extensions = [], error, isFetching } = useExtensions({
    namespace: tenantNamespace || ALL_NAMESPACES
  });

  const emptyText = intl.formatMessage({
    id: 'dashboard.extensions.emptyState',
    defaultMessage: 'No extensions found'
  });

  return (
    <>
      <h1>
        {intl.formatMessage({
          id: 'dashboard.extensions.title',
          defaultMessage: 'Extensions'
        })}
      </h1>

      {error && (
        <InlineNotification
          kind="error"
          lowContrast
          subtitle={getErrorMessage(error)}
          title={intl.formatMessage({
            id: 'dashboard.extensions.errorLoading',
            defaultMessage: 'Error loading extensions'
          })}
        />
      )}

      <Table
        headers={[
          {
            key: 'name',
            header: intl.formatMessage({
              id: 'dashboard.tableHeader.name',
              defaultMessage: 'Name'
            })
          }
        ]}
        rows={extensions.map(({ apiGroup, apiVersion, displayName, name }) => ({
          id: name,
          name: (
            <Link
              component={CarbonLink}
              to={urls.kubernetesResources.all({
                group: apiGroup,
                version: apiVersion,
                type: name
              })}
              title={displayName}
            >
              {displayName}
            </Link>
          )
        }))}
        loading={isFetching}
        emptyTextAllNamespaces={emptyText}
        emptyTextSelectedNamespace={emptyText}
      />
    </>
  );
}

Extensions.defaultProps = {
  extensions: []
};

export default injectIntl(Extensions);
