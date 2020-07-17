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

it('getCredentials', () => {
  const data = {
    items: 'credentials'
  };
  fetchMock.get(/secrets/, data);
  return API.getCredentials().then(response => {
    expect(response).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getAllCredentials', () => {
  const data = {
    items: 'credentials'
  };
  fetchMock.get(/secrets/, data);
  return API.getAllCredentials().then(response => {
    expect(response).toEqual(data);
    fetchMock.restore();
  });
});

it('getCredential', () => {
  const credentialId = 'foo';
  const namespace = 'default';
  const data = { fake: 'credential' };
  fetchMock.get(/secrets/, data);
  return API.getCredential(credentialId, namespace).then(credential => {
    expect(credential).toEqual(data);
    fetchMock.restore();
  });
});

it('createCredential', () => {
  const id = 'id';
  const username = 'username';
  const password = 'password';
  const type = 'type';
  const payload = { id, username, password, type };
  const data = { fake: 'data' };
  mockCSRFToken();
  fetchMock.post('*', data);
  return API.createCredential(payload).then(response => {
    expect(response).toEqual(data);
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
    fetchMock.restore();
  });
});

it('updateCredential', () => {
  const id = 'id';
  const username = 'username';
  const password = 'password';
  const type = 'type';
  const payload = { id, username, password, type };
  const data = { fake: 'data' };
  mockCSRFToken();
  fetchMock.put('*', data);
  return API.updateCredential(payload).then(response => {
    expect(response).toEqual(data);
    expect(fetchMock.lastOptions()).toMatchObject({
      body: JSON.stringify(payload)
    });
    fetchMock.restore();
  });
});

it('deleteCredential', () => {
  const credentialId = 'fake credential id';
  const data = { fake: 'data' };
  mockCSRFToken();
  fetchMock.delete('*', data);
  return API.deleteCredential(credentialId).then(response => {
    expect(response).toEqual(data);
    fetchMock.restore();
  });
});
