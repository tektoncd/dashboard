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

import fetchMock from 'fetch-mock';
import * as API from './secrets';
import { mockCSRFToken } from '../utils/test';

it('getSecrets', () => {
  const data = {
    items: 'secrets'
  };
  fetchMock.get(/secrets/, data);
  return API.getSecrets().then(response => {
    expect(response).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getAllSecrets', () => {
  const data = {
    items: 'secrets'
  };
  fetchMock.get(/secrets/, data);
  return API.getAllSecrets().then(response => {
    expect(response).toEqual(data);
    fetchMock.restore();
  });
});

it('getSecret', () => {
  const secretId = 'foo';
  const namespace = 'default';
  const data = { fake: 'secret' };
  fetchMock.get(/secrets/, data);
  return API.getSecret(secretId, namespace).then(secret => {
    expect(secret).toEqual(data);
    fetchMock.restore();
  });
});

it('createSecret', () => {
  const id = 'id';
  const username = 'username';
  const password = 'password';
  const type = 'type';
  const payload = { id, username, password, type };
  const data = { fake: 'data' };
  mockCSRFToken();
  fetchMock.post('*', data);
  return API.createSecret(payload).then(response => {
    expect(response).toEqual(data);
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
    fetchMock.restore();
  });
});

it('updateSecret', () => {
  const id = 'id';
  const username = 'username';
  const password = 'password';
  const type = 'type';
  const payload = { id, username, password, type };
  const data = { fake: 'data' };
  mockCSRFToken();
  fetchMock.put('*', data);
  return API.updateSecret(payload).then(response => {
    expect(response).toEqual(data);
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
    fetchMock.restore();
  });
});

it('deleteSecret', () => {
  const secretId = 'fake secret id';
  const data = { fake: 'data' };
  mockCSRFToken();
  fetchMock.delete('*', data);
  return API.deleteSecret(secretId).then(response => {
    expect(response).toEqual(data);
    fetchMock.restore();
  });
});
