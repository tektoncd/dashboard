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
import * as API from './serviceAccounts';
import { mockCSRFToken } from '../utils/test';

const uri = 'http://example.com';

it('generateBodyForSecretPatching should return secretResponse with the name Groot', () => {
  const secretName = 'Groot';
  const secretResponse = [
    {
      op: 'add',
      path: 'serviceaccount/secrets/-',
      value: {
        name: secretName
      }
    }
  ];
  const result = API.generateBodyForSecretPatching(secretName);
  expect(result).toMatchObject(secretResponse);
  expect(result).toMatchObject(API.generateBodyForSecretPatching(secretName));
});

it('patchAddSecret should return correct data from patching', () => {
  const data = {
    fake: 'data'
  };
  mockCSRFToken();
  fetchMock.mock(uri, data);
  return API.patchAddSecret(uri, data).then(response => {
    expect(response).toEqual(data);
    fetchMock.restore();
  });
});

it('patchServiceAccount', () => {
  const data = { fake: 'serviceAccount' };
  jest.spyOn(API, 'patchAddSecret').mockImplementation(() => data);
  mockCSRFToken();
  fetchMock.patch(/serviceaccounts/, data);
  return API.patchServiceAccount('default', 'default', 'secret-name').then(
    response => {
      expect(response).toEqual(data);
      fetchMock.restore();
    }
  );
});

it('getServiceAccount returns the correct data', () => {
  const data = { items: 'serviceaccounts' };
  fetchMock.get(/serviceaccounts/, data);
  return API.getServiceAccount({ name: 'default', namespace: 'default' }).then(
    response => {
      expect(response).toEqual(data);
      fetchMock.restore();
    }
  );
});

it('getServiceAccounts returns the correct data', () => {
  const data = { items: 'serviceaccounts' };
  fetchMock.get(/serviceaccounts/, data);
  return API.getServiceAccounts().then(response => {
    expect(response).toEqual(data.items);
    fetchMock.restore();
  });
});
