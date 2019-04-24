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

import { combineReducers } from 'redux';
import keyBy from 'lodash.keyby';

function byName(state = {}, action) {
  switch (action.type) {
    case 'EXTENSIONS_FETCH_SUCCESS':
      return keyBy(action.data, 'name');
    default:
      return state;
  }
}

function isFetching(state = false, action) {
  switch (action.type) {
    case 'EXTENSIONS_FETCH_REQUEST':
      return true;
    case 'EXTENSIONS_FETCH_SUCCESS':
    case 'EXTENSIONS_FETCH_FAILURE':
      return false;
    default:
      return state;
  }
}

function errorMessage(state = null, action) {
  switch (action.type) {
    case 'EXTENSIONS_FETCH_FAILURE':
      return action.error.message;
    case 'EXTENSIONS_FETCH_REQUEST':
    case 'EXTENSIONS_FETCH_SUCCESS':
      return null;
    default:
      return state;
  }
}

export default combineReducers({
  byName,
  errorMessage,
  isFetching
});

export function getExtensions(state) {
  return Object.values(state.byName);
}

export function getExtension(state, name) {
  return state.byName[name];
}

export function getExtensionsErrorMessage(state) {
  return state.errorMessage;
}

export function isFetchingExtensions(state) {
  return state.isFetching;
}
