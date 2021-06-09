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

function getResourceVersion(resource) {
  return parseInt(resource.metadata.resourceVersion, 10);
}

export function useWebSocket(resourceType) {
  const webSocket = useContext(WebSocketContext);
  const queryClient = useQueryClient();
  useEffect(() => {
    const eventListener = event => {
      if (event.type !== 'message') {
        return;
      }
      const { operation, payload } = JSON.parse(event.data);
      queryClient.setQueriesData(resourceType, data => {
        switch (operation) {
          case 'Created':
            const existingResource = data.find(
              resource => resource.metadata.uid === payload.metadata.uid
            );
            if (existingResource) {
              return data; // payload is stale, ignore it
            }
            return [...data, payload];
          case 'Deleted':
            return data.filter(
              resource => resource.metadata.uid !== payload.metadata.uid
            );
          case 'Updated':
            return data.map(resource => {
              return resource.metadata.uid === payload.metadata.uid &&
                // only apply the update if it's newer than the version we already have
                getResourceVersion(payload) > getResourceVersion(resource)
                ? payload
                : resource;
            });
          default:
            return data;
        }
      });
    };
    webSocket.addEventListener('message', eventListener);
    return () => webSocket.removeEventListener('message', eventListener);
  }, [queryClient, webSocket]);
}

export function useNamespacedCollection(resourceType, api, params) {
  const query = useQuery([resourceType, params], () => api(params));
  useWebSocket(resourceType);
  return query;
}
