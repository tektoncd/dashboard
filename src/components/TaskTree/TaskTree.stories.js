/*
Copyright 2019 The Tekton Authors
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
import { storiesOf } from '@storybook/react';

import TaskTree from './TaskTree';

const props = {
  taskRuns: [
    {
      id: 'task',
      pipelineTaskName: 'A Task',
      steps: [
        { id: 'build', stepName: 'build' },
        { id: 'test', stepName: 'test' }
      ]
    }
  ]
};

storiesOf('TaskTree', module).add('default', () => {
  class TaskTreeWrapper extends Component {
    state = { selectedTaskId: null };

    onSelect = selectedTaskId => {
      this.setState({ selectedTaskId });
    };

    render() {
      const { selectedTaskId } = this.state;
      return (
        <TaskTree
          {...props}
          onSelect={this.onSelect}
          selectedTaskId={selectedTaskId}
        />
      );
    }
  }

  return <TaskTreeWrapper />;
});
