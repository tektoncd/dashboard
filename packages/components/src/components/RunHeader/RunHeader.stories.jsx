/*
Copyright 2019-2025 The Tekton Authors
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

const pipelineRun = {
  metadata: {
    labels: {
      'tekton.dev/pipeline': 'ci-pipeline',
      gitRepo: 'tektoncd/dashboard',
      gitBranch: 'main'
    }
  }
};

export default {
  args: {
    name: 'simple-pipeline',
    resource: pipelineRun,
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

export const WithDuration = {
  args: {
    ...Complete.args,
    duration: 30_000 // 30s
  }
};

export const WithTriggerInfo = {
  args: {
    ...Complete.args,
    triggerHeader: (
      <span>
        Triggered by <a href="#">Update README.md</a>
      </span>
    )
  }
};

export const WithLabelOverflow = {
  args: {
    ...WithDuration.args,
    resource: {
      metadata: {
        labels: {
          'app.kubernetes.io/managed-by': 'tekton-pipelines',
          'tekton.dev/memberOf': 'tasks',
          'tekton.dev/pipeline': 'deploy-configmap',
          'tekton.dev/pipelineRun': 'deploy-configmap-prow-config-8zkk2',
          'tekton.dev/pipelineRunUID': '4ed13cb0-87c6-4da4-8500-cd4d69c46416',
          'tekton.dev/pipelineTask': 'deploy',
          'tekton.dev/task': 'deploy-configmap',
          'triggers.tekton.dev/eventlistener': 'tekton-cd',
          'triggers.tekton.dev/trigger': 'configmaps',
          'triggers.tekton.dev/triggers-eventid':
            'c2cd171d-2e51-47ca-b34e-42eda846a1d5'
        }
      }
    }
  }
};
