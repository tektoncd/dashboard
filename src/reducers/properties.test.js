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

import propertiesReducer, * as selectors from './properties';

it('handles init or unknown actions', () => {
  expect(propertiesReducer(undefined, { type: 'does_not_exist' })).toEqual({
    ReadOnly: true
  });
});

it('INSTALL_PROPERTIES_SUCCESS', () => {
  const installProperties = {
    fake: 'installProperties',
    ReadOnly: false,
    IsOpenShift: false,
    LogoutURL: '/logout',
    DashboardNamespace: 'ns-dashboard',
    DashboardVersion: 'version-dashboard',
    PipelineNamespace: 'ns-pipeline',
    PipelineVersion: 'version-pipeline',
    TriggersNamespace: 'ns-triggers',
    TriggersVersion: 'version-triggers',
    TenantNamespace: 'ns-tenant'
  };

  const action = {
    type: 'INSTALL_PROPERTIES_SUCCESS',
    data: installProperties
  };

  const state = propertiesReducer({}, action);
  expect(selectors.isReadOnly(state)).toBe(false);
  expect(selectors.isOpenShift(state)).toBe(false);
  expect(selectors.isTriggersInstalled(state)).toBe(true);
  expect(selectors.getLogoutURL(state)).toBe('/logout');
  expect(selectors.getDashboardNamespace(state)).toBe('ns-dashboard');
  expect(selectors.getDashboardVersion(state)).toBe('version-dashboard');
  expect(selectors.getPipelineNamespace(state)).toBe('ns-pipeline');
  expect(selectors.getPipelineVersion(state)).toBe('version-pipeline');
  expect(selectors.getTriggersNamespace(state)).toBe('ns-triggers');
  expect(selectors.getTriggersVersion(state)).toBe('version-triggers');
  expect(selectors.getTenantNamespace(state)).toBe('ns-tenant');
});
