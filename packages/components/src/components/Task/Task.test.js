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
import { fireEvent } from '@testing-library/react';
import Task from './Task';
import { render } from '../../utils/test';

const props = {
  displayName: 'A Task',
  id: 'fake_task_id',
  onSelect: () => {}
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

  it('automatically selects first step in expanded Task with no error', () => {
    const firstStepName = 'a step';
    const steps = [
      { name: firstStepName, terminated: { reason: 'Completed' } },
      { name: 'a step two', terminated: { reason: 'Completed' } }
    ];

    const onSelect = jest.fn();

    render(
      <Task
        {...props}
        expanded
        onSelect={onSelect}
        selectDefaultStep
        steps={steps}
      />
    );

    expect(onSelect).toHaveBeenCalledWith(props.id, firstStepName);
  });

  it('automatically selects first error step in expanded Task', () => {
    const errorStepName = 'a step two';
    const steps = [
      { name: 'a step', terminated: { reason: 'Completed' } },
      { name: errorStepName, terminated: { reason: 'Error' } }
    ];

    const onSelect = jest.fn();

    render(
      <Task
        {...props}
        expanded
        onSelect={onSelect}
        selectDefaultStep
        steps={steps}
      />
    );

    expect(onSelect).toHaveBeenCalledWith(props.id, errorStepName);
  });

  it('handles no steps', () => {
    const onSelect = jest.fn();

    render(
      <Task
        {...props}
        expanded
        onSelect={onSelect}
        selectDefaultStep
        steps={[]}
      />
    );

    expect(onSelect).toHaveBeenCalledWith(props.id, undefined);
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
    const stepName = 'a step';
    const steps = [{ name: stepName }];
    const { getByText } = render(
      <Task {...props} expanded selectedStepId={stepName} steps={steps} />
    );

    expect(
      getByText(
        (content, element) =>
          content === stepName &&
          element.parentNode.parentNode.getAttribute('data-selected')
      )
    ).toBeTruthy();
  });

  it('handles click event', () => {
    const onSelect = jest.fn();
    const { getByText } = render(<Task {...props} onSelect={onSelect} />);
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(getByText(props.displayName));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(props.id, null);
  });

  it('handles click event on Step', () => {
    const onSelect = jest.fn();
    const stepName = 'build';
    const steps = [{ name: stepName }];
    const { getByText } = render(
      <Task {...props} expanded onSelect={onSelect} steps={steps} />
    );
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(getByText(stepName));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(props.id, stepName);
  });
});
