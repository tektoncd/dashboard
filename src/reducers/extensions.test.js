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

import extensionsReducer, * as selectors from './extensions';

it('handles init or unknown actions', () => {
  expect(extensionsReducer(undefined, { type: 'does_not_exist' })).toEqual({
    byName: {},
    errorMessage: null,
    isFetching: false
  });
});

it('EXTENSIONS_FETCH_REQUEST', () => {
  const action = { type: 'EXTENSIONS_FETCH_REQUEST' };
  const state = extensionsReducer({}, action);
  expect(selectors.isFetchingExtensions(state)).toBe(true);
});

it('EXTENSIONS_FETCH_SUCCESS', () => {
  const name = 'extension name';
  const extension = {
    name,
    other: 'content'
  };
  const action = {
    type: 'EXTENSIONS_FETCH_SUCCESS',
    data: [extension]
  };

  const state = extensionsReducer({}, action);
  expect(selectors.getExtensions(state)).toEqual([extension]);
  expect(selectors.getExtension(state, name)).toEqual(extension);
  expect(selectors.isFetchingExtensions(state)).toBe(false);
});

it('EXTENSIONS_FETCH_FAILURE', () => {
  const message = 'fake error message';
  const error = { message };
  const action = {
    type: 'EXTENSIONS_FETCH_FAILURE',
    error
  };

  const state = extensionsReducer({}, action);
  expect(selectors.getExtensionsErrorMessage(state)).toEqual(message);
});

it('ResourceExtension Events', () => {
  const extension = {
    spec: {
      apiVersion: 'batch/v1beta1',
      displayname: 'before',
      name: 'cronjobs'
    }
  };

  const action = {
    type: 'ResourceExtensionCreated',
    payload: extension
  };

  const state = extensionsReducer({}, action);
  expect(selectors.getExtensions(state)).toEqual([
    selectors.mapResourceExtension(extension)
  ]);
  expect(selectors.isFetchingExtensions(state)).toBe(false);

  const updatedExtension = {
    spec: {
      apiVersion: 'batch/v1beta1',
      displayname: 'after',
      name: 'cronjobs'
    }
  };

  const updateAction = {
    type: 'ResourceExtensionUpdated',
    payload: updatedExtension
  };

  const updatedState = extensionsReducer(state, updateAction);
  expect(selectors.getExtensions(updatedState)).toEqual([
    selectors.mapResourceExtension(updatedExtension)
  ]);
  expect(selectors.isFetchingExtensions(updatedState)).toBe(false);

  const deleteAction = {
    type: 'ResourceExtensionDeleted',
    payload: updatedExtension
  };

  const deletedState = extensionsReducer(state, deleteAction);
  expect(selectors.getExtensions(deletedState)).toEqual([]);
  expect(selectors.isFetchingExtensions(deletedState)).toBe(false);
});

it('ServiceExtension Events', () => {
  const extension = {
    bundlelocation: 'bundle',
    displayname: 'before',
    name: 'sample-extension'
  };

  const action = {
    type: 'ServiceExtensionCreated',
    payload: extension
  };

  const state = extensionsReducer({}, action);
  expect(selectors.getExtensions(state)).toEqual([
    selectors.mapServiceExtension(extension)
  ]);
  expect(selectors.isFetchingExtensions(state)).toBe(false);

  const updatedExtension = {
    bundlelocation: 'bundle',
    displayname: 'after',
    name: 'sample-extension'
  };

  const updateAction = {
    type: 'ServiceExtensionUpdated',
    payload: updatedExtension
  };

  const updatedState = extensionsReducer(state, updateAction);
  expect(selectors.getExtensions(updatedState)).toEqual([
    selectors.mapServiceExtension(updatedExtension)
  ]);
  expect(selectors.isFetchingExtensions(updatedState)).toBe(false);

  const deleteAction = {
    type: 'ServiceExtensionDeleted',
    payload: updatedExtension
  };

  const deletedState = extensionsReducer(state, deleteAction);
  expect(selectors.getExtensions(deletedState)).toEqual([]);
  expect(selectors.isFetchingExtensions(deletedState)).toBe(false);
});
