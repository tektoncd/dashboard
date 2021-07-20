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

import { getLocale, getNamespaces, getSelectedNamespace } from '.';
import * as localeSelectors from './locale';
import * as namespaceSelectors from './namespaces';

const locale = 'it';
const namespace = 'default';
const state = {
  locale: { selected: locale },
  namespaces: {
    selected: namespace
  }
};

it('getLocale', () => {
  jest.spyOn(localeSelectors, 'getLocale').mockImplementation(() => locale);
  expect(getLocale(state)).toEqual(locale);
  expect(localeSelectors.getLocale).toHaveBeenCalledWith(state.locale);
});

it('getSelectedNamespace', () => {
  jest
    .spyOn(namespaceSelectors, 'getSelectedNamespace')
    .mockImplementation(() => namespace);
  expect(getSelectedNamespace(state)).toEqual(namespace);
  expect(namespaceSelectors.getSelectedNamespace).toHaveBeenCalledWith(
    state.namespaces
  );
});

it('getNamespaces', () => {
  const namespaces = [namespace];
  jest
    .spyOn(namespaceSelectors, 'getNamespaces')
    .mockImplementation(() => namespaces);
  expect(getNamespaces(state)).toEqual(namespaces);
  expect(namespaceSelectors.getNamespaces).toHaveBeenCalledWith(
    state.namespaces
  );
});
