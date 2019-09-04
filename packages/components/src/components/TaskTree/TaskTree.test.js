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
import TaskTree from './TaskTree';
import { renderWithIntl } from '../../utils/test';

const props = {
  onSelect: () => {},
  taskRuns: [
    {
      id: 'task',
      pipelineTaskName: 'A Task',
      steps: [
        { id: 'build', stepName: 'build' },
        { id: 'test', stepName: 'test' }
      ]
    }
  ]
};

it('TaskTree renders', () => {
  renderWithIntl(<TaskTree {...props} />);
});

it('TaskTree handles click event on Task', () => {
  const onSelect = jest.fn();
  const { getByText } = renderWithIntl(
    <TaskTree {...props} onSelect={onSelect} />
  );
  expect(onSelect).toHaveBeenCalledTimes(1);
  onSelect.mockClear();
  fireEvent.click(getByText(/a task/i));
  expect(onSelect).toHaveBeenCalledTimes(1);
});

it('TaskTree handles click event on Step', () => {
  const onSelect = jest.fn();
  const { getByText } = renderWithIntl(
    <TaskTree {...props} selectedTaskId="task" onSelect={onSelect} />
  );
  onSelect.mockClear();
  fireEvent.click(getByText(/build/i));
  expect(onSelect).toHaveBeenCalledTimes(1);
});
