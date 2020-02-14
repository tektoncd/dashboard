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

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Task from './Task';

const props = {
  pipelineTaskName: 'A Task',
  onSelect: action('selected')
};

const steps = [
  { id: 'build', stepName: 'build', reason: 'Completed' },
  { id: 'test', stepName: 'test', reason: 'Completed' }
];

storiesOf('Components/Task', module)
  .add('succeeded', () => <Task {...props} succeeded="True" />)
  .add('failed', () => <Task {...props} succeeded="False" />)
  .add('unknown', () => <Task {...props} succeeded="Unknown" />)
  .add('pending', () => (
    <Task {...props} succeeded="Unknown" reason="Pending" />
  ))
  .add('running', () => (
    <Task {...props} succeeded="Unknown" reason="Running" />
  ))
  .add('expanded', () => <Task {...props} expanded steps={steps} />);
