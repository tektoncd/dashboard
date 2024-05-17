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
/* istanbul ignore file */
import { useIntl } from 'react-intl';
import { useLocation, useParams } from 'react-router-dom';
import { getFilters, urls, useTitleSync } from '@tektoncd/dashboard-utils';
import { FormattedDate, Link, Table } from '@tektoncd/dashboard-components';

import ListPageLayout from '../ListPageLayout';
import {
  useAPIResource,
  useCustomResources,
  useSelectedNamespace
} from '../../api';

export function ResourceListContainer() {
  const intl = useIntl();
  const location = useLocation();
  const { group, namespace: namespaceParam, version, type } = useParams();

  const { selectedNamespace } = useSelectedNamespace();
  const namespace = namespaceParam || selectedNamespace;
  const filters = getFilters(location);

  useTitleSync({ page: `${group}/${version}/${type}` });

  const {
    data: apiResource,
    error: apiResourceError,
    isLoading: isLoadingAPIResource
  } = useAPIResource({ group, type, version });
  const isNamespaced = !isLoadingAPIResource && apiResource?.namespaced;

  const {
    data: resources,
    error: resourcesError,
    isInitialLoading: isLoadingResources
  } = useCustomResources(
    {
      filters,
      group,
      namespace: isNamespaced ? namespace : null,
      type,
      version
    },
    {
      enabled: !isLoadingAPIResource && !apiResourceError
    }
  );

  function getError() {
    if (!apiResourceError && !resourcesError) {
      return null;
    }
    return {
      error: apiResourceError || resourcesError,
      title: intl.formatMessage(
        {
          id: 'dashboard.resourceList.errorLoading',
          defaultMessage: 'Error loading {type}'
        },
        { type }
      )
    };
  }

  const emptyText = intl.formatMessage(
    {
      id: 'dashboard.resourceList.emptyState',
      defaultMessage: 'No matching resources found for type {type}'
    },
    { type }
  );

  return (
    <ListPageLayout
      error={getError()}
      filters={filters}
      resources={resources}
      title={`${group}/${version}/${type}`}
    >
      {({ resources: paginatedResources }) => (
        <Table
          headers={[
            {
              key: 'name',
              header: intl.formatMessage({
                id: 'dashboard.tableHeader.name',
                defaultMessage: 'Name'
              })
            },
            isNamespaced
              ? {
                  key: 'namespace',
                  header: 'Namespace'
                }
              : null,
            {
              key: 'createdTime',
              header: intl.formatMessage({
                id: 'dashboard.tableHeader.createdTime',
                defaultMessage: 'Created'
              })
            }
          ].filter(Boolean)}
          rows={paginatedResources.map(resource => {
            const {
              creationTimestamp,
              name,
              namespace: resourceNamespace,
              uid
            } = resource.metadata;

            return {
              id: uid,
              name: (
                <Link
                  to={
                    resourceNamespace
                      ? urls.kubernetesResources.byName({
                          namespace: resourceNamespace,
                          group,
                          version,
                          type,
                          name
                        })
                      : urls.kubernetesResources.cluster({
                          group,
                          version,
                          type,
                          name
                        })
                  }
                  title={name}
                >
                  {name}
                </Link>
              ),
              namespace: resourceNamespace,
              createdTime: <FormattedDate date={creationTimestamp} relative />
            };
          })}
          loading={isLoadingAPIResource || isLoadingResources}
          emptyTextAllNamespaces={emptyText}
          emptyTextSelectedNamespace={emptyText}
        />
      )}
    </ListPageLayout>
  );
}

export default ResourceListContainer;
