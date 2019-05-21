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

function byId(state = {}, action) {
  switch (action.type) {
    case 'SECRETS_FETCH_SUCCESS':
      return keyBy(action.data, 'name');
    case 'SECRET_DELETE_SUCCESS':
      const newState = state;
      delete newState[action.id];
      return newState;
    default:
      return state;
  }
}

function byNamespace(state = {}, action) {
  switch (action.type) {
    case 'SECRETS_FETCH_SUCCESS':
      const secrets = [];
      action.data.forEach((secret, index) => {
        const object = {
          uid: index.toString(),
          name: secret.name,
          type: secret.type,
          annotations: secret.url
        };
        secrets.push(object);
      });

      const { namespace } = action;
      return {
        ...state,
        [namespace]: secrets
      };
    default:
      return state;
  }
}

function isFetching(state = false, action) {
  switch (action.type) {
    case 'SECRETS_FETCH_REQUEST':
    case 'SECRET_DELETE_REQUEST':
    case 'SECRET_CREATE_REQUEST':
      return true;
    case 'SECRETS_FETCH_SUCCESS':
    case 'SECRETS_FETCH_FAILURE':
    case 'SECRET_DELETE_FAILURE':
    case 'SECRET_CREATE_FAILURE':
      return false;
    default:
      return state;
  }
}

function errorMessage(state = null, action) {
  switch (action.type) {
    case 'SECRETS_FETCH_FAILURE':
    case 'SECRET_DELETE_FAILURE':
    case 'SECRET_CREATE_FAILURE':
      return action.error.message;
    case 'SECRETS_FETCH_REQUEST':
    case 'SECRETS_FETCH_SUCCESS':
    case 'CLEAR_NOTIFICATION':
      return null;
    default:
      return state;
  }
}

export default combineReducers({
  byId,
  byNamespace,
  errorMessage,
  isFetching
});

export function getSecrets(state, namespace) {
  const secrets = state.byNamespace[namespace];
  return secrets;
}

export function getSecretsErrorMessage(state) {
  return state.errorMessage;
}

export function isFetchingSecrets(state) {
  return state.isFetching;
}
