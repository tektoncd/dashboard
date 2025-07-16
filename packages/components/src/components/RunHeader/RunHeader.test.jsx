/*
Copyright 2019-2024 The Tekton Authors
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

import { renderWithRouter } from '../../utils/test';

import RunHeader from './RunHeader';

const props = {
  message: 'sample status message content',
  name: 'simple-pipeline',
  runName: 'simple-pipeline-run-1'
};

it('RunHeader renders the provided content', () => {
  const { queryByText } = renderWithRouter(<RunHeader {...props} />);
  // TODO replace test for error message
  expect(queryByText(/simple-pipeline/i)).toBeTruthy();
  expect(queryByText(/Last updated/i)).toBeFalsy();
});

it('RunHeader renders the running state', () => {
  const { queryByText } = renderWithRouter(
    <RunHeader
      {...props}
      lastTransitionTime={new Date()}
      status="Unknown"
      reason="Running"
    />
  );
  expect(queryByText(/running/i)).toBeTruthy();
  expect(queryByText(/Last updated/i)).toBeTruthy();
});

it('RunHeader renders the completed state', () => {
  const { queryByText } = renderWithRouter(
    <RunHeader {...props} status="True" reason="Completed" />
  );
  expect(queryByText(/completed/i)).toBeTruthy();
});

it('RunHeader renders the failed state', () => {
  const { queryByText } = renderWithRouter(
    <RunHeader {...props} status="False" reason="Failed" />
  );
  expect(queryByText(/failed/i)).toBeTruthy();
});

it('RunHeader renders the error notification when there is a pipelineRun error', () => {
  const { queryByText } = renderWithRouter(
    <RunHeader
      {...props}
      pipelineRunError
      reason="Error"
      message="PipelineRun error"
    />
  );
  expect(queryByText(/Unable to load PipelineRun: Error/i)).toBeTruthy();
  expect(queryByText(/PipelineRun error/i)).toBeTruthy();
});

it('RunHeader renders the error notification when there is a pipelineRun failure', () => {
  const { queryByText } = renderWithRouter(
    <RunHeader
      {...props}
      showFailureMessage
      reason="PipelineValidationFailed"
      message="Validation failed for pipeline run"
    />
  );
  expect(queryByText(/Status message:/i)).toBeTruthy();
  expect(queryByText(/Validation failed for pipeline run/i)).toBeTruthy();
});

it('RunHeader renders the loading state', () => {
  const { queryByTitle } = renderWithRouter(<RunHeader loading />);
  expect(queryByTitle(/loading/i)).toBeTruthy();
});
