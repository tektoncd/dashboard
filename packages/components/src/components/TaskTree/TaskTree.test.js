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
import TaskTree from './TaskTree';
import { render } from '../../utils/test';

const getProps = () => ({
  onSelect: () => {},
  taskRuns: [
    {
      metadata: {
        labels: {
          'tekton.dev/pipelineTask': 'A Task'
        },
        uid: 'task'
      },
      status: {
        conditions: [
          {
            type: 'Succeeded',
            status: 'True'
          }
        ],
        steps: [{ name: 'build' }, { name: 'test' }]
      }
    },
    {
      metadata: {
        labels: {
          'tekton.dev/pipelineTask': 'A Second Task'
        },
        uid: 'task2'
      },
      status: {
        conditions: [
          {
            type: 'Succeeded',
            status: 'True'
          }
        ],
        steps: [{ name: 'build' }, { name: 'test' }]
      }
    },
    {
      metadata: {
        labels: {
          'tekton.dev/pipelineTask': 'A Third Task'
        },
        uid: 'task3'
      },
      status: {
        conditions: [
          {
            type: 'Succeeded',
            status: 'True'
          }
        ],
        steps: [{ name: 'build' }, { name: 'test' }]
      }
    }
  ]
});

it('TaskTree renders', () => {
  render(<TaskTree {...getProps()} />);
});

it('TaskTree renders when taskRuns is falsy', () => {
  render(<TaskTree {...getProps()} taskRuns={null} />);
});

it('TaskTree renders when taskRuns contains a falsy run', () => {
  render(<TaskTree {...getProps()} taskRuns={[null]} />);
});

it('TaskTree renders and expands first Task in TaskRun with no error', () => {
  const { queryByText } = render(<TaskTree {...getProps()} />);
  // Selected Task should have two child elements. The anchor and ordered list
  // of steps in expanded task
  expect(queryByText('A Task').parentNode.parentNode.childNodes).toHaveLength(
    2
  );
  expect(
    queryByText('A Second Task').parentNode.parentNode.childNodes
  ).toHaveLength(1);
  expect(
    queryByText('A Third Task').parentNode.parentNode.childNodes
  ).toHaveLength(1);
});

it('TaskTree renders and expands error Task in TaskRun', () => {
  const props = getProps();
  props.taskRuns[1].status.conditions[0].status = 'False';

  const { queryByText } = render(<TaskTree {...props} />);
  // Selected Task should have two child elements. The anchor and ordered list
  // of steps in expanded task
  expect(queryByText('A Task').parentNode.parentNode.childNodes).toHaveLength(
    1
  );
  expect(
    queryByText('A Second Task').parentNode.parentNode.childNodes
  ).toHaveLength(2);
  expect(
    queryByText('A Third Task').parentNode.parentNode.childNodes
  ).toHaveLength(1);
});

it('TaskTree renders and expands first error Task in TaskRun', () => {
  const props = getProps();
  props.taskRuns[1].status.conditions[0].status = 'False';
  props.taskRuns[2].status.conditions[0].status = 'False';

  const { queryByText } = render(<TaskTree {...props} />);
  // Selected Task should have two child elements. The anchor and ordered list
  // of steps in expanded task
  expect(queryByText('A Task').parentNode.parentNode.childNodes).toHaveLength(
    1
  );
  expect(
    queryByText('A Second Task').parentNode.parentNode.childNodes
  ).toHaveLength(2);
  expect(
    queryByText('A Third Task').parentNode.parentNode.childNodes
  ).toHaveLength(1);
});

it('TaskTree handles click event on Task', () => {
  const onSelect = jest.fn();
  const { getByText } = render(
    <TaskTree {...getProps()} onSelect={onSelect} />
  );
  expect(onSelect).toHaveBeenCalledTimes(1);
  onSelect.mockClear();
  fireEvent.click(getByText(/a task/i));
  expect(onSelect).toHaveBeenCalledTimes(1);
});

it('TaskTree handles click event on Step', () => {
  const onSelect = jest.fn();
  const { getByText } = render(
    <TaskTree {...getProps()} selectedTaskId="task" onSelect={onSelect} />
  );
  onSelect.mockClear();
  fireEvent.click(getByText(/build/i));
  expect(onSelect).toHaveBeenCalledTimes(1);
});
