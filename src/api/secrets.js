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

import { deleteRequest, get, post, put } from './comms';
import { checkData, getKubeAPI } from './utils';

export function getSecrets({ namespace } = {}) {
  const uri = getKubeAPI('secrets', { namespace });
  return get(uri).then(checkData);
}

export function getAllSecrets(namespace) {
  const uri = getKubeAPI('secrets', namespace);
  return get(uri);
}

export function getSecret(name, namespace) {
  const uri = getKubeAPI('secrets', name, namespace);
  return get(uri);
}

export function createSecret({ id, ...rest }, namespace) {
  const uri = getKubeAPI('secrets', { namespace });
  return post(uri, { id, ...rest });
}

export function updateSecret({ id, ...rest }, namespace) {
  const uri = getKubeAPI('secrets', { name: id, namespace });
  return put(uri, { id, ...rest });
}

export function deleteSecret(id, namespace) {
  const uri = getKubeAPI('secrets', { name: id, namespace });
  return deleteRequest(uri);
}
