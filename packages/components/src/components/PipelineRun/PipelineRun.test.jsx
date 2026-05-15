/*
Copyright 2019-2026 The Tekton Authors
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

import { Component as ReactComponent } from 'react';
import { waitFor } from '@testing-library/react';
import PipelineRun from './PipelineRun';
import { render } from '../../utils/test';

it('PipelineRunContainer renders', async () => {
  const { getByText } = render(<PipelineRun error={null} loading={false} />);
  await waitFor(() => getByText('PipelineRun not found'));
});

it('PipelineRunContainer handles error state', async () => {
  const { getByText } = render(<PipelineRun error="Error" />);
  await waitFor(() => getByText('Error loading PipelineRun'));
});

it('PipelineRunContainer handles init step failures', async () => {
  const initStepName = 'my-failed-init-step';
  const pipelineRunName = 'fake_pipelineRunName';
  const taskRunName = 'fake_taskRunName';
  const pipelineTaskName = 'fake_pipelineTaskName';
  const handleTaskSelected = vi.fn();

  const taskRun = {
    metadata: {
      name: taskRunName,
      labels: {
        'tekton.dev/pipelineTask': pipelineTaskName
      },
      uid: '41deea80-53bc-4500-a20e-3b18549e23ab'
    },
    spec: {
      params: {},
      taskSpec: {}
    },
    status: {
      steps: [
        {
          terminated: {},
          name: initStepName
        }
      ]
    }
  };

  const pipelineRun = {
    metadata: {
      name: pipelineRunName
    },
    status: {
      taskRuns: [] // TODO: remove after TEP-0100 feature flag 'embedded-status' is removed
    }
  };

  render(
    <PipelineRun
      handleTaskSelected={handleTaskSelected}
      pipelineRun={pipelineRun}
      taskRuns={[taskRun]}
      tasks={[]}
    />
  );
  await waitFor(() =>
    expect(handleTaskSelected).toHaveBeenCalledWith({
      selectedRetry: undefined,
      selectedStepId: undefined,
      selectedTaskId: pipelineTaskName,
      taskRunName: undefined
    })
  );
});

it('PipelineRunContainer handles init step failures for retry', async () => {
  const initStepName = 'my-failed-init-step';
  const pipelineRunName = 'fake_pipelineRunName';
  const taskRunName = 'fake_taskRunName';

  const taskRun = {
    metadata: {
      labels: {
        'tekton.dev/pipelineTask': 'task-1'
      },
      name: taskRunName,
      uid: 'b4402feb-69fe-4a5a-a0c2-5e390aa58894'
    },
    spec: {
      params: {},
      taskSpec: {}
    },
    status: {
      conditions: [
        {
          type: 'Succeeded',
          status: 'False'
        }
      ],
      podName: 'taskrun-pod-name',
      steps: [
        {
          name: initStepName,
          terminated: {}
        }
      ],
      retriesStatus: [
        {
          status: {
            podName: 'retry-pod-name',
            steps: [
              {
                name: initStepName,
                terminated: {}
              }
            ]
          }
        }
      ]
    }
  };
  const pipelineRun = {
    metadata: {
      name: pipelineRunName
    },
    status: {
      childReferences: [
        {
          name: taskRunName,
          pipelineTaskName: 'task-1'
        }
      ]
    }
  };

  class TestWrapper extends ReactComponent {
    state = {
      selectedStepId: null,
      selectedTaskId: 'task-1'
    };

    handleTaskSelected = ({ selectedTaskId }) => {
      this.setState({
        selectedTaskId: selectedTaskId ?? this.state.selectedTaskId
      });
    };

    render() {
      const { children: Component } = this.props;
      return (
        <Component
          handleTaskSelected={this.handleTaskSelected}
          selectedTaskId={this.state.selectedTaskId}
        />
      );
    }
  }

  const { getByText } = render(
    <TestWrapper>
      {({ handleTaskSelected, selectedTaskId }) => (
        <PipelineRun
          handleTaskSelected={handleTaskSelected}
          pipelineRun={pipelineRun}
          selectedRetry="0"
          selectedTaskId={selectedTaskId}
          taskRuns={[taskRun]}
          tasks={[]}
        />
      )}
    </TestWrapper>
  );
  await waitFor(() => getByText('task-1'));
});
