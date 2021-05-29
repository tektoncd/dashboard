/*
Copyright 2019 The Tekton Authors
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
import { render } from '@testing-library/react';
import ViewYAML from './ViewYAML';

const resource = {
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
};

it('YAML renders correctly', () => {
  const props = {
    resource
  };
  const { getByText } = render(<ViewYAML {...props} />);

  expect(getByText(/apiVersion: tekton.dev\/v1alpha1/i)).toBeTruthy();
  expect(getByText(/kind: Resource/i)).toBeTruthy();
  expect(getByText(/metadata:/i)).toBeTruthy();
  expect(getByText(/creationTimestamp: '1995-11-08T00:00:00Z'/i)).toBeTruthy();
  expect(getByText(/generation:/i)).toBeTruthy();
  expect(getByText(/labels:/i)).toBeTruthy();
  expect(getByText(/foo: bar/i)).toBeTruthy();
  expect(getByText(/name: resource-example/i)).toBeTruthy();
  expect(getByText(/namespace: tekton-pipelines/i)).toBeTruthy();
  expect(getByText(/resourceVersion: '123456'/i)).toBeTruthy();
  expect(getByText(/uid: '1234567890987654321'/i)).toBeTruthy();
  expect(getByText(/spec:/i)).toBeTruthy();
  expect(getByText(/params:/i)).toBeTruthy();
  expect(getByText(/- name: parameter1/i)).toBeTruthy();
  expect(getByText(/value: valueParameter1/i)).toBeTruthy();
});

it('render syntax highlight', () => {
  const props = {
    resource,
    enableSyntaxHighlighting: true
  };
  const { container } = render(<ViewYAML {...props} />);
  expect(container.firstChild.className).toMatch(/prism/);
});
