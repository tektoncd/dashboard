/*
Copyright 2020 The Tekton Authors
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

import { createNamespacedReducer } from './reducerCreators';
import { getCollection, getResource } from './selectorCreators';

export default () => createNamespacedReducer({ type: 'Build' });

export function getBuilds(state, namespace) {
  return getCollection(state, namespace);
}

export function getBuild(state, name, namespace) {
  return getResource(state, name, namespace);
}

export function getBuildsErrorMessage(state) {
  return state.errorMessage;
}

export function isFetchingBuilds(state) {
  return state.isFetching;
}
