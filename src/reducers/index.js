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

import { combineReducers } from 'redux';

import locale, * as localeSelectors from './locale';
import namespaces, * as namespaceSelectors from './namespaces';
import notifications, * as notificationSelectors from './notifications';

export default combineReducers({
  locale,
  namespaces,
  notifications
});

export function getSelectedNamespace(state) {
  return namespaceSelectors.getSelectedNamespace(state.namespaces);
}

export function getNamespaces(state) {
  return namespaceSelectors.getNamespaces(state.namespaces);
}

export function isFetchingNamespaces(state) {
  return namespaceSelectors.isFetchingNamespaces(state.namespaces);
}

export function getLocale(state) {
  return localeSelectors.getLocale(state.locale);
}

export function isWebSocketConnected(state) {
  return notificationSelectors.isWebSocketConnected(state.notifications);
}
