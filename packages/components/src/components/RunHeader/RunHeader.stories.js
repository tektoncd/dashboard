/*
Copyright 2019-2020 The Tekton Authors
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

import React from 'react';
import { text } from '@storybook/addon-knobs';
import StoryRouter from 'storybook-react-router';

import RunHeader from './RunHeader';

const now = new Date();

export default {
  component: RunHeader,
  decorators: [StoryRouter()],
  title: 'Components/RunHeader'
};

export const Base = () => (
  <RunHeader
    name={text('Pipeline Name', 'simple-pipeline')}
    runName={text('PipelineRun Name', 'simple-pipeline-run-1')}
    type={text('Run Type', 'pipelines')}
    typeLabel={text('Run Type Label', 'Pipelines')}
  />
);

export const Running = () => (
  <RunHeader
    lastTransitionTime={now}
    message={text('Status Message', 'Not all Tasks have completed executing')}
    name={text('Pipeline Name', 'simple-pipeline')}
    runName={text('PipelineRun Name', 'simple-pipeline-run-1')}
    reason="Running"
    status="Unknown"
    type={text('Run Type', 'pipelines')}
    typeLabel={text('Run Type Label', 'Pipelines')}
  />
);

export const Complete = () => (
  <RunHeader
    lastTransitionTime={now}
    message={text('Status Message', 'All Tasks have completed executing')}
    name={text('Pipeline Name', 'simple-pipeline')}
    runName={text('PipelineRun Name', 'simple-pipeline-run-1')}
    status="True"
    reason="Completed"
    type={text('Run Type', 'pipelines')}
    typeLabel={text('Run Type Label', 'Pipelines')}
  />
);

export const Failed = () => (
  <RunHeader
    lastTransitionTime={now}
    message={text(
      'Status Message',
      'TaskRun demo-pipeline-run-1-build-skaffold-web-4dzrn has failed'
    )}
    name={text('Pipeline Name', 'simple-pipeline')}
    runName={text('PipelineRun Name', 'simple-pipeline-run-1')}
    status="False"
    reason="Failed"
    type={text('Run Type', 'pipelines')}
    typeLabel={text('Run Type Label', 'Pipelines')}
  />
);

export const Loading = () => <RunHeader loading />;

export const WithTriggerInfo = () => (
  <RunHeader
    lastTransitionTime={now}
    message={text('Status Message', 'All Tasks have completed executing')}
    name={text('Pipeline Name', 'simple-pipeline')}
    runName={text('PipelineRun Name', 'simple-pipeline-run-1')}
    status="True"
    reason="Completed"
    triggerHeader={
      <span>
        Triggered by <a href="#">Update README.md</a>
      </span>
    }
    type={text('Run Type', 'pipelines')}
    typeLabel={text('Run Type Label', 'Pipelines')}
  />
);
