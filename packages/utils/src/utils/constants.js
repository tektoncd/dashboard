/*
Copyright 2020-2025 The Tekton Authors
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

export const dashboardReasonSkipped = 'tkn-dashboard:skipped';

export const labels = {
  DASHBOARD_DESCRIPTION: 'dashboard.tekton.dev/description',
  DASHBOARD_DISPLAY_NAME: 'dashboard.tekton.dev/displayName',
  DASHBOARD_IMPORT: 'dashboard.tekton.dev/import',
  MEMBER_OF: 'tekton.dev/memberOf',
  PIPELINE: 'tekton.dev/pipeline',
  PIPELINE_RUN: 'tekton.dev/pipelineRun',
  PIPELINE_TASK: 'tekton.dev/pipelineTask',
  TASK: 'tekton.dev/task'
};

export const pipelineRunStatuses = {
  PENDING: 'PipelineRunPending'
};

export const preferences = {
  CANCEL_STATUS_KEY: 'tkn-pipelinerun-cancel-status'
};

export const queryParams = {
  PIPELINE_TASK: 'pipelineTask',
  RETRY: 'retry',
  STEP: 'step',
  TASK_RUN_DETAILS: 'taskRunDetails',
  TASK_RUN_NAME: 'taskRunName',
  VIEW: 'view'
};

export const resourceNameRegex =
  /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
