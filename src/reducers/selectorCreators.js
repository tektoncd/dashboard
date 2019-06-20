/*
Copyright 2019 The Tekton Authors
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

import { ALL_NAMESPACES } from '../constants';

export function getCollection(state, namespace) {
  if (namespace === ALL_NAMESPACES) {
    return Object.values(state.byId);
  }

  const resources = state.byNamespace[namespace];
  return resources ? Object.values(resources).map(id => state.byId[id]) : [];
}

export function getResource(state, name, namespace) {
  const resources = state.byNamespace[namespace] || {};
  const id = resources[name];
  return id ? state.byId[id] : null;
}
