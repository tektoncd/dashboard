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
import { fireEvent, render } from 'react-testing-library';
import UniversalFields from './UniversalFields';

it('UniversalFields renders with blank inputs', () => {
  const props = {
    name: '',
    handleChange: function() {},
    accessTo: '',
    selectedNamespace: '',
    namespaces: [
      'default',
      'docker',
      'kube-public',
      'kube-system',
      'tekton-pipelines'
    ],
    invalidFields: []
  };
  const { getByLabelText, getAllByDisplayValue } = render(<UniversalFields {...props} />);
  expect(getByLabelText(/Name/i)).toBeTruthy();
  expect(getByLabelText(/Namespace/i)).toBeTruthy();
  expect(getByLabelText(/Access To/i)).toBeTruthy();
  expect(getAllByDisplayValue('').length === 3).toBeTruthy();
});

it('UniversalFields shows disabled fields', () => {
  const props = {
    name: 'dummyName',
    handleChange: function() {},
    accessTo: '',
    selectedNamespace: '',
    namespaces: [
      'default',
      'docker',
      'kube-public',
      'kube-system',
      'tekton-pipelines'
    ],
    invalidFields: []
  };
  const { getByDisplayValue } = render(<UniversalFields {...props} />);

  const namespaceInput = document.getElementById('namespace');
  const accessToInput = document.getElementById('accessTo');

  expect(getByDisplayValue(/dummyName/i)).toBeTruthy();
  expect(namespaceInput.disabled).toBeFalsy();
  expect(accessToInput.disabled).toBeTruthy();
});

it('UniversalFields incorrect fields', () => {
  const props = {
    name: '',
    handleChange: function() {},
    accessTo: '',
    selectedNamespace: 'default',
    namespaces: [
      'default',
      'docker',
      'kube-public',
      'kube-system',
      'tekton-pipelines'
    ],
    invalidFields: ['name', 'accessTo']
  };
  const {} = render(<UniversalFields {...props} />);

  const nameInput = document.getElementById('name');
  const namespaceInput = document.getElementById('namespace');
  const accessToInput = document.getElementById('accessTo');

  expect(nameInput.getAttribute('data-invalid')).toBeTruthy();
  expect(accessToInput.getAttribute('data-invalid')).toBeTruthy();
  expect(namespaceInput.getAttribute('data-invalid')).toBeFalsy();
});
