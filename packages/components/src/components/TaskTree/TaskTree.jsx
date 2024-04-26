/*
Copyright 2019-2024 The Tekton Authors
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

import { getStatus, labels as labelConstants } from '@tektoncd/dashboard-utils';
import Task from '../Task';

const defaults = {
  taskRuns: []
};

const TaskTree = ({
  isSelectedTaskMatrix,
  onRetryChange,
  onSelect,
  selectedRetry,
  selectedStepId,
  selectedTaskId,
  selectedTaskRunName,
  taskRuns = defaults.taskRuns
}) => {
  if (!taskRuns) {
    return <div />;
  }

  const erroredTask = taskRuns
    .filter(Boolean)
    .find(taskRun => getStatus(taskRun).status === 'False');

  let hasExpandedTask = false;

  return (
    <ol className="tkn--task-tree">
      {taskRuns.map((taskRun, index) => {
        if (!taskRun) {
          return null;
        }
        const { uid, labels, name } = taskRun.metadata;
        const {
          [labelConstants.DASHBOARD_DISPLAY_NAME]: displayName,
          [labelConstants.PIPELINE_TASK]: pipelineTaskName
        } = labels;

        let taskRunToUse = taskRun;
        if (
          selectedRetry &&
          selectedTaskId === pipelineTaskName &&
          (selectedTaskRunName ? name === selectedTaskRunName : true)
        ) {
          taskRunToUse = {
            ...taskRunToUse,
            status: taskRunToUse.status?.retriesStatus?.[selectedRetry]
          };
        }

        const { reason, status } = getStatus(taskRunToUse);
        const { steps } = taskRunToUse.status || {};
        const expanded =
          // should only have 1 expanded task at a time (may change in a future design)
          // we expand the first task matching the rules below
          !hasExpandedTask &&
          // no explicitly selected task and current task failed, expand this one
          ((!selectedTaskId && erroredTask?.metadata.uid === uid) ||
            // or this task is the selected one
            (selectedTaskId === pipelineTaskName &&
              // if it's a matrixed TaskRun only expand if it matches the specified taskRunName
              // if it's not a matrixed TaskRun, or no taskRunName specified, this is the first match so expand it
              (selectedTaskRunName ? name === selectedTaskRunName : true)) ||
            // otherwise there's no error and no explicit selection, expand the first task by default
            (!erroredTask && !selectedTaskId && index === 0));

        if (!hasExpandedTask && expanded) {
          hasExpandedTask = true;
        }

        const selectDefaultStep =
          !selectedTaskId || (isSelectedTaskMatrix && !selectedTaskRunName);
        return (
          <Task
            displayName={displayName || pipelineTaskName || name}
            expanded={expanded}
            id={pipelineTaskName}
            key={uid}
            onRetryChange={onRetryChange}
            onSelect={onSelect}
            reason={reason}
            selectDefaultStep={selectDefaultStep}
            selectedRetry={expanded && selectedRetry}
            selectedStepId={selectedStepId}
            steps={steps}
            succeeded={status}
            taskRun={taskRun}
          />
        );
      })}
    </ol>
  );
};

export default TaskTree;
