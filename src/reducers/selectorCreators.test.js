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

import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import { getCollection, getResource } from './selectorCreators';

it('getCollection', () => {
  const id = 'id';
  const name = 'name';
  const resource = { fake: 'resource' };
  const namespace = 'namespace';
  const state = {
    byNamespace: {
      [namespace]: { [name]: id },
      anotherNamespace: { foo: 123 }
    },
    byId: { [id]: resource }
  };
  expect(getCollection(state, namespace)).toEqual([resource]);
});

it('getCollection all namespaces', () => {
  const resource = { fake: 'resource' };
  const state = { byId: { id: resource } };
  expect(getCollection(state, ALL_NAMESPACES)).toEqual([resource]);
});

it('getCollection empty', () => {
  const namespace = 'namespace';
  const state = { byNamespace: {} };
  expect(getCollection(state, namespace)).toEqual([]);
});

it('getResource', () => {
  const id = 'id';
  const name = 'name';
  const namespace = 'namespace';
  const resource = { fake: 'resource' };
  const state = {
    byNamespace: { [namespace]: { [name]: id } },
    byId: { [id]: resource }
  };
  expect(getResource(state, name, namespace)).toEqual(resource);
});

it('getResource null', () => {
  const name = 'name';
  const namespace = 'namespace';
  const state = { byNamespace: {} };
  expect(getResource(state, name, namespace)).toBeNull();
});
