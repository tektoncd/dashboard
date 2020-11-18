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

import RunHeader from './RunHeader';

const now = new Date();

export default {
  args: {
    name: 'simple-pipeline',
    runName: 'simple-pipeline-run-1'
  },
  component: RunHeader,
  title: 'Components/RunHeader'
};

export const Base = args => <RunHeader {...args} />;

export const Running = args => (
  <RunHeader
    lastTransitionTime={now}
    reason="Running"
    status="Unknown"
    {...args}
  />
);
Running.args = {
  message: 'Not all Tasks have completed executing'
};

export const Complete = args => (
  <RunHeader
    lastTransitionTime={now}
    status="True"
    reason="Completed"
    {...args}
  />
);
Complete.args = {
  message: 'All Tasks have completed executing'
};

export const Failed = args => (
  <RunHeader
    lastTransitionTime={now}
    status="False"
    reason="Failed"
    {...args}
  />
);
Failed.args = {
  message: 'TaskRun demo-pipeline-run-1-build-skaffold-web-4dzrn has failed'
};

export const Loading = () => <RunHeader loading />;

export const WithTriggerInfo = args => (
  <RunHeader
    lastTransitionTime={now}
    status="True"
    reason="Completed"
    triggerHeader={
      <span>
        Triggered by <a href="#">Update README.md</a>
      </span>
    }
    {...args}
  />
);
WithTriggerInfo.args = {
  message: 'All Tasks have completed executing'
};
