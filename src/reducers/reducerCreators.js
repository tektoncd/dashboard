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
/* istanbul ignore file */

import { typeToPlural } from '../utils';

export function createIsFetchingReducer({ type }) {
  const typePlural = typeToPlural(type);
  return function isFetching(state = false, action) {
    switch (action.type) {
      case `${typePlural}_FETCH_REQUEST`:
        return true;
      case `${typePlural}_FETCH_SUCCESS`:
      case `${typePlural}_FETCH_FAILURE`:
        return false;
      default:
        return state;
    }
  };
}

export function createErrorMessageReducer({ type }) {
  const typePlural = typeToPlural(type);
  return function errorMessage(state = null, action) {
    switch (action.type) {
      case `${typePlural}_FETCH_FAILURE`:
        return action.error.message;
      case `${typePlural}_FETCH_REQUEST`:
      case `${typePlural}_FETCH_SUCCESS`:
        return null;
      default:
        return state;
    }
  };
}
