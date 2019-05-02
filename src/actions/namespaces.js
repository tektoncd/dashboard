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

import { getNamespaces } from '../api';

export function selectNamespace(namespace) {
  return {
    type: 'NAMESPACE_SELECT',
    namespace
  };
}

export function fetchNamespacesSuccess(data) {
  return {
    type: 'NAMESPACES_FETCH_SUCCESS',
    data
  };
}

export function fetchNamespaces() {
  return async dispatch => {
    dispatch({ type: 'NAMESPACES_FETCH_REQUEST' });
    let namespaces;
    try {
      namespaces = await getNamespaces();
      dispatch(fetchNamespacesSuccess(namespaces));
    } catch (error) {
      dispatch({ type: 'NAMESPACES_FETCH_FAILURE', error });
    }
    return namespaces;
  };
}
