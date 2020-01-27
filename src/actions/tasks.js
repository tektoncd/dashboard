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

import { getClusterTask, getClusterTasks, getTask, getTasks } from '../api';
import {
  fetchCollection,
  fetchNamespacedCollection,
  fetchNamespacedResource,
  fetchResource
} from './actionCreators';

export function fetchTask({ name, namespace }) {
  return fetchNamespacedResource('Task', getTask, { name, namespace });
}

export function fetchClusterTask(name) {
  return fetchResource('ClusterTask', getClusterTask, { name });
}

export function fetchTasks({ filters, namespace } = {}) {
  return fetchNamespacedCollection('Task', getTasks, { filters, namespace });
}

export function fetchClusterTasks({ filters } = {}) {
  return fetchCollection('ClusterTask', getClusterTasks, { filters });
}

export function fetchTaskByType(name, type, namespace) {
  if (type === 'clustertasks') {
    return fetchClusterTask(name);
  }
  return fetchTask({ name, namespace });
}
