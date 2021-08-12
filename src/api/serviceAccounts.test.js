/*
Copyright 2019-2021 The Tekton Authors
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
import * as utils from './utils';

it('getServiceAccounts returns the correct data', () => {
  const data = { items: 'serviceaccounts' };
  fetchMock.get(/serviceaccounts/, data);
  return API.getServiceAccounts().then(response => {
    expect(response).toEqual(data);
    fetchMock.restore();
  });
});

it('useServiceAccounts', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useServiceAccounts(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      api: API.getServiceAccounts,
      kind: 'ServiceAccount',
      params
    })
  );
});
