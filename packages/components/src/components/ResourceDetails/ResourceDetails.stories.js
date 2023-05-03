/*
Copyright 2020-2023 The Tekton Authors
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

import ResourceDetails from '.';

const resource = {
  apiVersion: 'tekton.dev/v1',
  kind: 'Task',
  metadata: {
    creationTimestamp: '2020-05-19T16:49:30Z',
    labels: {
      'label-key': 'label-value'
    },
    name: 'test',
    namespace: 'tekton-pipelines'
  },
  spec: {
    steps: [
      {
        name: 'test',
        image: 'alpine',
        script: 'echo hello'
      }
    ]
  }
};

export default {
  component: ResourceDetails,
  title: 'ResourceDetails'
};

export const Error = { args: { error: 'A helpful error message' } };

export const Loading = { args: { loading: true } };

export const Base = { args: { resource } };

export const WithAdditionalContent = {
  args: {
    ...Base.args,
    additionalMetadata: (
      <li>
        <span>Custom Field:</span>some additional metadata
      </li>
    ),
    children: <p>some additional content</p>
  }
};
