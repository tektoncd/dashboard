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
import DetailsHeader from './DetailsHeader';
import { renderWithIntl } from '../../utils/test';

const props = {
  stepName: 'test name'
};

it('DetailsHeader renders the provided content', () => {
  const { queryByText } = renderWithIntl(<DetailsHeader {...props} />);
  expect(queryByText(/test name/i)).toBeTruthy();
});

it('DetailsHeader renders the running state', () => {
  const { queryByText } = renderWithIntl(
    <DetailsHeader {...props} status="running" />
  );
  expect(queryByText(/running/i)).toBeTruthy();
});

it('DetailsHeader renders the completed state', () => {
  const { queryByText } = renderWithIntl(
    <DetailsHeader {...props} status="terminated" reason="Completed" />
  );
  expect(queryByText(/completed/i)).toBeTruthy();
});

it('DetailsHeader renders the cancelled state', () => {
  const { queryByText } = renderWithIntl(
    <DetailsHeader {...props} status="cancelled" />
  );
  expect(queryByText(/Cancelled/i)).toBeTruthy();
});

it('DetailsHeader renders the cancelled state for TaskRunCancelled', () => {
  const { queryByText } = renderWithIntl(
    <DetailsHeader {...props} status="terminated" reason="TaskRunCancelled" />
  );
  expect(queryByText(/Cancelled/i)).toBeTruthy();
});

it('DetailsHeader renders the cancelled state for TaskRunTimeout', () => {
  const { queryByText } = renderWithIntl(
    <DetailsHeader {...props} status="terminated" reason="TaskRunTimeout" />
  );
  expect(queryByText(/Cancelled/i)).toBeTruthy();
});

it('DetailsHeader renders the failed state', () => {
  const { queryByText } = renderWithIntl(
    <DetailsHeader {...props} status="terminated" />
  );
  expect(queryByText(/failed/i)).toBeTruthy();
});

it('DetailsHeader renders the pending state', () => {
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
    <DetailsHeader {...props} taskRun={taskRun} />
  );
  expect(queryByText(/waiting/i)).toBeTruthy();
});

it('DetailsHeader renders the pending state', () => {
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
    <DetailsHeader {...props} taskRun={taskRun} type="taskRun" />
  );
  expect(queryByText(/pending/i)).toBeTruthy();
});
