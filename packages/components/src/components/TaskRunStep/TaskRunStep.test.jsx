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

import TaskRunStep, { getStepData } from './TaskRunStep';

describe('getStepData', () => {
  it('should return null when step is not found', () => {
    const steps = [{ name: 'step1' }];
    const result = getStepData({
      isSidecar: false,
      reason: 'Succeeded',
      selectedStepId: 'nonexistent',
      steps
    });
    expect(result).toBeNull();
  });

  it('should return step data for regular step', () => {
    const steps = [
      {
        name: 'step1',
        terminated: {
          exitCode: 0,
          reason: 'Completed'
        }
      }
    ];
    const result = getStepData({
      isSidecar: false,
      reason: 'Succeeded',
      selectedStepId: 'step1',
      steps
    });
    expect(result).toEqual({
      exitCode: 0,
      hasWarning: false,
      name: 'step1',
      selected: true,
      stepReason: 'Completed',
      stepStatus: 'terminated',
      terminationReason: undefined
    });
  });

  it('should mark step as cancelled when TaskRunCancelled', () => {
    const steps = [
      {
        name: 'step1',
        waiting: {}
      }
    ];
    const result = getStepData({
      isSidecar: false,
      reason: 'TaskRunCancelled',
      selectedStepId: 'step1',
      steps
    });
    expect(result.stepStatus).toBe('cancelled');
  });

  it('should set hasWarning when exit code is non-zero', () => {
    const steps = [
      {
        name: 'step1',
        terminated: {
          exitCode: 1,
          reason: 'Completed'
        }
      }
    ];
    const result = getStepData({
      isSidecar: false,
      reason: 'Succeeded',
      selectedStepId: 'step1',
      steps
    });
    expect(result.hasWarning).toBe(true);
    expect(result.exitCode).toBe(1);
  });

  it('should handle sidecar steps', () => {
    const steps = [
      {
        name: 'sidecar1',
        running: {}
      }
    ];
    const result = getStepData({
      isSidecar: true,
      reason: 'Running',
      selectedStepId: 'sidecar1',
      steps
    });
    expect(result.stepStatus).toBe('running');
  });
});

describe('TaskRunStep', () => {
  const defaultProps = {
    expandedSteps: {},
    getLogContainer: vi.fn(() => <div>Logs</div>),
    isSidecar: false,
    onStepSelected: vi.fn(),
    selectedRetry: 0,
    selectedTaskId: 'task1',
    step: {
      name: 'step1',
      terminated: {
        exitCode: 0,
        reason: 'Completed',
        startedAt: '2025-01-01T00:00:00Z',
        finishedAt: '2025-01-01T00:01:00Z'
      }
    },
    steps: [
      {
        name: 'step1',
        terminated: {
          exitCode: 0,
          reason: 'Completed'
        }
      }
    ],
    task: {},
    taskRun: {
      metadata: { name: 'taskrun1' }
    },
    taskRunReason: 'Succeeded'
  };

  it('should render step with status icon and name', () => {
    const { queryByText } = render(<TaskRunStep {...defaultProps} />);
    expect(queryByText('step1')).toBeTruthy();
  });

  it('should render duration for completed step', () => {
    const { container } = render(<TaskRunStep {...defaultProps} />);
    const duration = container.querySelector('.tkn--step-duration');
    expect(duration).toBeTruthy();
  });

  it('should not render duration for sidecar', () => {
    const { container } = render(<TaskRunStep {...defaultProps} isSidecar />);
    const duration = container.querySelector('.tkn--step-duration');
    expect(duration).toBeFalsy();
  });

  it('should call onStepSelected when heading is clicked', () => {
    const onStepSelected = vi.fn();
    const { container } = render(
      <TaskRunStep {...defaultProps} onStepSelected={onStepSelected} />
    );
    const heading = container.querySelector('.cds--accordion__heading');
    heading.click();
    expect(onStepSelected).toHaveBeenCalledWith({
      isOpen: true,
      selectedRetry: 0,
      selectedStepId: 'step1',
      selectedTaskId: 'task1',
      taskRunName: 'taskrun1'
    });
  });

  it('should render step definition and logs when expanded', () => {
    const expandedSteps = { step1: true };
    const { queryByText } = render(
      <TaskRunStep {...defaultProps} expandedSteps={expandedSteps} />
    );
    expect(queryByText('Definition')).toBeTruthy();
    expect(queryByText('Logs')).toBeTruthy();
  });

  it('should not render step definition and logs when collapsed', () => {
    const { queryByText } = render(<TaskRunStep {...defaultProps} />);
    expect(queryByText('Definition')).toBeFalsy();
    expect(queryByText('Logs')).toBeFalsy();
  });

  it('should render sidecar prefix for sidecar steps', () => {
    const { queryByText } = render(<TaskRunStep {...defaultProps} isSidecar />);
    expect(queryByText(/Sidecar:/)).toBeTruthy();
  });

  it('should handle skipped step', () => {
    const step = {
      name: 'step1',
      terminated: {
        reason: 'Completed'
      },
      terminationReason: 'Skipped'
    };
    const steps = [
      {
        name: 'step1',
        terminated: {
          reason: 'Completed'
        },
        terminationReason: 'Skipped'
      }
    ];
    const { container } = render(
      <TaskRunStep {...defaultProps} step={step} steps={steps} />
    );
    const accordionItem = container.querySelector(
      '[data-termination-reason="Skipped"]'
    );
    expect(accordionItem).toBeTruthy();
  });
});
