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

import { get, patch } from './comms';
import { checkData, getKubeAPI } from './utils';

export function getServiceAccount({ name, namespace }) {
  const uri = getKubeAPI('serviceaccounts', { name, namespace });
  return get(uri);
}

export function getServiceAccounts({ namespace } = {}) {
  const uri = getKubeAPI('serviceaccounts', { namespace });
  return get(uri).then(checkData);
}

export function generateBodyForSecretPatching(secretName) {
  const patchAddBody = [
    {
      op: 'add',
      path: 'serviceaccount/secrets/-',
      value: {
        name: secretName
      }
    }
  ];

  return patchAddBody;
}

export function generateBodyForSecretReplacing(remainingSecrets) {
  const replaceBody = [
    {
      op: 'replace',
      path: 'serviceaccount/secrets',
      value: remainingSecrets
    }
  ];
  return replaceBody;
}

export async function patchAddSecret(uri, secretName) {
  const patchAddBody = await generateBodyForSecretPatching(secretName);
  return patch(uri, patchAddBody);
}

export async function patchUpdateSecrets(uri, secrets) {
  const patchReplaceBody = await generateBodyForSecretReplacing(secrets);
  return patch(uri, patchReplaceBody);
}

export async function patchServiceAccount({
  serviceAccountName,
  namespace,
  secretName
}) {
  const uri = getKubeAPI('serviceaccounts', {
    name: serviceAccountName,
    namespace
  });
  const patch1 = await patchAddSecret(uri, secretName);
  return patch1;
}

// Use this for unpatching ServiceAccounts
export async function updateServiceAccountSecrets(
  sa,
  namespace,
  secretsToKeep
) {
  const uri = getKubeAPI('serviceaccounts', {
    name: sa.metadata.name,
    namespace
  });
  return patchUpdateSecrets(uri, secretsToKeep);
}
