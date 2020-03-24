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
import { waitForElement } from 'react-testing-library';
import PipelineRun from './PipelineRun';
import { renderWithIntl } from '../../utils/test';

it('PipelineRunContainer renders', async () => {
  const { getByText } = renderWithIntl(
    <PipelineRun error={null} loading={false} />
  );
  await waitForElement(() => getByText('PipelineRun not found'));
});

it('PipelineRunContainer handles error state', async () => {
  const { getByText } = renderWithIntl(<PipelineRun error="Error" />);
  await waitForElement(() => getByText('Error loading PipelineRun'));
});

it('PipelineRunContainer handles init step failures', async () => {
  const initStepName = 'my-failed-init-step';
  const pipelineRunName = 'fake_pipelineRunName';
  const taskRunName = 'fake_taskRunName';

  const taskRun = {
    metadata: {
      name: taskRunName,
      labels: {}
    },
    spec: {
      inputs: {},
      outputs: {},
      taskSpec: {}
    },
    status: {
      steps: [
        {
          terminated: {},
          name: initStepName
        }
      ]
    }
  };

  const pipelineRun = {
    metadata: {
      name: pipelineRunName
    },
    status: {
      taskRuns: []
    }
  };

  const { getByText } = renderWithIntl(
    <PipelineRun pipelineRun={pipelineRun} taskRuns={[taskRun]} tasks={[]} />
  );
  await waitForElement(() => getByText(initStepName));
});
