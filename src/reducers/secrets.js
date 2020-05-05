/*
Copyright 2019-2020 The Tekton Authors
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
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { isStale } from '../utils';

function byNamespace(state = {}, action) {
  switch (action.type) {
    case 'SECRETS_FETCH_SUCCESS':
      const namespaces = action.data.reduce((accumulator, secret) => {
        const { metadata } = secret;
        const { name, namespace } = metadata;
        const secretsState = state[namespace] || {};
        if (isStale({ metadata }, secretsState, 'name')) {
          return state;
        }

        return merge(accumulator, {
          [namespace]: {
            [name]: { ...secret }
          }
        });
      }, {});
      return merge({}, state, namespaces);
    case 'SecretCreated':
    case 'SecretUpdated':
      const secretsState = state[action.payload.metadata.namespace] || {};
      if (
        isStale(action.payload, secretsState, 'name') ||
        action.payload.type !== 'kubernetes.io/basic-auth'
      ) {
        return state;
      }
      const secret = {
        [action.payload.metadata.namespace]: {
          [action.payload.metadata.name]: { ...action.payload }
        }
      };
      return merge({}, state, secret);
    case 'SecretDeleted':
      const newState = { ...state };
      const { name, namespace } = action.payload.metadata;
      if (newState[namespace]) {
        delete newState[namespace][name];
      }
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
    case 'SECRET_PATCH_REQUEST':
      return true;
    case 'SECRETS_FETCH_SUCCESS':
    case 'SECRET_CREATE_SUCCESS':
    case 'SECRET_DELETE_SUCCESS':
    case 'SECRET_PATCH_SUCCESS':
    case 'SECRETS_FETCH_FAILURE':
    case 'SECRET_DELETE_FAILURE':
    case 'SECRET_CREATE_FAILURE':
    case 'SECRET_PATCH_FAILURE':
      return false;
    default:
      return state;
  }
}

function errorMessage(state = null, action) {
  switch (action.type) {
    case 'SECRETS_FETCH_FAILURE':
    case 'SECRET_CREATE_FAILURE':
      return action.error;
    case 'CLEAR_SECRET_ERROR_NOTIFICATION':
    case 'SECRETS_FETCH_SUCCESS':
    case 'SECRET_CREATE_SUCCESS':
      return false;
    default:
      return state;
  }
}

function deleteErrorMessage(state = null, action) {
  switch (action.type) {
    case 'SECRET_DELETE_FAILURE':
      return action.error;
    case 'CLEAR_SECRET_ERROR_NOTIFICATION':
    case 'SECRET_DELETE_SUCCESS':
      return false;
    default:
      return state;
  }
}

function patchErrorMessage(state = null, action) {
  switch (action.type) {
    case 'SECRET_PATCH_FAILURE':
      return action.error;
    case 'CLEAR_SECRET_ERROR_NOTIFICATION':
    case 'SECRET_PATCH_SUCCESS':
      return false;
    default:
      return state;
  }
}

function createSuccessMessage(state = false, action) {
  switch (action.type) {
    case 'SECRET_CREATE_SUCCESS':
      return true;
    case 'RESET_CREATE_SECRET':
      return false;
    default:
      return state;
  }
}

function patchSuccessMessage(state = false, action) {
  switch (action.type) {
    case 'SECRET_PATCH_SUCCESS':
      return true;
    case 'CLEAR_SECRET_ERROR_NOTIFICATION':
      return false;
    default:
      return state;
  }
}

function deleteSuccessMessage(state = false, action) {
  switch (action.type) {
    case 'SECRET_DELETE_SUCCESS':
      return true;
    case 'CLEAR_SECRET_ERROR_NOTIFICATION':
    case 'SECRET_DELETE_FAILURE':
      return false;
    default:
      return state;
  }
}

export default combineReducers({
  byNamespace,
  errorMessage,
  deleteErrorMessage,
  createSuccessMessage,
  deleteSuccessMessage,
  isFetching,
  patchErrorMessage,
  patchSuccessMessage
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

export function getSecret(state, name, namespace) {
  const resources = state.byNamespace[namespace] || {};
  return resources[name];
}

export function getPatchSecretsErrorMessage(state) {
  return state.patchErrorMessage;
}

export function getSecretsErrorMessage(state) {
  return state.errorMessage;
}

export function getDeleteSecretsErrorMessage(state) {
  return state.deleteErrorMessage;
}

export function getCreateSecretsSuccessMessage(state) {
  return state.createSuccessMessage;
}

export function getPatchSecretsSuccessMessage(state) {
  return state.patchSuccessMessage;
}

export function getDeleteSecretsSuccessMessage(state) {
  return state.deleteSuccessMessage;
}

export function isFetchingSecrets(state) {
  return state.isFetching;
}
