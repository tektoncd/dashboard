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

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import { createWebSocket, getAPIRoot } from './comms';

export const apiRoot = getAPIRoot();
export const tektonAPIGroup = 'tekton.dev';
export const triggersAPIGroup = 'triggers.tekton.dev';
export const dashboardAPIGroup = 'dashboard.tekton.dev';

export function getKubeAPI({
  group,
  kind,
  params: { isWebSocket, name = '', namespace, subResource } = {},
  queryParams,
  version
}) {
  const queryParamsToUse = {
    ...queryParams,
    ...(isWebSocket
      ? { [subResource === 'log' ? 'follow' : 'watch']: true }
      : null),
    ...(isWebSocket && name ? { fieldSelector: `metadata.name=${name}` } : null)
  };

  return [
    isWebSocket ? apiRoot.replace('http', 'ws') : apiRoot,
    group === 'core' ? `/api/${version}/` : `/apis/${group}/${version}/`,
    namespace && namespace !== ALL_NAMESPACES
      ? `namespaces/${encodeURIComponent(namespace)}/`
      : '',
    kind,
    '/',
    isWebSocket ? '' : encodeURIComponent(name),
    subResource ? `/${subResource}` : '',
    Object.keys(queryParamsToUse).length > 0
      ? `?${new URLSearchParams(queryParamsToUse).toString()}`
      : ''
  ].join('');
}

export function getQueryParams({
  filters,
  involvedObjectKind,
  involvedObjectName
}) {
  if (filters?.length) {
    return { labelSelector: filters };
  }
  if (involvedObjectKind && involvedObjectName) {
    return {
      fieldSelector: [
        `involvedObject.kind=${involvedObjectKind}`,
        `involvedObject.name=${involvedObjectName}`
      ]
    };
  }
  return '';
}

export function isPipelinesV1ResourcesEnabled() {
  return localStorage.getItem('tkn-pipelines-v1-resources') !== 'false';
}

export function setPipelinesV1ResourcesEnabled(enabled) {
  localStorage.setItem('tkn-pipelines-v1-resources', enabled);
}

export function getTektonPipelinesAPIVersion() {
  return isPipelinesV1ResourcesEnabled() ? 'v1' : 'v1beta1';
}

export const NamespaceContext = createContext();
NamespaceContext.displayName = 'Namespace';

function getResourceVersion(resource) {
  return parseInt(resource.metadata.resourceVersion, 10);
}

function handleCreated({ kind, payload: _, queryClient }) {
  queryClient.invalidateQueries([kind]);
}

function handleDeleted({ kind, payload, queryClient }) {
  const {
    metadata: { name, namespace }
  } = payload;
  // remove any matching details page cache
  queryClient.removeQueries([kind, { name, ...(namespace && { namespace }) }]);
  // remove resource from any list page caches
  queryClient.setQueriesData([kind], data => {
    if (!Array.isArray(data?.items)) {
      // another details page cache, but not the one we're looking for
      // since we've just deleted its query above
      return data;
    }
    return {
      ...data,
      items: data.items.filter(
        resource => resource.metadata.uid !== payload.metadata.uid
      )
    };
  });
}

function updateResource({ existing, incoming }) {
  return incoming.metadata.uid === existing.metadata.uid &&
    // only apply the update if it's newer than the version we already have
    getResourceVersion(incoming) > getResourceVersion(existing)
    ? incoming
    : existing;
}

function handleUpdated({ kind, payload, queryClient }) {
  const {
    metadata: { uid }
  } = payload;
  queryClient.setQueriesData([kind], data => {
    if (data?.metadata?.uid === uid) {
      // it's a details page cache (i.e. a single resource)
      return updateResource({ existing: data, incoming: payload });
    }
    if (!Array.isArray(data?.items)) {
      // another single resource but not a match
      return data;
    }
    // otherwise it's a list page cache
    return {
      ...data,
      items: data.items.map(resource =>
        updateResource({ existing: resource, incoming: payload })
      )
    };
  });
}

