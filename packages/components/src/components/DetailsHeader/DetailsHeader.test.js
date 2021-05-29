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

import DetailsHeader from './DetailsHeader';
import { render } from '../../utils/test';

const props = {
  displayName: 'test name'
};

describe('DetailsHeader', () => {
  it('renders the provided content', () => {
    const { queryByText } = render(<DetailsHeader {...props} />);
    expect(queryByText(/test name/i)).toBeTruthy();
  });

  it('renders the running state', () => {
    const { queryByText } = render(
      <DetailsHeader {...props} status="running" />
    );
    expect(queryByText(/running/i)).toBeTruthy();
  });

  it('renders the completed state', () => {
    const { queryByText } = render(
      <DetailsHeader {...props} status="terminated" reason="Completed" />
    );
    expect(queryByText(/completed/i)).toBeTruthy();
  });

  it('renders the cancelled state', () => {
    const { queryByText } = render(
      <DetailsHeader {...props} status="cancelled" />
    );
    expect(queryByText(/Cancelled/i)).toBeTruthy();
  });

  it('renders the cancelled state for TaskRunCancelled', () => {
    const { queryByText } = render(
      <DetailsHeader {...props} status="terminated" reason="TaskRunCancelled" />
    );
    expect(queryByText(/Cancelled/i)).toBeTruthy();
  });

  it('renders the cancelled state for TaskRunTimeout', () => {
    const { queryByText } = render(
      <DetailsHeader {...props} status="terminated" reason="TaskRunTimeout" />
    );
    expect(queryByText(/Cancelled/i)).toBeTruthy();
  });

  it('renders the failed state', () => {
    const { queryByText } = render(
      <DetailsHeader {...props} status="terminated" />
    );
    expect(queryByText(/failed/i)).toBeTruthy();
  });

  it('renders the pending state for a step', () => {
    const taskRun = {
      status: {
        conditions: [
          {
            reason: 'Pending',
            status: 'Unknown',
            type: 'Succeeded'
          }
        ]
      }
    };

    const { queryByText } = render(
      <DetailsHeader {...props} taskRun={taskRun} />
    );
    expect(queryByText(/waiting/i)).toBeTruthy();
  });

  it('renders the pending state for a TaskRun', () => {
    const taskRun = {
      status: {
        conditions: [
          {
            reason: 'Pending',
            status: 'Unknown',
            type: 'Succeeded'
          }
        ]
      }
    };

    const { queryByText } = render(
      <DetailsHeader {...props} taskRun={taskRun} type="taskRun" />
    );
    expect(queryByText(/pending/i)).toBeTruthy();
  });

  it('renders no duration for a running step', () => {
    const stepStatus = {
      running: {
        startedAt: new Date()
      }
    };

    const { queryByText } = render(
      <DetailsHeader {...props} stepStatus={stepStatus} />
    );
    expect(queryByText(/duration/i)).toBeFalsy();
  });

  it('renders the duration for a terminated step', () => {
    const date = new Date();
    const stepStatus = {
      terminated: {
        finishedAt: date,
        startedAt: date
      }
    };

    const { queryByText } = render(
      <DetailsHeader {...props} stepStatus={stepStatus} />
    );
    expect(queryByText(/duration/i)).toBeTruthy();
    expect(queryByText(/0 seconds/i)).toBeTruthy();
  });

  it('renders no duration for a waiting step', () => {
    const stepStatus = {
      waiting: {}
    };

    const { queryByText } = render(
      <DetailsHeader {...props} stepStatus={stepStatus} />
    );
    expect(queryByText(/duration/i)).toBeFalsy();
  });

  it('renders the duration for a TaskRun', () => {
    const date = new Date();
    const taskRun = {
      status: {
        completionTime: date,
        conditions: [
          {
            reason: 'Completed',
            status: 'True',
            type: 'Succeeded'
          }
        ],
        startTime: date
      }
    };

    const { queryByText } = render(
      <DetailsHeader {...props} taskRun={taskRun} type="taskRun" />
    );
    expect(queryByText(/duration/i)).toBeTruthy();
  });
});
