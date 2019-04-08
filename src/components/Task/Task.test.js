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
import { fireEvent, render } from 'react-testing-library';
import Task from './Task';

const props = {
  pipelineTaskName: 'A Task'
};

it('Task renders default content', () => {
  const { queryByText } = render(<Task {...props} />);
  expect(queryByText(/a task/i)).toBeTruthy();
});

it('Task does not render steps in collapsed state', () => {
  const steps = [{ stepName: 'a step' }];
  const { queryByText } = render(<Task {...props} steps={steps} />);
  expect(queryByText(/a step/i)).toBeFalsy();
});

it('Task renders steps in expanded state', () => {
  const steps = [{ id: 'step', stepName: 'a step' }];
  const { queryByText } = render(<Task {...props} expanded steps={steps} />);
  expect(queryByText(/a step/i)).toBeTruthy();
});

it('Task renders success state', () => {
  render(<Task {...props} succeeded="True" />);
});

it('Task renders failure state', () => {
  render(<Task {...props} succeeded="False" />);
});

it('Task renders unknown state', () => {
  render(<Task {...props} succeeded="Unknown" />);
});

it('Task renders unknown state', () => {
  render(<Task {...props} succeeded="Unknown" reason="Pending" />);
});

it('Task handles click event', () => {
  const onSelect = jest.fn();
  const { getByText } = render(
    <Task pipelineTaskName="build" onSelect={onSelect} />
  );
  fireEvent.click(getByText(/build/i));
  expect(onSelect).toHaveBeenCalledTimes(1);
});

it('Task handle click event on Step', () => {
  const onStepSelect = jest
    .fn()
    .mockImplementation(event => event.preventDefault());
  const onSelect = jest.fn();
  const steps = [{ id: 'build', stepName: 'build', onSelect: onStepSelect }];
  const { getByText } = render(
    <Task
      expanded
      onSelect={onSelect}
      pipelineTaskName="A Task"
      steps={steps}
    />
  );
  fireEvent.click(getByText(/build/i));
  expect(onSelect).toHaveBeenCalledTimes(1);
});
