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

import { getTriggerBinding, getTriggerBindings } from '../api';
import {
  fetchNamespacedCollection,
  fetchNamespacedResource
} from './actionCreators';

export function fetchTriggerBinding({ name, namespace }) {
  return fetchNamespacedResource('TriggerBinding', getTriggerBinding, {
    name,
    namespace
  });
}

export function fetchTriggerBindings({ filters, namespace } = {}) {
  return fetchNamespacedCollection('TriggerBinding', getTriggerBindings, {
    filters,
    namespace
  });
}
