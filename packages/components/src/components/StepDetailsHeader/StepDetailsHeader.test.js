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
import StepDetailsHeader from './StepDetailsHeader';
import { renderWithIntl } from '../../utils/test';

const props = {
  stepName: 'test name'
};

it('StepDetailsHeader renders the provided content', () => {
  const { queryByText } = renderWithIntl(<StepDetailsHeader {...props} />);
  expect(queryByText(/test name/i)).toBeTruthy();
});

it('StepDetailsHeader renders the running state', () => {
  const { queryByText } = renderWithIntl(
    <StepDetailsHeader {...props} status="running" />
  );
  expect(queryByText(/running/i)).toBeTruthy();
});

it('StepDetailsHeader renders the completed state', () => {
  const { queryByText } = renderWithIntl(
    <StepDetailsHeader {...props} status="terminated" reason="Completed" />
  );
  expect(queryByText(/completed/i)).toBeTruthy();
});

it('StepDetailsHeader renders the cancelled state', () => {
  const { queryByText } = renderWithIntl(
    <StepDetailsHeader {...props} status="cancelled" />
  );
  expect(queryByText(/Cancelled/i)).toBeTruthy();
});

it('StepDetailsHeader renders the failed state', () => {
  const { queryByText } = renderWithIntl(
    <StepDetailsHeader {...props} status="terminated" />
  );
  expect(queryByText(/failed/i)).toBeTruthy();
});

it('StepDetailsHeader renders the pending state', () => {
  const taskRun = {
    status: {
      conditions: [
        {
          type: 'Succeeded',
          status: 'Unknown',
          reason: 'Pending'
        }
      ]
    }
  };

  const { queryByText } = renderWithIntl(
    <StepDetailsHeader {...props} taskRun={taskRun} />
  );
  expect(queryByText(/waiting/i)).toBeTruthy();
});
