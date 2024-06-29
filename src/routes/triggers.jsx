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

import { paths, urls } from '@tektoncd/dashboard-utils';

import {
  ClusterTriggerBinding,
  CustomResourceDefinition,
  EventListener,
  ResourceList,
  Trigger,
  TriggerBinding,
  TriggerTemplate
} from '../containers';
import { triggersAPIGroup } from '../api/utils';

export default [
  {
    path: paths.clusterInterceptors.all(),
    element: <ResourceList />,
    handle: {
      group: triggersAPIGroup,
      kind: 'clusterinterceptors',
      path: paths.clusterInterceptors.all(),
      resourceURL: urls.clusterInterceptors.byName,
      title: 'ClusterInterceptors',
      version: 'v1alpha1'
    }
  },
  {
    path: paths.clusterInterceptors.byName(),
    element: <CustomResourceDefinition />,
    handle: {
      group: triggersAPIGroup,
      isResourceDetails: true,
      kind: 'clusterinterceptors',
      path: paths.clusterInterceptors.byName(),
      version: 'v1alpha1'
    }
  },
  {
    path: paths.clusterTriggerBindings.all(),
    element: <ResourceList />,
    handle: {
      group: triggersAPIGroup,
      kind: 'clustertriggerbindings',
      path: paths.clusterTriggerBindings.all(),
      resourceURL: urls.clusterTriggerBindings.byName,
      title: 'ClusterTriggerBindings',
      version: 'v1beta1'
    }
  },
  {
    path: paths.clusterTriggerBindings.byName(),
    element: <ClusterTriggerBinding />
  },
  {
    path: paths.eventListeners.all(),
    element: <ResourceList />,
    handle: {
      group: triggersAPIGroup,
      isNamespaced: true,
      kind: 'eventlisteners',
      path: paths.eventListeners.all(),
      resourceURL: urls.eventListeners.byName,
      title: 'EventListeners',
      version: 'v1beta1'
    }
  },
  {
    path: paths.eventListeners.byNamespace(),
    element: <ResourceList />,
    handle: {
      group: triggersAPIGroup,
      isNamespaced: true,
      kind: 'eventlisteners',
      path: paths.eventListeners.byNamespace(),
      resourceURL: urls.eventListeners.byName,
      title: 'EventListeners',
      version: 'v1beta1'
    }
  },
  {
    path: paths.eventListeners.byName(),
    element: <EventListener />,
    handle: {
      isNamespaced: true,
      isResourceDetails: true,
      path: paths.eventListeners.byName()
    }
  },
  {
    path: paths.triggers.all(),
    element: <ResourceList />,
    handle: {
      group: triggersAPIGroup,
      isNamespaced: true,
      kind: 'triggers',
      path: paths.triggers.all(),
      resourceURL: urls.triggers.byName,
      title: 'Triggers',
      version: 'v1beta1'
    }
  },
  {
    path: paths.triggers.byNamespace(),
    element: <ResourceList />,
    handle: {
      group: triggersAPIGroup,
      isNamespaced: true,
      kind: 'triggers',
      path: paths.triggers.byNamespace(),
      resourceURL: urls.triggers.byName,
      title: 'Triggers',
      version: 'v1beta1'
    }
  },
  {
    path: paths.triggers.byName(),
    element: <Trigger />,
    handle: {
      isNamespaced: true,
      isResourceDetails: true,
      path: paths.triggers.byName()
    }
  },
  {
    path: paths.triggerBindings.all(),
    element: <ResourceList />,
    handle: {
      group: triggersAPIGroup,
      isNamespaced: true,
      kind: 'triggerbindings',
      path: paths.triggerBindings.all(),
      resourceURL: urls.triggerBindings.byName,
      title: 'TriggerBindings',
      version: 'v1beta1'
    }
  },
  {
    path: paths.triggerBindings.byNamespace(),
    element: <ResourceList />,
    handle: {
      group: triggersAPIGroup,
      isNamespaced: true,
      kind: 'triggerbindings',
      path: paths.triggerBindings.byNamespace(),
      resourceURL: urls.triggerBindings.byName,
      title: 'TriggerBindings',
      version: 'v1beta1'
    }
  },
  {
    path: paths.triggerBindings.byName(),
    element: <TriggerBinding />,
    handle: {
      isNamespaced: true,
      isResourceDetails: true,
      path: paths.triggerBindings.byName()
    }
  },
  {
    path: paths.triggerTemplates.all(),
    element: <ResourceList />,
    handle: {
      group: triggersAPIGroup,
      isNamespaced: true,
      kind: 'triggertemplates',
      path: paths.triggerTemplates.all(),
      resourceURL: urls.triggerTemplates.byName,
      title: 'TriggerTemplates',
      version: 'v1beta1'
    }
  },
  {
    path: paths.triggerTemplates.byNamespace(),
    element: <ResourceList />,
    handle: {
      group: triggersAPIGroup,
      isNamespaced: true,
      kind: 'triggertemplates',
      path: paths.triggerTemplates.byNamespace(),
      resourceURL: urls.triggerTemplates.byName,
      title: 'TriggerTemplates',
      version: 'v1beta1'
    }
  },
  {
    path: paths.triggerTemplates.byName(),
    element: <TriggerTemplate />,
    handle: {
      isNamespaced: true,
      isResourceDetails: true,
      path: paths.triggerTemplates.byName()
    }
  },
  {
    path: paths.interceptors.all(),
    element: <ResourceList />,
    handle: {
      group: triggersAPIGroup,
      isNamespaced: true,
      kind: 'interceptors',
      path: paths.interceptors.all(),
      resourceURL: urls.interceptors.byName,
      title: 'Interceptors',
      version: 'v1alpha1'
    }
  },
  {
    path: paths.interceptors.byNamespace(),
    element: <ResourceList />,
    handle: {
      group: triggersAPIGroup,
      isNamespaced: true,
      kind: 'interceptors',
      path: paths.interceptors.byNamespace(),
      resourceURL: urls.interceptors.byName,
      title: 'Interceptors',
      version: 'v1alpha1'
    }
  },
  {
    path: paths.interceptors.byName(),
    element: <CustomResourceDefinition />,
    handle: {
      group: triggersAPIGroup,
      isNamespaced: true,
      isResourceDetails: true,
      kind: 'interceptors',
      path: paths.interceptors.byName(),
      version: 'v1alpha1'
    }
  }
];
