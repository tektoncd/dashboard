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

const defaultState = { ReadOnly: true };
function properties(state = defaultState, action) {
  switch (action.type) {
    case 'INSTALL_PROPERTIES_SUCCESS':
      return action.data;
    default:
      return state;
  }
}

export function isReadOnly(state) {
  return state.ReadOnly;
}

export function isOpenShift(state) {
  return state.IsOpenShift;
}

export function isTriggersInstalled(state) {
  return !!(state.TriggersNamespace && state.TriggersVersion);
}

export function getLogoutURL(state) {
  return state.LogoutURL;
}

export function getDashboardNamespace(state) {
  return state.DashboardNamespace;
}

export function getDashboardVersion(state) {
  return state.DashboardVersion;
}

export function getPipelineNamespace(state) {
  return state.PipelineNamespace;
}

export function getPipelineVersion(state) {
  return state.PipelineVersion;
}

export function getTriggersNamespace(state) {
  return state.TriggersNamespace;
}

export function getTriggersVersion(state) {
  return state.TriggersVersion;
}

export function getTenantNamespace(state) {
  return state.TenantNamespace;
}

export function isLogStreamingEnabled(state) {
  return state.StreamLogs;
}

export function getExternalLogsURL(state) {
  return state.ExternalLogsURL;
}

export default properties;
