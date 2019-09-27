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

import React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import StoryRouter from 'storybook-react-router';

import RunHeader from './RunHeader';

const now = new Date();

storiesOf('RunHeader', module)
  .addDecorator(StoryRouter())
  .add('default', () => (
    <RunHeader
      name={text('Pipeline Name', 'simple-pipeline')}
      runName={text('PipelineRun Name', 'simple-pipeline-run-1')}
      type={text('Run Type', 'pipelines')}
      typeLabel={text('Run Type Label', 'Pipelines')}
    />
  ))
  .add('running', () => (
    <RunHeader
      lastTransitionTime={now}
      name={text('Pipeline Name', 'simple-pipeline')}
      runName={text('PipelineRun Name', 'simple-pipeline-run-1')}
      reason="Running"
      status="Unknown"
      type={text('Run Type', 'pipelines')}
      typeLabel={text('Run Type Label', 'Pipelines')}
    />
  ))
  .add('complete', () => (
    <RunHeader
      lastTransitionTime={now}
      name={text('Pipeline Name', 'simple-pipeline')}
      runName={text('PipelineRun Name', 'simple-pipeline-run-1')}
      status="True"
      reason="Completed"
      type={text('Run Type', 'pipelines')}
      typeLabel={text('Run Type Label', 'Pipelines')}
    />
  ))
  .add('failed', () => (
    <RunHeader
      lastTransitionTime={now}
      name={text('Pipeline Name', 'simple-pipeline')}
      runName={text('PipelineRun Name', 'simple-pipeline-run-1')}
      status="False"
      reason="Failed"
      type={text('Run Type', 'pipelines')}
      typeLabel={text('Run Type Label', 'Pipelines')}
    />
  ))
  .add('loading', () => <RunHeader loading />);
