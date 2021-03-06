/*
Copyright 2021 The Tekton Authors
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
import {
  checkData,
  getQueryParams,
  getTektonAPI,
  triggersAPIGroup,
  useCollection,
  useResource
} from './utils';

export function getTriggers({ filters = [], namespace } = {}) {
  const uri = getTektonAPI(
    'triggers',
    { group: triggersAPIGroup, namespace, version: 'v1alpha1' },
    getQueryParams(filters)
  );
  return get(uri).then(checkData);
}

export function getTrigger({ name, namespace }) {
  const uri = getTektonAPI('triggers', {
    group: triggersAPIGroup,
    name,
    namespace,
    version: 'v1alpha1'
  });
  return get(uri);
}

export function useTriggers(params) {
  return useCollection('Trigger', getTriggers, params);
}

export function useTrigger(params) {
  return useResource('Trigger', getTrigger, params);
}
