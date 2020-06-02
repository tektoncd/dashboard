/*
Copyright 2020 The Tekton Authors
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
import { fetchCondition, fetchConditions } from './conditions';

it('fetchCondition', async () => {
  jest.spyOn(creators, 'fetchNamespacedResource');
  const name = 'conditionName';
  const namespace = 'default';
  fetchCondition({ name, namespace });
  expect(creators.fetchNamespacedResource).toHaveBeenCalledWith(
    'Condition',
    API.getCondition,
    { name, namespace }
  );
});

it('fetchConditions', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  const namespace = 'namespace';
  fetchConditions({ namespace });
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'Condition',
    API.getConditions,
    { namespace }
  );
});

it('fetchConditions no namespace', async () => {
  jest.spyOn(creators, 'fetchNamespacedCollection');
  fetchConditions();
  expect(creators.fetchNamespacedCollection).toHaveBeenCalledWith(
    'Condition',
    API.getConditions,
    { namespace: undefined }
  );
});
