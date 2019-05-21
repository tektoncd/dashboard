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

function byId(state = {}, action) {
  switch (action.type) {
    case 'SERVICE_ACCOUNTS_FETCH_SUCCESS':
      return { ...state, ...keyBy(action.data, 'metadata.uid') };
    default:
      return state;
  }
}

function byNamespace(state = {}, action) {
  switch (action.type) {
    case 'SERVICE_ACCOUNTS_FETCH_SUCCESS':
      const namespaces = action.data.reduce((accumulator, serviceAccount) => {
        const { name, namespace, uid } = serviceAccount.metadata;
        return merge(accumulator, {
          [namespace]: {
            [name]: uid
          }
        });
      }, {});

      return merge({}, state, namespaces);
    default:
      return state;
  }
}

function isFetching(state = false, action) {
  switch (action.type) {
    case 'SERVICE_ACCOUNTS_FETCH_REQUEST':
      return true;
    case 'SERVICE_ACCOUNTS_FETCH_SUCCESS':
    case 'SERVICE_ACCOUNTS_FETCH_FAILURE':
      return false;
    default:
      return state;
  }
}

function errorMessage(state = null, action) {
  switch (action.type) {
    case 'SERVICE_ACCOUNTS_FETCH_FAILURE':
      return action.error.message;
    case 'SERVICE_ACCOUNTS_FETCH_REQUEST':
    case 'SERVICE_ACCOUNTS_FETCH_SUCCESS':
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

export function getServiceAccounts(state, namespace) {
  const serviceAccounts = state.byNamespace[namespace];
  return serviceAccounts
    ? Object.values(serviceAccounts).map(id => state.byId[id])
    : [];
}

export function getServiceAccountsErrorMessage(state) {
  return state.errorMessage;
}

export function isFetchingServiceAccounts(state) {
  return state.isFetching;
}
