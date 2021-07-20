/*
Copyright 2019-2021 The Tekton Authors
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
import { waitFor } from '@testing-library/react';
import { createIntl } from 'react-intl';

import { renderWithRouter } from '../../utils/test';
import * as PipelineRunsAPI from '../../api/pipelineRuns';
import * as TaskRunsAPI from '../../api/taskRuns';
import * as TasksAPI from '../../api/tasks';
import * as ClusterTasksAPI from '../../api/clusterTasks';
import { PipelineRunContainer } from './PipelineRun';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

const pipelineRun = {
  metadata: {
    name: 'pipeline-run'
  },
  spec: {}
};

it('PipelineRunContainer renders data', async () => {
  const pipelineRunName = 'bar';
  const match = {
    params: {
      pipelineName: 'foo',
      pipelineRunName
    }
  };
  jest
    .spyOn(PipelineRunsAPI, 'usePipelineRun')
    .mockImplementation(() => ({ data: pipelineRun }));
  jest
    .spyOn(TaskRunsAPI, 'useTaskRuns')
    .mockImplementation(() => ({ data: [] }));
  jest.spyOn(TasksAPI, 'useTasks').mockImplementation(() => ({ data: [] }));
  jest
    .spyOn(ClusterTasksAPI, 'useClusterTasks')
    .mockImplementation(() => ({ data: [] }));

  const { getByText } = renderWithRouter(
    <PipelineRunContainer intl={intl} match={match} />
  );
  await waitFor(() => getByText(pipelineRun.metadata.name));
});

it('PipelineRunContainer renders not found state', async () => {
  const pipelineRunName = 'bar';
  const match = {
    params: {
      pipelineName: 'foo',
      pipelineRunName
    }
  };
  jest
    .spyOn(PipelineRunsAPI, 'usePipelineRun')
    .mockImplementation(() => ({ data: null, error: null }));

  const { getByText } = renderWithRouter(
    <PipelineRunContainer intl={intl} match={match} />
  );
  await waitFor(() => getByText(`PipelineRun not found`));
});

it('PipelineRunContainer renders error state', async () => {
  const match = {
    params: {
      pipelineName: 'foo',
      pipelineRunName: 'bar'
    }
  };
  jest
    .spyOn(PipelineRunsAPI, 'usePipelineRun')
    .mockImplementation(() => ({ data: null, error: 'some error' }));

  const { getByText } = renderWithRouter(
    <PipelineRunContainer intl={intl} match={match} />
  );
  await waitFor(() => getByText('Error loading PipelineRun'));
});
