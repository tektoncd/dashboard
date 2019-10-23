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
import { fireEvent } from 'react-testing-library';
import Task from './Task';
import { renderWithIntl } from '../../utils/test';

const props = {
  onSelect: () => {},
  pipelineTaskName: 'A Task'
};

it('Task renders default content', () => {
  const { queryByText } = renderWithIntl(<Task {...props} />);
  expect(queryByText(/a task/i)).toBeTruthy();
});

it('Task does not render steps in collapsed state', () => {
  const steps = [{ stepName: 'a step' }];
  const { queryByText } = renderWithIntl(<Task {...props} steps={steps} />);
  expect(queryByText(/a step/i)).toBeFalsy();
});

it('Task renders steps in expanded state', () => {
  const steps = [{ id: 'step', stepName: 'a step' }];
  const { queryByText } = renderWithIntl(
    <Task {...props} expanded steps={steps} />
  );
  expect(queryByText(/a step/i)).toBeTruthy();
});

it('Task renders completed steps in expanded state', () => {
  const steps = [
    { id: 'step1', stepName: 'step 1', reason: 'Completed' },
    { id: 'step2', stepName: 'step 2', reason: 'Error' },
    { id: 'step3', stepName: 'step 3', reason: 'Completed' }
  ];
  const { queryByText } = renderWithIntl(
    <Task {...props} expanded steps={steps} />
  );
  expect(queryByText(/step 1/i)).toBeTruthy();
  expect(queryByText(/step 2/i)).toBeTruthy();
  expect(queryByText(/step 3/i)).toBeTruthy();
});

it('Task renders success state', () => {
  renderWithIntl(<Task {...props} succeeded="True" />);
});

it('Task renders failure state', () => {
  renderWithIntl(<Task {...props} succeeded="False" />);
});

it('Task renders unknown state', () => {
  renderWithIntl(<Task {...props} succeeded="Unknown" />);
});

it('Task renders unknown state', () => {
  renderWithIntl(<Task {...props} succeeded="Unknown" reason="Pending" />);
});

it('Task renders cancelled state', () => {
  renderWithIntl(
    <Task {...props} succeeded="Unknown" reason="TaskRunCancelled" />
  );
});

it('Task handles click event', () => {
  const onSelect = jest.fn();
  const { getByText } = renderWithIntl(
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
  const { getByText } = renderWithIntl(
    <Task
      expanded
      onSelect={onSelect}
      pipelineTaskName="A Task"
      steps={steps}
    />
  );
  expect(onSelect).toHaveBeenCalledTimes(1);
  onSelect.mockClear();
  fireEvent.click(getByText(/build/i));
  expect(onSelect).toHaveBeenCalledTimes(1);
});
