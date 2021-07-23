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

import React from 'react';
import { waitFor } from '@testing-library/react';

import { renderWithRouter } from '../../utils/test';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';
import * as extensionsAPI from '../../api/extensions';
import SideNav from './SideNav';

const mockExtensions = [
  {
    apiGroup: 'mygroup',
    apiVersion: 'v1alpha1',
    displayName: 'dashboard_crd_extension',
    name: 'crd-extension'
  },
  {
    apiGroup: 'mygroup',
    apiVersion: 'v1alpha1',
    displayName: 'dashboard_cluster_crd_extension',
    name: 'cluster-crd-extension',
    namespaced: false
  }
];

it('SideNav renders only when expanded', () => {
  const namespace = 'default';
  const { queryByText, rerender } = renderWithRouter(
    <SideNav
      expanded
      location={{ search: '' }}
      match={{ params: { namespace } }}
    />
  );
  expect(queryByText(/Tekton/)).toBeTruthy();

  renderWithRouter(
    <SideNav location={{ search: '' }} match={{ params: { namespace } }} />,
    { rerender }
  );
  expect(queryByText(/Tekton/)).toBeFalsy();
});

it('SideNav renders with extensions', () => {
  jest
    .spyOn(extensionsAPI, 'useExtensions')
    .mockImplementation(() => ({ data: mockExtensions }));
  const { queryByText } = renderWithRouter(
    <SideNav expanded location={{ search: '' }} />
  );
  expect(queryByText('Pipelines')).toBeTruthy();
  expect(queryByText('Tasks')).toBeTruthy();
  expect(queryByText(/dashboard_crd_extension/i)).toBeTruthy();
});

it('SideNav renders with triggers', async () => {
  jest.spyOn(API, 'useIsTriggersInstalled').mockImplementation(() => true);
  const { queryByText } = renderWithRouter(
    <SideNav expanded location={{ search: '' }} />
  );
  await waitFor(() => queryByText(/about/i));
  expect(queryByText('Pipelines')).toBeTruthy();
  expect(queryByText('Tasks')).toBeTruthy();
  await waitFor(() => queryByText('EventListeners'));
  expect(queryByText('TriggerTemplates')).toBeTruthy();
  expect(queryByText('TriggerBindings')).toBeTruthy();
});

it('SideNav selects namespace based on URL', () => {
  const namespace = 'default';
  const selectNamespace = jest.fn();
  jest
    .spyOn(APIUtils, 'useSelectedNamespace')
    .mockImplementation(() => ({ selectedNamespace: null, selectNamespace }));
  const { rerender } = renderWithRouter(
    <SideNav
      expanded
      location={{ search: '' }}
      match={{ params: { namespace } }}
      selectNamespace={selectNamespace}
    />
  );
  expect(selectNamespace).toHaveBeenCalledWith(namespace);

  const updatedNamespace = 'another';

  renderWithRouter(
    <SideNav
      expanded
      location={{ search: '' }}
      match={{ params: { namespace: updatedNamespace } }}
      selectNamespace={selectNamespace}
    />,
    { rerender }
  );
  expect(selectNamespace).toHaveBeenCalledWith(updatedNamespace);

  renderWithRouter(
    <SideNav
      expanded
      location={{ search: '' }}
      match={{ params: { namespace: updatedNamespace } }}
      selectNamespace={selectNamespace}
    />,
    { rerender }
  );
  expect(selectNamespace).toHaveBeenCalledTimes(2);
});

it('SideNav renders import in the default read-write mode', async () => {
  const { queryByText } = renderWithRouter(
    <SideNav expanded location={{ search: '' }} />
  );
  await waitFor(() => queryByText(/Import/i));
});

it('SideNav does not render import in read-only mode', async () => {
  jest.spyOn(API, 'useIsReadOnly').mockImplementation(() => true);
  const { queryByText } = renderWithRouter(
    <SideNav expanded isReadOnly location={{ search: '' }} />
  );
  await waitFor(() => queryByText(/about/i));
  expect(queryByText(/import/i)).toBeFalsy();
});

it('SideNav renders kubernetes resources placeholder', async () => {
  const { queryByText } = renderWithRouter(
    <SideNav expanded location={{ search: '' }} showKubernetesResources />
  );
  await waitFor(() => queryByText('placeholder'));
});
