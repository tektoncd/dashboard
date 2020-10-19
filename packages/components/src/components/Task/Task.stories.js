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

export default {
  component: Task,
  title: 'Components/Task'
};

export const Succeeded = () => <Task {...props} succeeded="True" />;

export const Failed = () => <Task {...props} succeeded="False" />;

export const Unknown = () => <Task {...props} succeeded="Unknown" />;

export const Pending = () => (
  <Task {...props} succeeded="Unknown" reason="Pending" />
);

export const Running = () => (
  <Task {...props} succeeded="Unknown" reason="Running" />
);

export const Expanded = () => {
  const [selectedStepId, setSelectedStepId] = useState();
  return (
    <Task
      {...props}
      onSelect={(_, stepId) => setSelectedStepId(stepId)}
      selectedStepId={selectedStepId}
      expanded
      steps={steps}
      succeeded="Unknown"
    />
  );
};
