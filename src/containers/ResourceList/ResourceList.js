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
/* istanbul ignore file */
import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  getFilters,
  urls,
  useTitleSync,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';
import { Link as CarbonLink } from 'carbon-components-react';

import { ListPageLayout } from '..';
import {
  getAPIResource,
  getCustomResources,
  useSelectedNamespace
} from '../../api';
import { isWebSocketConnected } from '../../reducers';

export function ResourceListContainer(props) {
  const { filters, intl, match, webSocketConnected } = props;
  const { group, namespace: namespaceParam, version, type } = match.params;

  const { selectedNamespace } = useSelectedNamespace();
  const namespace = namespaceParam || selectedNamespace;

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNamespaced, setIsNamespaced] = useState(true);
  const [resources, setResources] = useState([]);

  useTitleSync({ page: `${group}/${version}/${type}` });

  function fetchResources() {
    return getAPIResource({ group, version, type })
      .then(({ namespaced }) => {
        setIsNamespaced(namespaced);
        return getCustomResources({
          filters,
          group,
          version,
          type,
          namespace: namespaced ? namespace : null
        });
      })
      .then(res => {
        setLoading(false);
        setResources(res);
      })
      .catch(err => {
        setError(err);
      });
  }

  useEffect(() => {
    fetchResources();
  }, [JSON.stringify(filters), group, namespace, type, version]);

  useWebSocketReconnected(fetchResources, webSocketConnected);

  function getError() {
    if (error) {
      return {
        error,
        title: intl.formatMessage(
          {
            id: 'dashboard.resourceList.errorLoading',
            defaultMessage: 'Error loading {type}'
          },
          { type }
        )
      };
    }

    return null;
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
      {...props}
      error={getError()}
      title={`${group}/${version}/${type}`}
      hideNamespacesDropdown={!isNamespaced}
    >
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
        rows={resources.map(resource => {
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
                component={CarbonLink}
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
        loading={loading}
        emptyTextAllNamespaces={emptyText}
        emptyTextSelectedNamespace={emptyText}
      />
    </ListPageLayout>
  );
}

function mapStateToProps(state, props) {
  return {
    filters: getFilters(props.location),
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(ResourceListContainer));
