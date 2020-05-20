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

import React, { Component } from 'react';
import { sortStepsByTimestamp } from '@tektoncd/dashboard-utils';
import Task from '../Task';

import './TaskTree.scss';

class TaskTree extends Component {
  handleSelect = (taskId, stepId) => {
    this.props.onSelect(taskId, stepId);
  };

  render() {
    const { selectedTaskId, taskRuns } = this.props;

    if (!taskRuns) {
      return <div />;
    }

    return (
      <ol className="tkn--task-tree">
        {taskRuns.map((taskRun, index) => {
          if (!taskRun) {
            return null;
          }
          const { id, reason, steps, succeeded, pipelineTaskName } = taskRun;
          const erroredTask = taskRuns.find(task => task.succeeded === 'False');
          const expanded =
            (!selectedTaskId && erroredTask && erroredTask.id === id) ||
            selectedTaskId === id ||
            (!erroredTask && !selectedTaskId && index === 0);
          return (
            <Task
              id={id}
              key={id}
              expanded={expanded}
              onSelect={this.handleSelect}
              reason={reason}
              steps={sortStepsByTimestamp(steps)}
              succeeded={succeeded}
              pipelineTaskName={pipelineTaskName}
            />
          );
        })}
      </ol>
    );
  }
}

TaskTree.defaultProps = {
  taskRuns: []
};

export default TaskTree;
