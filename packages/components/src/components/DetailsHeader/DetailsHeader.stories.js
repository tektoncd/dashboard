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

import React from 'react';

import DetailsHeader from './DetailsHeader';

const taskRun = {
  id: 'task',
  taskName: 'A Task',
  status: {
    conditions: [
      {
        reason: 'Pending',
        status: 'Unknown',
        type: 'Succeeded'
      }
    ]
  }
};

export default {
  component: DetailsHeader,
  title: 'Components/DetailsHeader'
};

export const Running = () => (
  <DetailsHeader status="running" stepName="build" taskRun={taskRun} />
);

export const Completed = () => (
  <DetailsHeader
    reason="Completed"
    status="terminated"
    stepName="build"
    taskRun={taskRun}
  />
);

export const Failed = () => (
  <DetailsHeader
    reason="Error"
    status="terminated"
    stepName="build"
    taskRun={taskRun}
  />
);

export const Pending = () => <DetailsHeader taskRun={taskRun} />;
