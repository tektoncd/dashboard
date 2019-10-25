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

import {
  createCredential,
  deleteCredential,
  getCredentials,
  getServiceAccount,
  patchServiceAccount,
  unpatchServiceAccount
} from '../api';
import { getSelectedNamespace } from '../reducers';

export function fetchSecretsSuccess(data) {
  return {
    type: 'SECRETS_FETCH_SUCCESS',
    data
  };
}

export function fetchSecrets({ namespace } = {}) {
  return async (dispatch, getState) => {
    dispatch({ type: 'SECRETS_FETCH_REQUEST' });
    let secrets;
    try {
      const selectedNamespace = namespace || getSelectedNamespace(getState());
      secrets = await getCredentials(selectedNamespace);
      const secretsFormatted = [];
      secrets.items.forEach(secret => {
        const object = {
          name: secret.metadata.name,
          namespace: secret.metadata.namespace,
          annotations: secret.metadata.annotations,
          type: secret.type
        };
        secretsFormatted.push(object);
      });
      dispatch(fetchSecretsSuccess(secretsFormatted));
    } catch (error) {
      dispatch({ type: 'SECRETS_FETCH_FAILURE', error });
    }
    return secrets;
  };
}

export function deleteSecret(secrets) {
  return async dispatch => {
    dispatch({ type: 'SECRET_DELETE_REQUEST' });
    const timeoutLength = secrets.length * 1000;
    const deletePromises = secrets.map(secret => {
      const { name, namespace } = secret;
      unpatchServiceAccount(name, namespace);
      const response = deleteCredential(name, namespace);
      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('An error occured deleting the secret(s).'));
        }, timeoutLength);
      });
      const deleteWithinTimePromise = Promise.race([response, timeout]);
      return deleteWithinTimePromise;
    });
    Promise.all(deletePromises)
      .then(() => {
        dispatch({
          type: 'SECRET_DELETE_SUCCESS'
        });
      })
      .catch(error => {
        dispatch({ type: 'SECRET_DELETE_FAILURE', error });
      });
  };
}

/* istanbul ignore next */
export function createSecret(postData, namespace) {
  return async dispatch => {
    dispatch({ type: 'SECRET_CREATE_REQUEST' });
    try {
      await createCredential(postData, namespace);
      const serviceAccount = await getServiceAccount({
        name: postData.metadata.labels.serviceAccount,
        namespace
      });
      await patchServiceAccount({
        serviceAccountName: serviceAccount.metadata.name,
        namespace: serviceAccount.metadata.namespace,
        secretName: postData.metadata.name
      });
      dispatch({
        type: 'SECRET_CREATE_SUCCESS'
      });
    } catch (error) {
      error.response.text().then(message => {
        dispatch({ type: 'SECRET_CREATE_FAILURE', error: message });
      });
    }
  };
}

export function clearNotification() {
  return { type: 'CLEAR_SECRET_ERROR_NOTIFICATION' };
}
