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
  About,
  CustomResourceDefinition,
  ImportResources,
  ReadWriteRoute,
  ResourceList,
  Settings
} from '../containers';

export default [
  {
    path: paths.about(),
    element: <About />
  },
  {
    path: paths.settings(),
    element: <Settings />
  },
  {
    path: paths.importResources(),
    element: (
      <ReadWriteRoute>
        <ImportResources />
      </ReadWriteRoute>
    )
  },
  {
    path: paths.rawCRD.byNamespace(),
    element: <CustomResourceDefinition />,
    handle: {
      isNamespaced: true,
      isResourceDetails: true,
      path: paths.rawCRD.byNamespace()
    }
  },
  {
    path: paths.rawCRD.cluster(),
    element: <CustomResourceDefinition />
  },
  {
    path: paths.kubernetesResources.all(),
    element: <ResourceList />,
    handle: {
      isNamespaced: true,
      path: paths.kubernetesResources.all()
    }
  },
  {
    path: paths.kubernetesResources.byNamespace(),
    element: <ResourceList />,
    handle: {
      isNamespaced: true,
      path: paths.kubernetesResources.byNamespace()
    }
  },
  {
    path: paths.kubernetesResources.byName(),
    element: <CustomResourceDefinition />,
    handle: {
      isNamespaced: true,
      isResourceDetails: true,
      path: paths.kubernetesResources.byName()
    }
  },
  {
    path: paths.kubernetesResources.cluster(),
    element: <CustomResourceDefinition />
  }
];
