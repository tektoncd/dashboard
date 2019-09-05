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
import merge from 'lodash.merge';

import { isStale, typeToPlural } from '../utils';

function createByIdReducer({ type }) {
  const typePlural = typeToPlural(type);
  return function byId(state = {}, action) {
    switch (action.type) {
      case `${type}Created`:
      case `${type}Updated`:
        if (isStale(action.payload, state)) {
          return state;
        }
        return {
          ...state,
          [action.payload.metadata.uid]: action.payload
        };
      case `${type}Deleted`:
        const newState = { ...state };
        delete newState[action.payload.metadata.uid];
        return newState;
      case `${typePlural}_FETCH_SUCCESS`:
        return {
          ...state,
          ...keyBy(
            action.data.filter(resource => !isStale(resource, state)),
            'metadata.uid'
          )
        };
      default:
        return state;
    }
  };
}

function createByNamespaceReducer({ type }) {
  const typePlural = typeToPlural(type);
  return function byNamespace(state = {}, action) {
    switch (action.type) {
      case `${type}Created`:
      case `${type}Updated`:
        const resource = {
          [action.payload.metadata.namespace]: {
            [action.payload.metadata.name]: action.payload.metadata.uid
          }
        };
        return merge({}, state, resource);
      case `${type}Deleted`:
        const newState = { ...state };
        if (!newState[action.payload.metadata.namespace]) {
          return newState;
        }
        delete newState[action.payload.metadata.namespace][
          action.payload.metadata.name
        ];
        return newState;
      case `${typePlural}_FETCH_SUCCESS`:
        const namespaces = action.data.reduce(
          (accumulator, pipelineResource) => {
            const { name, namespace, uid } = pipelineResource.metadata;
            return merge(accumulator, {
              [namespace]: {
                [name]: uid
              }
            });
          },
          {}
        );

        return merge({}, state, namespaces);
      default:
        return state;
    }
  };
}

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

export function createNamespacedReducer({ type }) {
  return combineReducers({
    byId: createByIdReducer({ type }),
    byNamespace: createByNamespaceReducer({ type }),
    errorMessage: createErrorMessageReducer({ type }),
    isFetching: createIsFetchingReducer({ type })
  });
}
