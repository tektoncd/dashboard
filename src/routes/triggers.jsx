/*
Copyright 2024 The Tekton Authors
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

import { paths } from '@tektoncd/dashboard-utils';

import {
  ClusterInterceptors,
  ClusterTriggerBinding,
  ClusterTriggerBindings,
  EventListener,
  EventListeners,
  Interceptors,
  NamespacedRoute,
  Trigger,
  TriggerBinding,
  TriggerBindings,
  Triggers,
  TriggerTemplate,
  TriggerTemplates
} from '../containers';

export default [
  {
    path: paths.clusterInterceptors.all(),
    element: <ClusterInterceptors />
  },
  {
    path: paths.clusterTriggerBindings.all(),
    element: <ClusterTriggerBindings />
  },
  {
    path: paths.clusterTriggerBindings.byName(),
    element: <ClusterTriggerBinding />
  },
  {
    path: paths.eventListeners.all(),
    element: (
      <NamespacedRoute>
        <EventListeners />
      </NamespacedRoute>
    )
  },
  {
    path: paths.eventListeners.byNamespace(),
    element: (
      <NamespacedRoute>
        <EventListeners />
      </NamespacedRoute>
    )
  },
  {
    path: paths.eventListeners.byName(),
    element: (
      <NamespacedRoute isResourceDetails>
        <EventListener />
      </NamespacedRoute>
    )
  },
  {
    path: paths.triggers.all(),
    element: (
      <NamespacedRoute>
        <Triggers />
      </NamespacedRoute>
    )
  },
  {
    path: paths.triggers.byNamespace(),
    element: (
      <NamespacedRoute>
        <Triggers />
      </NamespacedRoute>
    )
  },
  {
    path: paths.triggers.byName(),
    element: (
      <NamespacedRoute isResourceDetails>
        <Trigger />
      </NamespacedRoute>
    )
  },
  {
    path: paths.triggerBindings.all(),
    element: (
      <NamespacedRoute>
        <TriggerBindings />
      </NamespacedRoute>
    )
  },
  {
    path: paths.triggerBindings.byNamespace(),
    element: (
      <NamespacedRoute>
        <TriggerBindings />
      </NamespacedRoute>
    )
  },
  {
    path: paths.triggerBindings.byName(),
    element: (
      <NamespacedRoute isResourceDetails>
        <TriggerBinding />
      </NamespacedRoute>
    )
  },
  {
    path: paths.triggerTemplates.all(),
    element: (
      <NamespacedRoute>
        <TriggerTemplates />
      </NamespacedRoute>
    )
  },
  {
    path: paths.triggerTemplates.byNamespace(),
    element: (
      <NamespacedRoute>
        <TriggerTemplates />
      </NamespacedRoute>
    )
  },
  {
    path: paths.triggerTemplates.byName(),
    element: (
      <NamespacedRoute isResourceDetails>
        <TriggerTemplate />
      </NamespacedRoute>
    )
  },
  {
    path: paths.interceptors.all(),
    element: (
      <NamespacedRoute>
        <Interceptors />
      </NamespacedRoute>
    )
  },
  {
    path: paths.interceptors.byNamespace(),
    element: (
      <NamespacedRoute>
        <Interceptors />
      </NamespacedRoute>
    )
  }
];
