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

import { Accordion } from '@carbon/react';
import { action } from 'storybook/actions';

import TaskRunStep from './TaskRunStep';

export default {
  component: TaskRunStep,
  decorators: [
    Story => (
      <Accordion align="end" className="tkn--task-logs" ordered size="md">
        <Story />
      </Accordion>
    )
  ],
  title: 'TaskRunStep'
};

const baseProps = {
  expandedSteps: {},
  getLogContainer: () => <pre>Step logs would appear here...</pre>,
  isSidecar: false,
  onStepSelected: action('onStepSelected'),
  selectedRetry: 0,
  selectedTaskId: 'task-1',
  steps: [],
  task: {},
  taskRun: {
    metadata: { name: 'taskrun-1' }
  },
  taskRunReason: 'Succeeded'
};

export const CompletedStep = {
  args: {
    ...baseProps,
    step: {
      name: 'build',
      terminated: {
        exitCode: 0,
        reason: 'Completed',
        startedAt: '2025-01-01T10:00:00Z',
        finishedAt: '2025-01-01T10:05:30Z'
      }
    },
    steps: [
      {
        name: 'build',
        terminated: {
          exitCode: 0,
          reason: 'Completed'
        }
      }
    ]
  }
};

export const CompletedStepExpanded = {
  args: {
    ...baseProps,
    expandedSteps: { build: true },
    step: {
      name: 'build',
      terminated: {
        exitCode: 0,
        reason: 'Completed',
        startedAt: '2025-01-01T10:00:00Z',
        finishedAt: '2025-01-01T10:05:30Z'
      }
    },
    steps: [
      {
        name: 'build',
        terminated: {
          exitCode: 0,
          reason: 'Completed'
        }
      }
    ]
  }
};

export const CompletedWithWarning = {
  args: {
    ...baseProps,
    step: {
      name: 'test',
      terminated: {
        exitCode: 1,
        reason: 'Completed',
        startedAt: '2025-01-01T10:05:30Z',
        finishedAt: '2025-01-01T10:06:00Z'
      }
    },
    steps: [
      {
        name: 'test',
        terminated: {
          exitCode: 1,
          reason: 'Completed'
        }
      }
    ]
  }
};

export const RunningStep = {
  args: {
    ...baseProps,
    step: {
      name: 'deploy',
      running: {
        startedAt: '2025-01-01T10:06:00Z'
      }
    },
    steps: [
      {
        name: 'deploy',
        running: {
          startedAt: '2025-01-01T10:06:00Z'
        }
      }
    ],
    taskRunReason: 'Running'
  }
};

export const FailedStep = {
  args: {
    ...baseProps,
    step: {
      name: 'validate',
      terminated: {
        exitCode: 1,
        reason: 'Error',
        startedAt: '2025-01-01T10:00:00Z',
        finishedAt: '2025-01-01T10:00:30Z'
      }
    },
    steps: [
      {
        name: 'validate',
        terminated: {
          exitCode: 1,
          reason: 'Error'
        }
      }
    ],
    taskRunReason: 'Failed'
  }
};

export const SkippedStep = {
  args: {
    ...baseProps,
    step: {
      name: 'optional-step',
      terminated: {
        reason: 'Completed'
      },
      terminationReason: 'Skipped'
    },
    steps: [
      {
        name: 'optional-step',
        terminated: {
          reason: 'Completed'
        },
        terminationReason: 'Skipped'
      }
    ]
  }
};

export const CancelledStep = {
  args: {
    ...baseProps,
    step: {
      name: 'long-running',
      waiting: {}
    },
    steps: [
      {
        name: 'long-running',
        waiting: {}
      }
    ],
    taskRunReason: 'TaskRunCancelled'
  }
};

export const WaitingStep = {
  args: {
    ...baseProps,
    step: {
      name: 'pending',
      waiting: {}
    },
    steps: [
      {
        name: 'pending',
        waiting: {}
      }
    ],
    taskRunReason: 'Pending'
  }
};

export const SidecarStep = {
  args: {
    ...baseProps,
    isSidecar: true,
    step: {
      name: 'logging-sidecar',
      running: {
        startedAt: '2025-01-01T10:00:00Z'
      }
    },
    steps: [
      {
        name: 'logging-sidecar',
        running: {
          startedAt: '2025-01-01T10:00:00Z'
        }
      }
    ],
    taskRunReason: 'Running'
  }
};

export const MultipleSteps = {
  render: () => {
    const steps = [
      {
        name: 'clone',
        terminated: {
          exitCode: 0,
          reason: 'Completed',
          startedAt: '2025-01-01T10:00:00Z',
          finishedAt: '2025-01-01T10:01:00Z'
        }
      },
      {
        name: 'build',
        running: {
          startedAt: '2025-01-01T10:01:00Z'
        }
      },
      {
        name: 'test',
        waiting: {}
      }
    ];

    return (
      <Accordion align="end" className="tkn--task-logs" ordered size="md">
        {steps.map(step => (
          <TaskRunStep
            key={step.name}
            {...baseProps}
            step={step}
            steps={steps}
            taskRunReason="Running"
          />
        ))}
      </Accordion>
    );
  }
};
