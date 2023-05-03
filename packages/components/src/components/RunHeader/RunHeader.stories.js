/*
Copyright 2019-2023 The Tekton Authors
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

import RunHeader from './RunHeader';

const now = new Date();

export default {
  args: {
    name: 'simple-pipeline',
    runName: 'simple-pipeline-run-1'
  },
  component: RunHeader,
  title: 'RunHeader'
};

export const Base = {};

export const Running = {
  args: {
    lastTransitionTime: now,
    message: 'Not all Tasks have completed executing',
    reason: 'Running',
    status: 'Unknown'
  }
};

export const Complete = {
  args: {
    lastTransitionTime: now,
    message: 'All Tasks have completed executing',
    reason: 'Completed',
    status: 'True'
  }
};

export const Failed = {
  args: {
    lastTransitionTime: now,
    message: 'TaskRun demo-pipeline-run-1-build-skaffold-web-4dzrn has failed',
    reason: 'Failed',
    status: 'False'
  }
};

export const Loading = { args: { loading: true } };

export const WithTriggerInfo = {
  args: {
    lastTransitionTime: now,
    message: 'All Tasks have completed executing',
    reason: 'Completed',
    status: 'True',
    triggerHeader: (
      <span>
        Triggered by <a href="#">Update README.md</a>
      </span>
    )
  }
};
