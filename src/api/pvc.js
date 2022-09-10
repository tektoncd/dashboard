/*
Copyright 2019-2022 The Tekton Authors
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
import { getKubeAPI, getQueryParams, useCollection } from './utils';

function getPVCAPI({ filters, isWebSocket, name, namespace }) {
  return getKubeAPI(
    'persistentvolumeclaims',
    { isWebSocket, namespace },
    getQueryParams({ filters, name })
  );
}

export function getPVCs({ filters = [], namespace } = {}) {
  const uri = getPVCAPI({
    filters,
    namespace
  });
  return get(uri);
}

export function usePVCs(params) {
  const webSocketURL = getPVCAPI({
    ...params,
    isWebSocket: true
  });
  return useCollection({
    api: getPVCs,
    kind: 'PersistentVolumeClaim',
    params,
    webSocketURL
  });
}
