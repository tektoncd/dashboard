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

import { get } from './comms';
import { dashboardAPIGroup, getKubeAPI, useCollection } from './utils';

function getExtensionsAPI({ isWebSocket, namespace }) {
  return getKubeAPI({
    group: dashboardAPIGroup,
    kind: 'extensions',
    params: { isWebSocket, namespace },
    version: 'v1alpha1'
  });
}

export function getExtensions({ namespace } = {}) {
  const resourceExtensionsUri = getExtensionsAPI({ namespace });
  return get(resourceExtensionsUri);
}

export function useExtensions(params, queryConfig) {
  const webSocketURL = getExtensionsAPI({ ...params, isWebSocket: true });
  const { data, ...query } = useCollection({
    api: getExtensions,
    kind: 'Extension',
    params,
    queryConfig,
    webSocketURL
  });

  return {
    ...query,
    data: (data || []).map(({ spec }) => {
      const { displayname: displayName, name, namespaced } = spec;
      const [apiGroup, apiVersion] = spec.apiVersion.split('/');
      return {
        apiGroup,
        apiVersion,
        displayName,
        name,
        namespaced
      };
    })
  };
}
