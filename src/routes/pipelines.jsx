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
  ClusterTasks,
  CreateCustomRun,
  CreatePipelineRun,
  CreateTaskRun,
  CustomRun,
  CustomRuns,
  NamespacedRoute,
  PipelineRun,
  PipelineRuns,
  Pipelines,
  ReadWriteRoute,
  TaskRun,
  TaskRuns,
  Tasks
} from '../containers';

export default [
  {
    path: paths.clusterTasks.all(),
    element: <ClusterTasks />
  },
  {
    path: paths.customRuns.all(),
    element: (
      <NamespacedRoute>
        <CustomRuns />
      </NamespacedRoute>
    )
  },
  {
    path: paths.customRuns.byNamespace(),
    element: (
      <NamespacedRoute>
        <CustomRuns />
      </NamespacedRoute>
    )
  },
  {
    path: paths.customRuns.byName(),
    element: (
      <NamespacedRoute isResourceDetails>
        <CustomRun />
      </NamespacedRoute>
    )
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
    element: (
      <NamespacedRoute>
        <Pipelines />
      </NamespacedRoute>
    )
  },
  {
    path: paths.pipelines.byNamespace(),
    element: (
      <NamespacedRoute>
        <Pipelines />
      </NamespacedRoute>
    )
  },
  {
    path: paths.pipelineRuns.all(),
    element: (
      <NamespacedRoute>
        <PipelineRuns />
      </NamespacedRoute>
    )
  },
  {
    path: paths.pipelineRuns.byNamespace(),
    element: (
      <NamespacedRoute>
        <PipelineRuns />
      </NamespacedRoute>
    )
  },
  {
    path: paths.pipelineRuns.byName(),
    element: (
      <NamespacedRoute isResourceDetails>
        <PipelineRun />
      </NamespacedRoute>
    )
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
    path: paths.tasks.all(),
    element: (
      <NamespacedRoute>
        <Tasks />
      </NamespacedRoute>
    )
  },
  {
    path: paths.tasks.byNamespace(),
    element: (
      <NamespacedRoute>
        <Tasks />
      </NamespacedRoute>
    )
  },
  {
    path: paths.taskRuns.all(),
    element: (
      <NamespacedRoute>
        <TaskRuns />
      </NamespacedRoute>
    )
  },
  {
    path: paths.taskRuns.byNamespace(),
    element: (
      <NamespacedRoute>
        <TaskRuns />
      </NamespacedRoute>
    )
  },
  {
    path: paths.taskRuns.byName(),
    element: (
      <NamespacedRoute isResourceDetails>
        <TaskRun />
      </NamespacedRoute>
    )
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
