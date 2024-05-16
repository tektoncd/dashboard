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
import { getKubeAPI, useCollection } from './utils';

export function getServiceAccounts({ namespace } = {}) {
  const uri = getKubeAPI({
    group: 'core',
    kind: 'serviceaccounts',
    params: { namespace },
    version: 'v1'
  });
  return get(uri);
}

export function useServiceAccounts(params, queryConfig) {
  const webSocketURL = getKubeAPI({
    group: 'core',
    kind: 'serviceaccounts',
    params: {
      ...params,
      isWebSocket: true
    },
    version: 'v1'
  });
  return useCollection({
    api: getServiceAccounts,
    kind: 'ServiceAccount',
    params,
    queryConfig,
    webSocketURL
  });
}
