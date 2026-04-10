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

import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';

import TaskRunLogs from './TaskRunLogs';

export default {
  component: TaskRunLogs,
  title: 'TaskRunLogs'
};

const baseProps = {
  expandedSteps: {},
  getLogContainer: () => (
    <pre>
      {`[2025-01-01 10:00:00] Starting step…
[2025-01-01 10:00:01] Processing files…
${Array.from({ length: 50 }, (_, index) => `[2025-01-01 10:00:02] ${index}`).join('\n')}
[2025-01-01 10:00:05] Step completed successfully`}
    </pre>
  ),
  ignoredSidecars: {},
  onStepSelected: action('onStepSelected'),
  selectedRetry: 0,
  selectedTaskId: 'task-1',
  skippedTask: false,
  task: {
    spec: {
      steps: [
        {
          args: [
            'build',
            '-f',
            '${params.pathToDockerFile}',
            '-t',
            '${resources.outputs.builtImage.url}',
            '${params.pathToContext}'
          ],
          command: ['docker'],
          image: 'docker',
          name: 'build',
          volumeMounts: [
            {
              mountPath: '/var/run/docker.sock',
              name: 'docker-socket'
            }
          ]
        }
      ]
    }
  }
};

export const SingleStep = {
  args: {
    ...baseProps,
    taskRun: {
      metadata: { name: 'taskrun-1' },
      status: {
        steps: [
          {
            name: 'build',
            terminated: {
              exitCode: 0,
              reason: 'Completed',
              startedAt: '2025-01-01T10:00:00Z',
              finishedAt: '2025-01-01T10:05:30Z'
            }
          }
        ]
      }
    }
  }
};

export const MultipleSteps = {
  args: {
    ...baseProps,
    taskRun: {
      metadata: { name: 'taskrun-1' },
      status: {
        steps: [
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
            terminated: {
              exitCode: 0,
              reason: 'Completed',
              startedAt: '2025-01-01T10:01:00Z',
              finishedAt: '2025-01-01T10:05:30Z'
            }
          },
          {
            name: 'test',
            terminated: {
              exitCode: 0,
              reason: 'Completed',
              startedAt: '2025-01-01T10:05:30Z',
              finishedAt: '2025-01-01T10:06:00Z'
            }
          }
        ]
      }
    }
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return (
      <TaskRunLogs
        {...args}
        onStepSelected={({ isOpen, selectedStepId: stepId }) =>
          updateArgs({
            expandedSteps: { ...args.expandedSteps, [stepId]: isOpen }
          })
        }
      />
    );
  }
};

export const WithRunningStep = {
  args: {
    ...baseProps,
    taskRun: {
      metadata: { name: 'taskrun-1' },
      status: {
        steps: [
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
        ]
      }
    }
  }
};

export const WithFailedStep = {
  args: {
    ...baseProps,
    taskRun: {
      metadata: { name: 'taskrun-1' },
      status: {
        steps: [
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
            terminated: {
              exitCode: 1,
              reason: 'Error',
              startedAt: '2025-01-01T10:01:00Z',
              finishedAt: '2025-01-01T10:01:30Z'
            }
          }
        ]
      }
    }
  }
};

export const WithSidecars = {
  args: {
    ...baseProps,
    taskRun: {
      metadata: { name: 'taskrun-1' },
      status: {
        steps: [
          {
            name: 'build',
            terminated: {
              exitCode: 0,
              reason: 'Completed',
              startedAt: '2025-01-01T10:00:00Z',
              finishedAt: '2025-01-01T10:05:30Z'
            }
          }
        ],
        sidecars: [
          {
            name: 'logging',
            running: {
              startedAt: '2025-01-01T10:00:00Z'
            }
          },
          {
            name: 'monitoring',
            running: {
              startedAt: '2025-01-01T10:00:00Z'
            }
          }
        ]
      }
    }
  },
  render: args => {
    const [, updateArgs] = useArgs();
    return (
      <TaskRunLogs
        {...args}
        onStepSelected={({ isOpen, selectedStepId: stepId }) =>
          updateArgs({
            expandedSteps: { ...args.expandedSteps, [stepId]: isOpen }
          })
        }
      />
    );
  }
};

export const WithIgnoredSidecars = {
  args: {
    ...baseProps,
    ignoredSidecars: { monitoring: true },
    taskRun: {
      metadata: { name: 'taskrun-1' },
      status: {
        steps: [
          {
            name: 'build',
            terminated: {
              exitCode: 0,
              reason: 'Completed',
              startedAt: '2025-01-01T10:00:00Z',
              finishedAt: '2025-01-01T10:05:30Z'
            }
          }
        ],
        sidecars: [
          {
            name: 'logging',
            running: {
              startedAt: '2025-01-01T10:00:00Z'
            }
          },
          {
            name: 'monitoring',
            running: {
              startedAt: '2025-01-01T10:00:00Z'
            }
          }
        ]
      }
    }
  }
};

export const NoStepsAvailable = {
  args: {
    ...baseProps,
    taskRun: {
      metadata: { name: 'taskrun-1' },
      status: {}
    }
  }
};

export const SkippedTask = {
  args: {
    ...baseProps,
    skippedTask: true,
    taskRun: {
      metadata: { name: 'taskrun-1' },
      status: {
        steps: []
      }
    }
  }
};

export const WithExpandedStep = {
  args: {
    ...baseProps,
    expandedSteps: { build: true },
    taskRun: {
      metadata: { name: 'taskrun-1' },
      status: {
        steps: [
          {
            name: 'build',
            terminated: {
              exitCode: 0,
              reason: 'Completed',
              startedAt: '2025-01-01T10:00:00Z',
              finishedAt: '2025-01-01T10:05:30Z'
            }
          },
          {
            name: 'test',
            terminated: {
              exitCode: 0,
              reason: 'Completed',
              startedAt: '2025-01-01T10:05:30Z',
              finishedAt: '2025-01-01T10:06:00Z'
            }
          }
        ]
      }
    }
  }
};
