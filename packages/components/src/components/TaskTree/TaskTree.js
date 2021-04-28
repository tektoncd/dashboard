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
import { getStatus, labels as labelConstants } from '@tektoncd/dashboard-utils';
import Task from '../Task';

const TaskTree = ({ onSelect, selectedStepId, selectedTaskId, taskRuns }) => {
  if (!taskRuns) {
    return <div />;
  }

  const erroredTask = taskRuns
    .filter(Boolean)
    .find(taskRun => getStatus(taskRun).status === 'False');

  return (
    <ol className="tkn--task-tree">
      {taskRuns.map((taskRun, index) => {
        if (!taskRun) {
          return null;
        }
        const { uid, labels, name } = taskRun.metadata;
        const {
          [labelConstants.PIPELINE_TASK]: pipelineTaskName,
          [labelConstants.DASHBOARD_RETRY_NAME]: retryName
        } = labels;
        const { reason, status } = getStatus(taskRun);
        const { steps } = taskRun.status;
        const expanded =
          (!selectedTaskId && erroredTask?.metadata.uid === uid) ||
          selectedTaskId === uid ||
          (!erroredTask && !selectedTaskId && index === 0);
        const selectDefaultStep = !selectedTaskId;
        return (
          <Task
            displayName={retryName || pipelineTaskName || name}
            expanded={expanded}
            id={uid}
            key={uid}
            onSelect={onSelect}
            reason={reason}
            selectDefaultStep={selectDefaultStep}
            selectedStepId={selectedStepId}
            steps={steps}
            succeeded={status}
          />
        );
      })}
    </ol>
  );
};

TaskTree.defaultProps = {
  taskRuns: []
};

export default TaskTree;
