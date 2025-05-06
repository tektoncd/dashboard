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

import { waitFor } from '@testing-library/react';
import { createIntl } from 'react-intl';
import { paths, urls } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
import * as PipelineRunsAPI from '../../api/pipelineRuns';
import * as PipelinesAPI from '../../api/pipelines';
import * as TaskRunsAPI from '../../api/taskRuns';
import * as TasksAPI from '../../api/tasks';
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
  vi.spyOn(PipelineRunsAPI, 'usePipelineRun').mockImplementation(() => ({
    data: pipelineRun
  }));
  vi.spyOn(TaskRunsAPI, 'useTaskRuns').mockImplementation(() => ({ data: [] }));
  vi.spyOn(TasksAPI, 'useTasks').mockImplementation(() => ({ data: [] }));

  const { getByText } = renderWithRouter(<PipelineRunContainer intl={intl} />);
  await waitFor(() => getByText(pipelineRun.metadata.name));
});

it('PipelineRunContainer renders not found state', async () => {
  const namespace = 'fake_namespace';
  const pipelineRunName = 'fake_pipelineRunName';
  vi.spyOn(PipelineRunsAPI, 'usePipelineRun').mockImplementation(() => ({
    data: null,
    error: null
  }));
  vi.spyOn(TaskRunsAPI, 'useTaskRuns').mockImplementation(() => ({
    data: [],
    error: null
  }));
  vi.spyOn(TasksAPI, 'useTasks').mockImplementation(() => ({
    data: [],
    error: null
  }));
  vi.spyOn(PipelinesAPI, 'usePipeline').mockImplementation(() => ({
    data: null,
    error: null
  }));

  const { findByText } = renderWithRouter(
    <PipelineRunContainer intl={intl} />,
    {
      path: paths.pipelineRuns.byName(),
      route: urls.pipelineRuns.byName({ name: pipelineRunName, namespace })
    }
  );
  await findByText(/Page not found/);
});

it('PipelineRunContainer renders error state', async () => {
  const namespace = 'fake_namespace';
  const pipelineRunName = 'fake_pipelineRunName';
  vi.spyOn(PipelineRunsAPI, 'usePipelineRun').mockImplementation(() => ({
    data: null,
    error: 'some error'
  }));
  vi.spyOn(TaskRunsAPI, 'useTaskRuns').mockImplementation(() => ({
    data: [],
    error: null
  }));
  vi.spyOn(TasksAPI, 'useTasks').mockImplementation(() => ({
    data: [],
    error: null
  }));
  vi.spyOn(PipelinesAPI, 'usePipeline').mockImplementation(() => ({
    data: null,
    error: null
  }));

  const { findByText } = renderWithRouter(
    <PipelineRunContainer intl={intl} />,
    {
      path: paths.pipelineRuns.byName(),
      route: urls.pipelineRuns.byName({ name: pipelineRunName, namespace })
    }
  );
  await findByText(/Page not found/);
});
