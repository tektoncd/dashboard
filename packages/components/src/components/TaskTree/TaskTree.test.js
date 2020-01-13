/*
Copyright 2019-2020 The Tekton Authors
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
      succeeded: 'True',
      steps: [
        { id: 'build', stepName: 'build' },
        { id: 'test', stepName: 'test' }
      ]
    },
    {
      id: 'task2',
      succeeded: 'True',
      pipelineTaskName: 'A Second Task',
      steps: [
        { id: 'build', stepName: 'build' },
        { id: 'test', stepName: 'test' }
      ]
    },
    {
      id: 'task3',
      succeeded: 'True',
      pipelineTaskName: 'A Third Task',
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

it('TaskTree renders when taskRuns is falsy', () => {
  renderWithIntl(<TaskTree {...props} taskRuns={null} />);
});

it('TaskTree renders when taskRuns contains a falsy run', () => {
  renderWithIntl(<TaskTree {...props} taskRuns={[null]} />);
});

it('TaskTree renders and expands first Task in TaskRun with no error', () => {
  const { queryByText } = renderWithIntl(<TaskTree {...props} />);
  // Selected Task should have two child elements. The anchor and ordered list
  // of steps in expanded task
  expect(queryByText('A Task').parentNode.childNodes).toHaveLength(2);
  expect(queryByText('A Second Task').parentNode.childNodes).toHaveLength(1);
  expect(queryByText('A Third Task').parentNode.childNodes).toHaveLength(1);
});

it('TaskTree renders and expands error Task in TaskRun', () => {
  props.taskRuns[1].succeeded = 'False';

  const { queryByText } = renderWithIntl(<TaskTree {...props} />);
  // Selected Task should have two child elements. The anchor and ordered list
  // of steps in expanded task
  expect(queryByText('A Task').parentNode.childNodes).toHaveLength(1);
  expect(queryByText('A Second Task').parentNode.childNodes).toHaveLength(2);
  expect(queryByText('A Third Task').parentNode.childNodes).toHaveLength(1);
});

it('TaskTree renders and expands first error Task in TaskRun', () => {
  props.taskRuns[1].succeeded = 'False';
  props.taskRuns[2].succeeded = 'False';

  const { queryByText } = renderWithIntl(<TaskTree {...props} />);
  // Selected Task should have two child elements. The anchor and ordered list
  // of steps in expanded task
  expect(queryByText('A Task').parentNode.childNodes).toHaveLength(1);
  expect(queryByText('A Second Task').parentNode.childNodes).toHaveLength(2);
  expect(queryByText('A Third Task').parentNode.childNodes).toHaveLength(1);
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
