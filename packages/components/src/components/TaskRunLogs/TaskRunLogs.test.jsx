/*
Copyright 2026 The Tekton Authors
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

import { render } from '../../utils/test';

import TaskRunLogs from './TaskRunLogs';

describe('TaskRunLogs', () => {
  const defaultProps = {
    expandedSteps: {},
    getLogContainer: vi.fn(() => <div>Logs</div>),
    ignoredSidecars: {},
    onStepSelected: vi.fn(),
    selectedRetry: 0,
    selectedTaskId: 'task1',
    skippedTask: false,
    task: {},
    taskRun: {
      status: {
        steps: [
          {
            name: 'step1',
            terminated: {
              exitCode: 0,
              reason: 'Completed'
            }
          }
        ]
      }
    }
  };

  it('should render steps in an accordion', () => {
    const { queryByText } = render(<TaskRunLogs {...defaultProps} />);
    expect(queryByText('step1')).toBeTruthy();
  });

  it('should display message when no steps are available', () => {
    const taskRun = { status: {} };
    const { queryByText } = render(
      <TaskRunLogs {...defaultProps} taskRun={taskRun} />
    );
    expect(
      queryByText('No logs are available. See status for more details.')
    ).toBeTruthy();
  });

  it('should display message when TaskRun status not available', () => {
    const taskRun = {};
    const { queryByText } = render(
      <TaskRunLogs {...defaultProps} taskRun={taskRun} />
    );
    expect(
      queryByText('No logs are available. See status for more details.')
    ).toBeTruthy();
  });

  it('should display message when task is skipped', () => {
    const { queryByText } = render(
      <TaskRunLogs {...defaultProps} skippedTask />
    );
    expect(
      queryByText(
        'This step did not run as the task was skipped. See status for more details.'
      )
    ).toBeTruthy();
  });

  it('should render multiple steps', () => {
    const taskRun = {
      status: {
        steps: [
          {
            name: 'step1',
            terminated: {
              exitCode: 0,
              reason: 'Completed'
            }
          },
          {
            name: 'step2',
            terminated: {
              exitCode: 0,
              reason: 'Completed'
            }
          }
        ]
      }
    };
    const { queryByText } = render(
      <TaskRunLogs {...defaultProps} taskRun={taskRun} />
    );
    expect(queryByText('step1')).toBeTruthy();
    expect(queryByText('step2')).toBeTruthy();
  });

  it('should auto-expand single step', () => {
    const { queryByText } = render(<TaskRunLogs {...defaultProps} />);
    // When there's only one step, it should be expanded and show logs
    expect(queryByText('Logs')).toBeTruthy();
  });

  it('should render sidecars', () => {
    const taskRun = {
      status: {
        steps: [
          {
            name: 'step1',
            terminated: {
              exitCode: 0,
              reason: 'Completed'
            }
          }
        ],
        sidecars: [
          {
            name: 'sidecar1',
            running: {}
          }
        ]
      }
    };
    const { queryByText } = render(
      <TaskRunLogs {...defaultProps} taskRun={taskRun} />
    );
    expect(queryByText('step1')).toBeTruthy();
    expect(queryByText('Sidecar: sidecar1')).toBeTruthy();
  });

  it('should filter ignored sidecars', () => {
    const taskRun = {
      status: {
        steps: [
          {
            name: 'step1',
            terminated: {
              exitCode: 0,
              reason: 'Completed'
            }
          }
        ],
        sidecars: [
          {
            name: 'sidecar1',
            running: {}
          },
          {
            name: 'sidecar2',
            running: {}
          }
        ]
      }
    };
    const ignoredSidecars = { sidecar2: true };
    const { queryByText } = render(
      <TaskRunLogs
        {...defaultProps}
        ignoredSidecars={ignoredSidecars}
        taskRun={taskRun}
      />
    );
    expect(queryByText('Sidecar: sidecar1')).toBeTruthy();
    expect(queryByText('Sidecar: sidecar2')).toBeFalsy();
  });

  it('should pass correct props to TaskRunStep', () => {
    const onStepSelected = vi.fn();
    const { container } = render(
      <TaskRunLogs {...defaultProps} onStepSelected={onStepSelected} />
    );
    const heading = container.querySelector('.cds--accordion__heading');
    heading.click();
    expect(onStepSelected).toHaveBeenCalled();
  });
});
