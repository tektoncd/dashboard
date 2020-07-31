/*
Copyright 2020 The Tekton Authors
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
  apiVersion: 'tekton.dev/v1alpha1',
  kind: 'Condition',
  metadata: {
    creationTimestamp: '2020-05-19T16:49:30Z',
    labels: {
      'label-key': 'label-value'
    },
    name: 'file-exists',
    namespace: 'tekton-pipelines'
  },
  spec: {
    check: {
      image: 'alpine',
      script: 'test -f $(resources.workspace.path)/$(params.path)'
    },
    description: 'Checks if a file exists at the specified path',
    params: [{ name: 'path' }],
    resources: [{ name: 'workspace', type: 'git' }]
  }
};

export default {
  component: ResourceDetails,
  title: 'Components/ResourceDetails'
};

export const Error = () => <ResourceDetails error="A helpful error message" />;

export const Loading = () => <ResourceDetails loading />;

export const Base = () => <ResourceDetails resource={resource} />;

export const WithAdditionalContent = () => (
  <ResourceDetails
    resource={resource}
    additionalMetadata={
      <p>
        <span>Custom Field:</span>some additional metadata
      </p>
    }
  >
    <p>some additional content</p>
  </ResourceDetails>
);
