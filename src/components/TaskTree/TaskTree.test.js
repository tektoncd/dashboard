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
import TaskTree from './TaskTree';

const props = {
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
  render(<TaskTree {...props} />);
});

it('TaskTree handles click event on Task', () => {
  const onSelect = jest.fn();
  const { getByText } = render(<TaskTree {...props} onSelect={onSelect} />);
  fireEvent.click(getByText(/a task/i));
  expect(onSelect).toHaveBeenCalledTimes(1);
});

it('TaskTree handles click event on Step', () => {
  const onSelect = jest.fn();
  const { getByText } = render(
    <TaskTree {...props} selectedTaskId="task" onSelect={onSelect} />
  );
  fireEvent.click(getByText(/build/i));
  expect(onSelect).toHaveBeenCalledTimes(1);
});
