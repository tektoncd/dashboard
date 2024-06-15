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

import { paths } from '@tektoncd/dashboard-utils';

import {
  ClusterInterceptors,
  ClusterTriggerBinding,
  ClusterTriggerBindings,
  EventListener,
  EventListeners,
  Interceptors,
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
    element: <EventListeners />,
    handle: {
      isNamespaced: true,
      path: paths.eventListeners.all()
    }
  },
  {
    path: paths.eventListeners.byNamespace(),
    element: <EventListeners />,
    handle: {
      isNamespaced: true,
      path: paths.eventListeners.byNamespace()
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
    element: <Triggers />,
    handle: {
      isNamespaced: true,
      path: paths.triggers.all()
    }
  },
  {
    path: paths.triggers.byNamespace(),
    element: <Triggers />,
    handle: {
      isNamespaced: true,
      path: paths.triggers.byNamespace()
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
    element: <TriggerBindings />,
    handle: {
      isNamespaced: true,
      path: paths.triggerBindings.all()
    }
  },
  {
    path: paths.triggerBindings.byNamespace(),
    element: <TriggerBindings />,
    handle: {
      isNamespaced: true,
      path: paths.triggerBindings.byNamespace()
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
    element: <TriggerTemplates />,
    handle: {
      isNamespaced: true,
      path: paths.triggerTemplates.all()
    }
  },
  {
    path: paths.triggerTemplates.byNamespace(),
    element: <TriggerTemplates />,
    handle: {
      isNamespaced: true,
      path: paths.triggerTemplates.byNamespace()
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
    element: <Interceptors />,
    handle: {
      isNamespaced: true,
      path: paths.interceptors.all()
    }
  },
  {
    path: paths.interceptors.byNamespace(),
    element: <Interceptors />,
    handle: {
      isNamespaced: true,
      path: paths.interceptors.byNamespace()
    }
  }
];
