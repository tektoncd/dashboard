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

import ViewYAML from './ViewYAML';

export default {
  args: {
    dark: true,
    resource: {
      apiVersion: 'tekton.dev/v1alpha1',
      kind: 'Resource',
      metadata: {
        creationTimestamp: '1995-11-08T00:00:00Z',
        generation: 1,
        labels: {
          foo: 'bar'
        },
        name: 'resource-example',
        namespace: 'tekton-pipelines',
        resourceVersion: '123456',
        uid: '1234567890987654321'
      },
      spec: {
        params: [{ name: 'parameter1', value: 'valueParameter1' }]
      }
    }
  },
  component: ViewYAML,
  title: 'Components/ViewYAML'
};

export const Base = args => <ViewYAML {...args} />;
