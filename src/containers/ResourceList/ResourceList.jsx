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
import { useLocation, useMatches, useParams } from 'react-router-dom';
import {
  ALL_NAMESPACES,
  getFilters,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
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

  const matches = useMatches();
  const params = useParams();

  const { namespace: namespaceParam } = params;
  const match = matches.at(-1);
  const handle = match.handle || {};
  let { group, kind, version } = handle;
  const { resourceURL, title } = handle;

  let isExtension = false;
  if (!(group && kind && version)) {
    // we're on a kubernetes resource extension page
    // grab values directly from the URL
    ({ group, kind, version } = params);
    isExtension = true;
  }

  const { selectedNamespace } = useSelectedNamespace();
  const namespace = namespaceParam || selectedNamespace;
  const filters = getFilters(location);

  useTitleSync({ page: title || `${group}/${version}/${kind}` });

  const {
    data: apiResource,
    error: apiResourceError,
    isLoading: isLoadingAPIResource
  } = useAPIResource({ group, kind, version }, { enabled: isExtension });
  const isNamespaced = isExtension
    ? !isLoadingAPIResource && apiResource?.namespaced
    : handle?.isNamespaced;

  if (isExtension && typeof apiResource?.namespaced !== 'undefined') {
    // dynamically toggle the namespace dropdown behaviour depending on
    // whether the kind is namespaced or cluster-scoped
    match.handle.isNamespaced = isNamespaced;
  }

  const {
    data: resources,
    error: resourcesError,
    isInitialLoading: isLoadingResources
  } = useCustomResources(
    {
      filters,
      group,
      kind,
      namespace: isNamespaced ? namespace : null,
      version
    },
    {
      enabled: !isExtension || (!isLoadingAPIResource && !apiResourceError)
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
        { type: kind }
      )
    };
  }

  function getResourceURL({ name, resourceNamespace }) {
    if (resourceURL) {
      return resourceURL({
        group,
        kind,
        name,
        namespace: resourceNamespace,
        version
      });
    }

    return resourceNamespace
      ? urls.kubernetesResources.byName({
          group,
          kind,
          name,
          namespace: resourceNamespace,
          version
        })
      : urls.kubernetesResources.cluster({
          group,
          kind,
          name,
          version
        });
  }

  return (
    <ListPageLayout
      error={getError()}
      filters={filters}
      resources={resources}
      title={title || `${group}/${version}/${kind}`}
    >
      {({ resources: paginatedResources }) => (
        <Table
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No matching {kind} found'
            },
            { kind: title || kind }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage:
                'No matching {kind} found in namespace {selectedNamespace}'
            },
            { kind: title || kind, selectedNamespace: namespace }
          )}
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
          loading={(isExtension && isLoadingAPIResource) || isLoadingResources}
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
                  to={getResourceURL({ name, resourceNamespace })}
                  title={name}
                >
                  {name}
                </Link>
              ),
              namespace: resourceNamespace,
              createdTime: <FormattedDate date={creationTimestamp} relative />
            };
          })}
          selectedNamespace={isNamespaced ? namespace : ALL_NAMESPACES}
        />
      )}
    </ListPageLayout>
  );
}

export default ResourceListContainer;
