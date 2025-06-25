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

import { withRouter } from 'storybook-addon-remix-react-router';
import TagsWithOverflow from './TagsWithOverflow';

export default {
  title: 'TagWithOverflow',
  component: TagsWithOverflow,
  decorators: [withRouter()]
};

export const Default = args => <TagsWithOverflow {...args} />;
Default.args = {
  resource: {
    metadata: {
      labels: {
        'tekton.dev/pipeline': 'hello-pipeline',
        'triggers-eventid': 'e9742d5b-00e4-4124-9aa1-da2fd670f2da',
        'tekton.dev/pipeline1': 'hello-pipeline2',
        'triggers.tekton.dev/eventlistener1': 'hello-listener3',
        'triggers.tekton.dev/trigger1': 'Test1',
        'triggers.tekton.dev/1': '1',
        'triggers.tekton.dev/triggers-eventid1':
          'e9742d5b-00e4-4124-9aa1-da2fd670f2da5',
        'tekton.dev/pipeline2': 'hello-pipeline2',
        'triggers.tekton.dev/eventlistener3': 'hello-listener3',
        'triggers.tekton.dev/event3': 'hello-3',
        'triggers.tekton.dev/trigger2': 'Test1',
        'triggers.tekton.dev/triggers-eventid2':
          'e9742d5b-00e4-4124-9aa1-da2fd670f2da5',
        'triggers.tekton.dev/trigger4': 'Test1',
        'triggers.tekton.dev/triggers-eventid3':
          'e9742d5b-00e4-4124-9aa1-da2fd670f2da5'
      }
    },
    kind: 'PipelineRun'
  },
  namespace: 'default'
};
