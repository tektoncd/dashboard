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
import { fireEvent, waitFor } from '@testing-library/react';
import Task from './Task';
import { render } from '../../utils/test';

const props = {
  onSelect: () => {},
  displayName: 'A Task'
};

describe('Task', () => {
  it('renders default content', () => {
    const { queryByText } = render(<Task {...props} />);
    expect(queryByText(/a task/i)).toBeTruthy();
  });

  it('does not render steps in collapsed state', () => {
    const steps = [{ name: 'a step' }];
    const { queryByText } = render(<Task {...props} steps={steps} />);
    expect(queryByText(/a step/i)).toBeFalsy();
  });

  it('renders steps in expanded state', () => {
    const steps = [{ name: 'a step' }];
    const { queryByText } = render(<Task {...props} expanded steps={steps} />);
    expect(queryByText(/a step/i)).toBeTruthy();
  });

  it('renders first step in expanded Task with no error', () => {
    const steps = [
      { name: 'a step', terminated: { reason: 'Completed' } },
      { name: 'a step two', terminated: { reason: 'Completed' } }
    ];
    const { queryByText } = render(<Task {...props} expanded steps={steps} />);
    waitFor(() =>
      queryByText(
        (content, element) =>
          content === 'a step' &&
          element.parentNode.parentNode.getAttribute('data-selected')
      )
    );
  });

  it('renders error step in expanded Task', () => {
    const steps = [
      { name: 'a step', terminated: { reason: 'Completed' } },
      { name: 'a step two', terminated: { reason: 'Error' } }
    ];
    const { queryByText } = render(<Task {...props} expanded steps={steps} />);
    waitFor(() =>
      queryByText(
        (content, element) =>
          content === 'a step two' &&
          element.parentNode.parentNode.getAttribute('data-selected')
      )
    );
  });

  it('renders cancelled step in expanded Task', () => {
    const steps = [
      { name: 'a step', terminated: { reason: 'Completed' } },
      { name: 'a step two', terminated: { reason: undefined } }
    ];
    const { queryByText } = render(<Task {...props} expanded steps={steps} />);
    waitFor(() =>
      queryByText(
        (content, element) =>
          content === 'a step two' &&
          element.parentNode.parentNode.getAttribute('data-selected')
      )
    );
  });

  it('renders completed steps in expanded state', () => {
    const steps = [
      { name: 'step 1', terminated: { reason: 'Completed' } },
      { name: 'step 2', terminated: { reason: 'Error' } },
      { name: 'step 3', terminated: { reason: 'Completed' } }
    ];
    const { queryByText } = render(<Task {...props} expanded steps={steps} />);
    expect(queryByText(/step 1/i)).toBeTruthy();
    expect(queryByText(/step 2/i)).toBeTruthy();
    expect(queryByText(/step 3/i)).toBeTruthy();
  });

  it('renders success state', () => {
    render(<Task {...props} succeeded="True" />);
  });

  it('renders failure state', () => {
    render(<Task {...props} succeeded="False" />);
  });

  it('renders unknown state', () => {
    render(<Task {...props} succeeded="Unknown" />);
  });

  it('renders pending state', () => {
    render(<Task {...props} succeeded="Unknown" reason="Pending" />);
  });

  it('renders running state', () => {
    render(<Task {...props} succeeded="Unknown" reason="Running" />);
  });

  it('renders cancelled state', () => {
    render(
      <Task
        {...props}
        expanded
        succeeded="Unknown"
        reason="TaskRunCancelled"
        steps={[{ name: 'a step', waiting: {} }]}
      />
    );
  });

  it('renders selected step state', () => {
    const steps = [{ name: 'a step' }];
    render(
      <Task {...props} expanded selectedStepId="some-step" steps={steps} />
    );
  });

  it('handles click event', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <Task displayName="build" onSelect={onSelect} />
    );
    fireEvent.click(getByText(/build/i));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('handles click event on Step', () => {
    const onSelect = jest.fn();
    const steps = [{ name: 'build' }];
    const { getByText } = render(
      <Task displayName="A Task" expanded onSelect={onSelect} steps={steps} />
    );
    expect(onSelect).not.toHaveBeenCalled();

    onSelect.mockClear();
    fireEvent.click(getByText(/build/i));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