export function useWebSocket({ enabled, kind, resourceVersion, url }) {
  const queryClient = useQueryClient();
  const [isWebSocketConnected, setWebSocketConnected] = useState(null);
  let { current: webSocket } = useRef(null);

  useEffect(() => {
    if (enabled === false) {
      return null;
    }

    function handleClose() {
      setWebSocketConnected(false);
    }
    function handleOpen() {
      setWebSocketConnected(true);
    }
    function handleMessage(event) {
      if (event.type !== 'message') {
        return;
      }
      const { type: operation, object: payload } = JSON.parse(event.data);
      switch (operation) {
        case 'ADDED':
          handleCreated({ kind, payload, queryClient });
          break;
        case 'DELETED':
          handleDeleted({ kind, payload, queryClient });
          break;
        case 'MODIFIED':
          handleUpdated({ kind, payload, queryClient });
          break;
        default:
      }
    }

    const webSocketURL = new URL(url);
    const queryParams = new URLSearchParams(webSocketURL.search);
    queryParams.set('resourceVersion', resourceVersion);
    webSocketURL.search = queryParams.toString();
    webSocket = createWebSocket(webSocketURL.toString());

    webSocket.addEventListener('close', handleClose);
    webSocket.addEventListener('open', handleOpen);
    webSocket.addEventListener('message', handleMessage);

    return () => {
      if (webSocket) {
        webSocket.removeEventListener('close', handleClose);
        webSocket.removeEventListener('open', handleOpen);
        webSocket.removeEventListener('message', handleMessage);
        webSocket.close();
      }
    };
  }, [enabled, url]);

  return { isWebSocketConnected };
}

export function useSelectedNamespace() {
  return useContext(NamespaceContext);
}

export function useCollection({
  api,
  kind,
  params,
  queryConfig,
  webSocketURL
}) {
  const { disableWebSocket, ...reactQueryConfig } = queryConfig || {};
  const query = useQuery(
    [kind, params].filter(Boolean),
    () => api(params),
    reactQueryConfig
  );

  let data = [];
  let resourceVersion;
  if (query.data?.items) {
    resourceVersion = query.data.metadata.resourceVersion;
    data = query.data.items;
  }

  const { isWebSocketConnected } = useWebSocket({
    enabled:
      !disableWebSocket &&
      queryConfig?.enabled !== false &&
      query.isSuccess &&
      !!resourceVersion,
    kind,
    resourceVersion,
    url: webSocketURL
  });
  return { ...query, data, isWebSocketConnected };
}

export function useResource({
  api,
  kind,
  params,
  queryConfig = {},
  webSocketURL
}) {
  const { disableWebSocket, ...reactQueryConfig } = queryConfig;
  const query = useQuery(
    [kind, params].filter(Boolean),
    () => api(params),
    reactQueryConfig
  );

  let resourceVersion;
  if (query.data?.metadata) {
    resourceVersion = query.data.metadata.resourceVersion;
  }
  const { isWebSocketConnected } = useWebSocket({
    enabled:
      !disableWebSocket &&
      queryConfig?.enabled !== false &&
      query.isSuccess &&
      !!resourceVersion,
    kind,
    resourceVersion,
    url: webSocketURL
  });
  return { ...query, isWebSocketConnected };
}

export function isLogTimestampsEnabled() {
  return localStorage.getItem('tkn-logs-timestamps') === 'true';
}

export function setLogTimestampsEnabled(enabled) {
  localStorage.setItem('tkn-logs-timestamps', enabled);
}

export function removeSystemAnnotations(resource) {
  Object.keys(resource.metadata.annotations).forEach(annotation => {
    if (annotation.startsWith('tekton.dev/')) {
      delete resource.metadata.annotations[annotation]; // eslint-disable-line no-param-reassign
    }
  });

  delete resource.metadata.annotations[ // eslint-disable-line no-param-reassign
    'kubectl.kubernetes.io/last-applied-configuration'
  ];
}

export function removeSystemLabels(resource) {
  Object.keys(resource.metadata.labels).forEach(label => {
    if (label.startsWith('tekton.dev/')) {
      delete resource.metadata.labels[label]; // eslint-disable-line no-param-reassign
    }
  });
}
