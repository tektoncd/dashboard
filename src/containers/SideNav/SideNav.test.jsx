/*
Copyright 2019-2024 The Tekton Authors
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

import { waitFor } from '@testing-library/react';

import { renderWithRouter } from '../../utils/test';
import * as API from '../../api';
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
  const { queryByText, rerender } = renderWithRouter(<SideNav expanded />);
  expect(queryByText(/Tekton resources/)).toBeTruthy();

  renderWithRouter(<SideNav />, { rerender });
  expect(queryByText(/Tekton resources/)).toBeFalsy();
});

it('SideNav renders with extensions', () => {
  vi.spyOn(extensionsAPI, 'useExtensions').mockImplementation(() => ({
    data: mockExtensions
  }));
  const { queryByText } = renderWithRouter(<SideNav expanded />);
  expect(queryByText('Pipelines')).toBeTruthy();
  expect(queryByText('Tasks')).toBeTruthy();
  expect(queryByText(/dashboard_crd_extension/i)).toBeTruthy();
});

it('SideNav renders with triggers', async () => {
  vi.spyOn(API, 'useIsTriggersInstalled').mockImplementation(() => true);
  const { queryByText } = renderWithRouter(<SideNav expanded />);
  await waitFor(() => queryByText(/about/i));
  expect(queryByText('Pipelines')).toBeTruthy();
  expect(queryByText('Tasks')).toBeTruthy();
  await waitFor(() => queryByText('EventListeners'));
  expect(queryByText('TriggerTemplates')).toBeTruthy();
  expect(queryByText('TriggerBindings')).toBeTruthy();
});

it('SideNav renders import in the default read-write mode', async () => {
  const { queryByText } = renderWithRouter(<SideNav expanded />);
  await waitFor(() => queryByText(/Import/i));
});

it('SideNav does not render import in read-only mode', async () => {
  vi.spyOn(API, 'useIsReadOnly').mockImplementation(() => true);
  const { queryByText } = renderWithRouter(<SideNav expanded isReadOnly />);
  await waitFor(() => queryByText(/about/i));
  expect(queryByText(/import/i)).toBeFalsy();
});

it('SideNav renders kubernetes resources placeholder', async () => {
  const { queryByText } = renderWithRouter(
    <SideNav expanded showKubernetesResources />
  );
  await waitFor(() => queryByText('placeholder'));
});
