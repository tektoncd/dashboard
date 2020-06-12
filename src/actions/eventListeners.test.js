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
import { fetchEventListener, fetchEventListeners } from './eventListeners';

it('fetchEventListener', async () => {
  jest.spyOn(creators, 'fetchNamespacedResource');
  const name = 'EventListenerName';
  const namespace = 'namespace';
  fetchEventListener({ name, namespace });
  expect(creators.fetchNamespacedResource).toHaveBeenCalledWith(
    'EventListener',
    API.getEventListener,
    { name, namespace }
  );
});

it('fetchEventListeners', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  const namespace = 'namespace';
  const filters = ['someFilter'];
  fetchEventListeners({ filters, namespace });
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'EventListener',
    API.getEventListeners,
    {
      namespace,
      filters
    }
  );
});

it('fetchEventListeners no namespace', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  fetchEventListeners();
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'EventListener',
    API.getEventListeners,
    {
      namespace: undefined
    }
  );
});
