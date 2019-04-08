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
import PipelineRunHeader from './PipelineRunHeader';

import { renderWithRouter } from '../../utils/test';

const props = {
  pipelineName: 'simple-pipeline',
  pipelineRunName: 'simple-pipeline-run-1'
};

it('PipelineRunHeader renders the provided content', () => {
  const { queryByText } = renderWithRouter(<PipelineRunHeader {...props} />);
  expect(queryByText(/simple-pipeline/i)).toBeTruthy();
});

it('PipelineRunHeader renders the running state', () => {
  const { queryByText } = renderWithRouter(
    <PipelineRunHeader {...props} status="Unknown" reason="Running" />
  );
  expect(queryByText(/running/i)).toBeTruthy();
});

it('PipelineRunHeader renders the completed state', () => {
  const { queryByText } = renderWithRouter(
    <PipelineRunHeader {...props} status="True" reason="Completed" />
  );
  expect(queryByText(/completed/i)).toBeTruthy();
});

it('PipelineRunHeader renders the failed state', () => {
  const { queryByText } = renderWithRouter(
    <PipelineRunHeader {...props} status="False" reason="Failed" />
  );
  expect(queryByText(/failed/i)).toBeTruthy();
});

it('PipelineRunHeader renders the pending state', () => {
  const { queryByText } = renderWithRouter(
    <PipelineRunHeader {...props} error="an error message" />
  );
  expect(queryByText(/an error message/i)).toBeTruthy();
});
