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

import * as API from '../api';
import * as creators from './actionCreators';
import { fetchServiceAccount, fetchServiceAccounts } from './serviceAccounts';

it('fetchServiceAccounts', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  const namespace = 'namespace';
  fetchServiceAccounts({ namespace });
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'ServiceAccount',
    API.getServiceAccounts,
    {
      namespace
    }
  );
});

it('fetchServiceAccount', async () => {
  jest.spyOn(creators, 'fetchNamespacedResource');
  const name = 'service-account1';
  const namespace = 'namespace';
  fetchServiceAccount({ name, namespace });
  expect(creators.fetchNamespacedResource).toHaveBeenCalledWith(
    'ServiceAccount',
    API.getServiceAccount,
    {
      name,
      namespace
    }
  );
});

it('fetchServiceAccounts no namespace', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  fetchServiceAccounts();
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'ServiceAccount',
    API.getServiceAccounts,
    {
      namespace: undefined
    }
  );
});
