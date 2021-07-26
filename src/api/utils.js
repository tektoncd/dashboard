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

import React, { useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import { getAPIRoot } from './comms';

export const apiRoot = getAPIRoot();
export const tektonAPIGroup = 'tekton.dev';
export const triggersAPIGroup = 'triggers.tekton.dev';
export const dashboardAPIGroup = 'dashboard.tekton.dev';

export function checkData(data) {
  if (data.items) {
    return data.items;
  }

  const error = new Error('Unable to retrieve data');
  error.data = data;
  throw error;
}

export function getAPI(type, { name = '', namespace } = {}, queryParams) {
  return [
    apiRoot,
    '/v1/namespaces/',
    encodeURIComponent(namespace),
    '/',
    type,
    '/',
    encodeURIComponent(name),
    queryParams ? `?${new URLSearchParams(queryParams).toString()}` : ''
  ].join('');
}

export function getKubeAPI(
  type,
  { name = '', namespace, subResource } = {},
  queryParams
) {
  return [
    apiRoot,
    '/proxy/api/v1/',
    namespace && namespace !== ALL_NAMESPACES
      ? `namespaces/${encodeURIComponent(namespace)}/`
      : '',
    type,
    '/',
    encodeURIComponent(name),
    subResource ? `/${subResource}` : '',
    queryParams && Object.keys(queryParams).length > 0
      ? `?${new URLSearchParams(queryParams).toString()}`
      : ''
  ].join('');
}

export function getResourcesAPI(
  { group, version, type, name = '', namespace },
  queryParams
) {
  return [
    apiRoot,
    group === 'core'
      ? `/proxy/api/${version}/`
      : `/proxy/apis/${group}/${version}/`,
    namespace && namespace !== ALL_NAMESPACES
      ? `namespaces/${encodeURIComponent(namespace)}/`
      : '',
    type,
    '/',
    encodeURIComponent(name),
    queryParams ? `?${new URLSearchParams(queryParams).toString()}` : ''
  ].join('');
}

export function getQueryParams(filters) {
  if (filters.length) {
    return { labelSelector: filters };
  }
  return '';
}

export function getTektonAPI(
  type,
  { group = tektonAPIGroup, name = '', namespace, version = 'v1beta1' } = {},
  queryParams
) {
  return getResourcesAPI(
    { group, version, type, name, namespace },
    queryParams
  );
}

export const WebSocketContext = React.createContext();
export const NamespaceContext = React.createContext();

function getResourceVersion(resource) {
  return parseInt(resource.metadata.resourceVersion, 10);
}

function handleCreated({ payload, queryClient }) {
  const { kind } = payload;
  queryClient.invalidateQueries(kind);
}

function handleDeleted({ payload, queryClient }) {
  const {
    kind,
    metadata: { name, namespace }
  } = payload;
  // remove any matching details page cache
  queryClient.removeQueries([kind, { name, ...(namespace && { namespace }) }]);
  // remove resource from any list page caches
  queryClient.setQueriesData(kind, data => {
    if (!Array.isArray(data)) {
      // another details page cache, but not the one we're looking for
      // since we've just deleted its query above
      return data;
    }
    return data.filter(
      resource => resource.metadata.uid !== payload.metadata.uid
    );
  });
}

function updateResource({ existing, incoming }) {
  return incoming.metadata.uid === existing.metadata.uid &&
    // only apply the update if it's newer than the version we already have
    getResourceVersion(incoming) > getResourceVersion(existing)
    ? incoming
    : existing;
}

function handleUpdated({ payload, queryClient }) {
  const {
    kind,
    metadata: { uid }
  } = payload;
  queryClient.setQueriesData(kind, data => {
    if (data.metadata?.uid === uid) {
      // it's a details page cache (i.e. a single resource)
      return updateResource({ existing: data, incoming: payload });
    }
    // otherwise it's a list page cache
    return data.map(resource =>
      updateResource({ existing: resource, incoming: payload })
    );
  });
}

export function useWebSocket({ kind: _ }) {
  const webSocket = useContext(WebSocketContext);
  const queryClient = useQueryClient();
  useEffect(() => {
    const eventListener = event => {
      if (event.type !== 'message') {
        return;
      }
      const { operation, payload } = JSON.parse(event.data);
      switch (operation) {
        case 'Created':
          handleCreated({ payload, queryClient });
          break;
        case 'Deleted':
          handleDeleted({ payload, queryClient });
          break;
        case 'Updated':
          handleUpdated({ payload, queryClient });
          break;
        default:
      }
    };
    webSocket.addEventListener('message', eventListener);
    return () => webSocket.removeEventListener('message', eventListener);
  }, [queryClient, webSocket]);
}

export function useSelectedNamespace() {
  return useContext(NamespaceContext);
}

export function useCollection(kind, api, params, queryConfig) {
  const query = useQuery(
    [kind, params].filter(Boolean),
    () => api(params),
    queryConfig
  );
  useWebSocket({ kind });
  return query;
}

export function useResource(kind, api, params, queryConfig) {
  const query = useQuery(
    [kind, params].filter(Boolean),
    () => api(params),
    queryConfig
  );
  useWebSocket({ kind });
  return query;
}

export function isLogTimestampsEnabled() {
  return localStorage.getItem('tkn-logs-timestamps') === 'true';
}

export function setLogTimestampsEnabled(enabled) {
  localStorage.setItem('tkn-logs-timestamps', enabled);
}
