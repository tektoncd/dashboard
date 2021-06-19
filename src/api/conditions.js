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

import { get } from './comms';
import {
  checkData,
  getQueryParams,
  getTektonAPI,
  useCollection,
  useResource
} from './utils';

export function getConditions({ filters = [], namespace } = {}) {
  const uri = getTektonAPI(
    'conditions',
    { namespace, version: 'v1alpha1' },
    getQueryParams(filters)
  );
  return get(uri).then(checkData);
}

export function getCondition({ name, namespace }) {
  const uri = getTektonAPI('conditions', {
    name,
    namespace,
    version: 'v1alpha1'
  });
  return get(uri);
}

export function useConditions(params) {
  return useCollection('Condition', getConditions, params);
}

export function useCondition(params) {
  return useResource('Condition', getCondition, params);
}
