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
export const messages = {
  en: {
    'dashboard.pipelineRuns.transitionTime': 'Last Transition Time',
    'dashboard.pipelineRuns.status': 'Status',
    'dashboard.pipelineRuns.error': 'Error loading PipelineRuns',
    'dashboard.pipelineRuns.createSuccess': 'Successfully created PipelineRun',
    'dashboard.pipelineRuns.invalidFilter':
      'Filters must be of the format labelKey:labelValue and contain accepted label characters',
    'dashboard.pipelineRuns.duplicateFilter': 'No duplicate filters allowed',
    'dashboard.pipelineRuns.labelDocs':
      'https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set',
    'dashboard.pipelineRuns.searchPlaceholder':
      'Input a label filter of the format labelKey:labelValue',
    'dashboard.pipelineRun.failed': 'Cannot load PipelineRun',
    'dashboard.pipelineRun.notFound': 'PipelineRun not found',
    'dashboard.pipelineRun.error': 'Error loading PipelineRun',
    'dashboard.pipelineRun.logEmpty': 'No log available',
    'dashboard.pipelineRun.stepCompleted': 'Step completed',
    'dashboard.pipelineRun.stepFailed': 'Step failed',
    'dashboard.pipelineRun.logFailed': 'Unable to fetch log',
    'dashboard.pipelineRun.failedMessage':
      'Unable to load PipelineRun details: {message}',
    'dashboard.pipelineRun.rebuildStatusMessage':
      'View status of this rebuilt run',
    'dashboard.taskRun.logs': 'Logs',
    'dashboard.taskRun.status': 'Status',
    'dashboard.taskRun.details': 'Details',
    'dashboard.taskRun.status.failed': 'Failed',
    'dashboard.taskRun.status.notRun': 'Not run',
    'dashboard.taskRun.status.running': 'Running',
    'dashboard.taskRun.status.succeeded': 'Completed',
    'dashboard.taskRun.status.waiting': 'Waiting',
    'dashboard.taskRun.parameters': 'Parameters',
    'dashboard.step.stepDefinition': 'Step definition',
    'dashboard.step.containerStatus': 'Container status',
    'dashboard.step.statusNotAvailable': 'No status available',
    'dashboard.step.definitionNotAvailable':
      'description: step definition not available',
    'dashboard.taskRun.inputResources': 'Input Resources',
    'dashboard.taskRun.OutputResources': 'Output Resources',
    'dashboard.tableHeader.name': 'Name',
    'dashboard.tableHeader.value': 'Value',
    'dashboard.header.logOut': 'Log out'
  }
};
