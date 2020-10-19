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

import React, { useState } from 'react';
import { text } from '@storybook/addon-knobs';

import TaskTree from './TaskTree';

export default {
  component: TaskTree,
  title: 'Components/TaskTree'
};

export const Base = () => {
  const props = {
    taskRuns: [
      {
        id: 'task',
        pipelineTaskName: text('Task 1 name', 'Task 1'),
        steps: [
          { id: 'build', stepName: 'build' },
          { id: 'test', stepName: 'test' }
        ],
        succeeded: 'Unknown'
      },
      {
        id: 'task2',
        pipelineTaskName: text('Task 2 name', 'Task 2'),
        steps: [
          { id: 'step 1', stepName: 'step 1' },
          { id: 'step 2', stepName: 'step 2' }
        ],
        succeeded: 'Unknown'
      }
    ]
  };
  const [selectedStepId, setSelectedStepId] = useState();
  const [selectedTaskId, setSelectedTaskId] = useState();

  return (
    <TaskTree
      {...props}
      onSelect={(taskId, stepId) => {
        setSelectedStepId(stepId);
        setSelectedTaskId(taskId);
      }}
      selectedStepId={selectedStepId}
      selectedTaskId={selectedTaskId}
    />
  );
};
