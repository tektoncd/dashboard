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
import { waitForElement } from '@testing-library/react';
import { createIntl } from 'react-intl';
import { renderWithRouter } from '@tektoncd/dashboard-components/src/utils/test';

import { PipelineRunContainer } from './PipelineRun';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

it('PipelineRunContainer renders', async () => {
  const pipelineRunName = 'bar';
  const match = {
    params: {
      pipelineName: 'foo',
      pipelineRunName
    }
  };

  const { getByText } = renderWithRouter(
    <PipelineRunContainer
      intl={intl}
      match={match}
      fetchTaskRuns={() => Promise.resolve()}
      fetchPipelineRun={() => Promise.resolve()}
      fetchTasks={() => Promise.resolve()}
      fetchClusterTasks={() => Promise.resolve()}
      error={null}
      loading={false}
    />
  );
  await waitForElement(() => getByText(`PipelineRun not found`));
});

it('PipelineRunContainer handles error state', async () => {
  const match = {
    params: {
      pipelineName: 'foo',
      pipelineRunName: 'bar'
    }
  };

  const { getByText } = renderWithRouter(
    <PipelineRunContainer
      intl={intl}
      match={match}
      error="Error"
      fetchTaskRuns={() => Promise.resolve()}
      fetchPipelineRun={() => Promise.resolve()}
      fetchTasks={() => Promise.resolve()}
      fetchClusterTasks={() => Promise.resolve()}
    />
  );
  await waitForElement(() => getByText('Error loading PipelineRun'));
});
