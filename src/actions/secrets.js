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

import {
  createCredential,
  deleteCredential,
  getAllCredentials,
  getCredentials,
  getServiceAccount,
  getServiceAccounts,
  patchServiceAccount,
  updateServiceAccountSecrets
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
          creationTimestamp: secret.metadata.creationTimestamp,
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

export function deleteSecret(secrets, cancelMethod) {
  return async dispatch => {
    dispatch({ type: 'SECRET_DELETE_REQUEST' });
    // This is where we first handle the unpatching (complicated section), and would benefit
    // from error handling and additional notifications on success/error
    const namespacesToSecretsMap = new Map();
    secrets.forEach(secret => {
      let foundSecretInfo = namespacesToSecretsMap.get(secret.namespace);
      if (foundSecretInfo) {
        foundSecretInfo.push(secret.name);
      } else {
        foundSecretInfo = [secret.name];
      }
      namespacesToSecretsMap.set(secret.namespace, foundSecretInfo);
    });

    /* Now we know the secrets for each namespace, iterate and determine which secrets
    should be removed from the SA. With the list of known secrets that stay,
    we finally do a replace type PATCH on the entire service account at once.
    This is used to ensure all data is still correct regardless of things like indexes changing
    which is the only way to remove secrets otherwise using the patch API */

    // For each namespace there are secrets in
    namespacesToSecretsMap.forEach(async function handleSecretUnpatching(
      value,
      namespace
    ) {
      // Get all the service accounts in the namespace
      const serviceAccounts = await getServiceAccounts({
        namespace
      });

      // For each service account found
      serviceAccounts.forEach(async serviceAccount => {
        let secretRemoved = false;
        const remainingSecrets = [];
        const allSecrets = serviceAccount.secrets;
        // For each secret found
        for (let x = 0; x < allSecrets.length; x += 1) {
          const secret = allSecrets[x].name;
          let found = false;
          let z = 0;
          // For each secret we want to delete
          while (!found && z < value.length) {
            const item = value[z];
            // Name matches?
            if (item === secret) {
              found = true;
              secretRemoved = true;
            }
            z += 1;
          }
          // Didn't find one to delete, so update listing of ones to keep
          if (!found) {
            const itemAsJson = { name: secret };
            remainingSecrets.push(itemAsJson);
          }
        }
        // One's been removed so we'll need to now replace the
        // ServiceAccount's secrets field with the ones to keep
        if (secretRemoved) {
          updateServiceAccountSecrets(
            serviceAccount,
            namespace,
            remainingSecrets
          );
        }
      });
    });

    // This is where we delete the credentials (kube secrets) themselves
    const timeoutLength = secrets.length * 1000;
    const deletePromises = secrets.map(secret => {
      const { name, namespace } = secret;
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
        cancelMethod();
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
        type: 'CLEAR_SECRET_ERROR_NOTIFICATION'
      });
      dispatch({
        type: 'SECRET_CREATE_SUCCESS'
      });
      return false;
    } catch (error) {
      const secrets = await getAllCredentials(namespace);
      secrets.items.forEach(secret => {
        if (secret.metadata.name === postData.metadata.name) {
          const message = `A secret already exists in namespace ${namespace} with name ${
            secret.metadata.name
          }`;
          dispatch({ type: 'SECRET_CREATE_FAILURE', error: message });
        }
      });
      if (!error.response) {
        error.response.text().then(message => {
          dispatch({ type: 'SECRET_CREATE_FAILURE', error: message });
        });
      }
      return true;
    }
  };
}

export function clearNotification() {
  return { type: 'CLEAR_SECRET_ERROR_NOTIFICATION' };
}
