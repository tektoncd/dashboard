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

export const labels = {
  CLUSTER_TASK: 'tekton.dev/clusterTask',
  CONDITION_CHECK: 'tekton.dev/conditionCheck',
  CONDITION_NAME: 'tekton.dev/conditionName',
  DASHBOARD_IMPORT: 'dashboard.tekton.dev/import',
  DASHBOARD_RETRY_NAME: 'dashboard.tekton.dev/retryName',
  PIPELINE: 'tekton.dev/pipeline',
  PIPELINE_RUN: 'tekton.dev/pipelineRun',
  PIPELINE_TASK: 'tekton.dev/pipelineTask',
  TASK: 'tekton.dev/task'
};

export const pipelineRunStatuses = {
  PENDING: 'PipelineRunPending'
};

export const queryParams = {
  PIPELINE_TASK: 'pipelineTask',
  RETRY: 'retry',
  STEP: 'step',
  TASK_RUN_DETAILS: 'taskRunDetails',
  VIEW: 'view'
};
