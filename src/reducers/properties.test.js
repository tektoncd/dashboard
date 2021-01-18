/*
Copyright 2020-2021 The Tekton Authors
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
  const ExternalLogsURL = 'fake_logs_url';
  const installProperties = {
    fake: 'installProperties',
    ExternalLogsURL,
    IsOpenShift: false,
    LogoutURL: '/logout',
    DashboardNamespace: 'ns-dashboard',
    DashboardVersion: 'version-dashboard',
    PipelineNamespace: 'ns-pipeline',
    PipelineVersion: 'version-pipeline',
    ReadOnly: false,
    StreamLogs: true,
    TenantNamespace: 'ns-tenant',
    TriggersNamespace: 'ns-triggers',
    TriggersVersion: 'version-triggers'
  };

  const action = {
    type: 'INSTALL_PROPERTIES_SUCCESS',
    data: installProperties
  };

  const state = propertiesReducer({}, action);
  expect(selectors.isReadOnly(state)).toEqual(false);
  expect(selectors.isOpenShift(state)).toEqual(false);
  expect(selectors.isTriggersInstalled(state)).toEqual(true);
  expect(selectors.isLogStreamingEnabled(state)).toEqual(true);
  expect(selectors.getExternalLogsURL(state)).toEqual(ExternalLogsURL);
  expect(selectors.getLogoutURL(state)).toEqual('/logout');
  expect(selectors.getDashboardNamespace(state)).toEqual('ns-dashboard');
  expect(selectors.getDashboardVersion(state)).toEqual('version-dashboard');
  expect(selectors.getPipelineNamespace(state)).toEqual('ns-pipeline');
  expect(selectors.getPipelineVersion(state)).toEqual('version-pipeline');
  expect(selectors.getTriggersNamespace(state)).toEqual('ns-triggers');
  expect(selectors.getTriggersVersion(state)).toEqual('version-triggers');
  expect(selectors.getTenantNamespace(state)).toEqual('ns-tenant');
});

it('CLIENT_PROPERTIES_SUCCESS', () => {
  const action = { type: 'CLIENT_PROPERTIES_SUCCESS' };

  const state = propertiesReducer({}, action);
  expect(selectors.isReadOnly(state)).toEqual(false);
  expect(selectors.isTriggersInstalled(state)).toEqual(true);
  expect(selectors.getDashboardNamespace(state)).toEqual('N/A');
  expect(selectors.getDashboardVersion(state)).toEqual('kubectl-proxy-client');
  expect(selectors.getPipelineNamespace(state)).toEqual('Unknown');
  expect(selectors.getPipelineVersion(state)).toEqual('Unknown');
  expect(selectors.getTriggersNamespace(state)).toEqual('Unknown');
  expect(selectors.getTriggersVersion(state)).toEqual('Unknown');
});
