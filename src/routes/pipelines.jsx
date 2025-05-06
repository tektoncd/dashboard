/*
Copyright 2019-2025 The Tekton Authors
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
  CreateCustomRun,
  CreatePipelineRun,
  CreateTaskRun,
  CustomResourceDefinition,
  CustomRun,
  CustomRuns,
  PipelineRun,
  PipelineRuns,
  Pipelines,
  ReadWriteRoute,
  ResourceList,
  TaskRun,
  TaskRuns,
  Tasks
} from '../containers';
import { getTektonPipelinesAPIVersion, tektonAPIGroup } from '../api/utils';

export default [
  {
    path: paths.customRuns.all(),
    element: <CustomRuns />,
    handle: {
      isNamespaced: true,
      path: paths.customRuns.all()
    }
  },
  {
    path: paths.customRuns.byNamespace(),
    element: <CustomRuns />,
    handle: {
      isNamespaced: true,
      path: paths.customRuns.byNamespace()
    }
  },
  {
    path: paths.customRuns.byName(),
    element: <CustomRun />,
    handle: {
      isNamespaced: true,
      isResourceDetails: true,
      path: paths.customRuns.byName()
    }
  },
  {
    path: paths.customRuns.create(),
    element: (
      <ReadWriteRoute>
        <CreateCustomRun />
      </ReadWriteRoute>
    )
  },
  {
    path: paths.pipelines.all(),
    element: <Pipelines />,
    handle: {
      isNamespaced: true,
      path: paths.pipelines.all()
    }
  },
  {
    path: paths.pipelines.byNamespace(),
    element: <Pipelines />,
    handle: {
      isNamespaced: true,
      path: paths.pipelines.byNamespace()
    }
  },
  {
    path: paths.pipelines.byName(),
    element: <CustomResourceDefinition />,
    handle: {
      group: tektonAPIGroup,
      isNamespaced: true,
      isResourceDetails: true,
      kind: 'pipelines',
      path: paths.pipelines.byName(),
      version: getTektonPipelinesAPIVersion()
    }
  },
  {
    path: paths.pipelineRuns.all(),
    element: <PipelineRuns />,
    handle: {
      isNamespaced: true,
      path: paths.pipelineRuns.all()
    }
  },
  {
    path: paths.pipelineRuns.byNamespace(),
    element: <PipelineRuns />,
    handle: {
      isNamespaced: true,
      path: paths.pipelineRuns.byNamespace()
    }
  },
  {
    path: paths.pipelineRuns.byName(),
    element: <PipelineRun />,
    handle: {
      isNamespaced: true,
      isResourceDetails: true,
      path: paths.pipelineRuns.byName()
    }
  },
  {
    path: paths.pipelineRuns.create(),
    element: (
      <ReadWriteRoute>
        <CreatePipelineRun />
      </ReadWriteRoute>
    )
  },
  {
    path: paths.stepActions.all(),
    element: <ResourceList />,
    handle: {
      group: tektonAPIGroup,
      isNamespaced: true,
      kind: 'stepactions',
      path: paths.stepActions.all(),
      resourceURL: urls.stepActions.byName,
      title: 'StepActions',
      version: 'v1beta1'
    }
  },
  {
    path: paths.stepActions.byName(),
    element: <CustomResourceDefinition />,
    handle: {
      group: tektonAPIGroup,
      isNamespaced: true,
      isResourceDetails: true,
      kind: 'stepactions',
      path: paths.stepActions.byName(),
      version: 'v1beta1'
    }
  },
  {
    path: paths.stepActions.byNamespace(),
    element: <ResourceList />,
    handle: {
      group: tektonAPIGroup,
      isNamespaced: true,
      kind: 'stepactions',
      path: paths.stepActions.byNamespace(),
      resourceURL: urls.stepActions.byName,
      title: 'StepActions',
      version: 'v1beta1'
    }
  },
  {
    path: paths.tasks.all(),
    element: <Tasks />,
    handle: {
      isNamespaced: true,
      path: paths.tasks.all()
    }
  },
  {
    path: paths.tasks.byNamespace(),
    element: <Tasks />,
    handle: {
      isNamespaced: true,
      path: paths.tasks.byNamespace()
    }
  },
  {
    path: paths.tasks.byName(),
    element: <CustomResourceDefinition />,
    handle: {
      group: tektonAPIGroup,
      isNamespaced: true,
      isResourceDetails: true,
      kind: 'tasks',
      path: paths.tasks.byName(),
      version: getTektonPipelinesAPIVersion()
    }
  },
  {
    path: paths.taskRuns.all(),
    element: <TaskRuns />,
    handle: {
      isNamespaced: true,
      path: paths.taskRuns.all()
    }
  },
  {
    path: paths.taskRuns.byNamespace(),
    element: <TaskRuns />,
    handle: {
      isNamespaced: true,
      path: paths.taskRuns.byNamespace()
    }
  },
  {
    path: paths.taskRuns.byName(),
    element: <TaskRun />,
    handle: {
      isNamespaced: true,
      isResourceDetails: true,
      path: paths.taskRuns.byName()
    }
  },
  {
    path: paths.taskRuns.create(),
    element: (
      <ReadWriteRoute>
        <CreateTaskRun />
      </ReadWriteRoute>
    )
  }
];
