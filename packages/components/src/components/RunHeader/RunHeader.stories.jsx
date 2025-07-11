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
/* eslint-disable formatjs/no-literal-string-in-jsx */

import { withRouter } from 'storybook-addon-remix-react-router';
import RunHeader from './RunHeader';

const now = new Date();

export default {
  args: {
    name: 'simple-pipeline',
    runName: 'simple-pipeline-run-1'
  },
  component: RunHeader,
  title: 'RunHeader',
  decorators: [withRouter()]
};

export const Default = {};

export const Running = {
  args: {
    lastTransitionTime: now,
    message: 'Not all Tasks have completed executing',
    reason: 'Running',
    status: 'Unknown',
    labels: {
      'tekton.dev/pipeline': 'hello-pipeline',
      'triggers-eventid': 'e9742d5b-00e4-4124-9aa1-da2fd670f2da'
    },
    namespace: 'default'
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
