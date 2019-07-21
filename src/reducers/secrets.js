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
import merge from 'lodash.merge';

import { ALL_NAMESPACES } from '../constants';

function byNamespace(state = {}, action) {
  switch (action.type) {
    case 'SECRETS_FETCH_SUCCESS':
      const namespaces = action.data.reduce((accumulator, secret) => {
        const { namespace, name } = secret;
        return merge(accumulator, {
          [namespace]: {
            [name]: { ...secret }
          }
        });
      }, {});
      return merge({}, state, namespaces);
    case 'SECRET_DELETE_SUCCESS':
      const newState = state;
      action.secrets.forEach(secret => {
        const { name, namespace } = secret;
        delete newState[namespace][name];
      });
      return newState;
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
    case 'SECRET_DELETE_SUCCESS':
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
    case 'CLEAR_SECRET_ERROR_NOTIFICATION':
      return null;
    default:
      return state;
  }
}

export default combineReducers({
  byNamespace,
  errorMessage,
  isFetching
});

export function getSecrets(state, namespace) {
  let secrets = [];
  if (namespace === ALL_NAMESPACES) {
    Object.values(state.byNamespace).forEach(secretsByNamespace => {
      secrets = secrets.concat(Object.values(secretsByNamespace));
    });
    return secrets;
  }

  return Object.values(state.byNamespace[namespace] || []);
}

export function getSecretsErrorMessage(state) {
  return state.errorMessage;
}

export function isFetchingSecrets(state) {
  return state.isFetching;
}
