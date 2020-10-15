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

import {
  createErrorMessageReducer,
  createIsFetchingReducer
} from './reducerCreators';
import { getExtensionBundleURL } from '../api';

const type = 'Extension';

export function mapResourceExtension(extension) {
  const { displayname: displayName, name } = extension.spec;
  const [apiGroup, apiVersion] = extension.spec.apiVersion.split('/');
  return {
    displayName,
    name,
    apiGroup,
    apiVersion,
    extensionType: 'kubernetes-resource'
  };
}

export function mapServiceExtension(extension) {
  return {
    name: extension.name,
    displayName: extension.displayname,
    source: getExtensionBundleURL(extension.name, extension.bundlelocation)
  };
}

function byName(state = {}, action) {
  switch (action.type) {
    case 'ResourceExtensionCreated':
    case 'ResourceExtensionUpdated': {
      const extension = mapResourceExtension(action.payload);
      return { ...state, [extension.name]: extension };
    }
    case 'ServiceExtensionCreated':
    case 'ServiceExtensionUpdated': {
      const extension = mapServiceExtension(action.payload);
      return { ...state, [extension.name]: extension };
    }
    case 'ResourceExtensionDeleted': {
      const newState = { ...state };
      delete newState[action.payload.spec.name];
      return newState;
    }
    case 'ServiceExtensionDeleted': {
      const newState = { ...state };
      delete newState[action.payload.name];
      return newState;
    }
    case 'EXTENSIONS_FETCH_SUCCESS':
      return keyBy(action.data, 'name');
    default:
      return state;
  }
}

const isFetching = createIsFetchingReducer({ type });
const errorMessage = createErrorMessageReducer({ type });

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
