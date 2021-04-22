/*
Copyright 2021 The Tekton Authors
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
import { fetchTrigger, fetchTriggers } from './triggers';

it('fetchTrigger', async () => {
  jest.spyOn(creators, 'fetchNamespacedResource');
  const name = 'TriggerName';
  const namespace = 'namespace';
  fetchTrigger({ name, namespace });
  expect(creators.fetchNamespacedResource).toHaveBeenCalledWith(
    'Trigger',
    API.getTrigger,
    {
      name,
      namespace
    }
  );
});

it('fetchTriggers', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  const namespace = 'namespace';
  const filters = ['someFilter'];
  fetchTriggers({ filters, namespace });
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'Trigger',
    API.getTriggers,
    {
      namespace,
      filters
    }
  );
});

it('fetchTriggers no namespace', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  fetchTriggers();
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'Trigger',
    API.getTriggers,
    {
      namespace: undefined
    }
  );
});
