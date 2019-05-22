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
import Annotations from './Annotations';

it('Annotations shows blank fields', () => {
  const props = {
    disabled: true,
    handleChange: function() {},
    invalidFields: [],
    annotations: [`tekton.dev/git-0`, '', `tekton.dev/git-1`, '', `tekton.dev/git-2`, ''],
    handleAdd: function() {},
    handleRemove: function() {}
  };
  const { getAllByDisplayValue, getByText } = render(<Annotations {...props} />);

  expect(getByText(/Server URL/i)).toBeTruthy();
  expect(getAllByDisplayValue('').length === 3).toBeTruthy();
  expect(getAllByDisplayValue(/tekton.dev\/git-/i).length === 3).toBeTruthy();
});

it('Annotations shows disabled fields', () => {
  const props = {
    disabled: true,
    handleChange: function() {},
    invalidFields: [],
    annotations: [`tekton.dev/git-0`, '', `tekton.dev/git-1`, '',],
    handleAdd: function() {},
    handleRemove: function() {}
  };
  const { getByDisplayValue } = render(<Annotations {...props} />);

  for (let i = 0; i < props.annotations.length; i++) {
    const currentAnnotation = document.getElementById('annotation' + i);
    expect(currentAnnotation.disabled).toBeTruthy();
  }
});

it('Annotations incorrect fields', () => {
  const props = {
    disabled: false,
    handleChange: function() {},
    invalidFields: ['annotation1', 'annotation5'],
    annotations: [`tekton.dev/git-0`, '', `tekton.dev/git-1`, 'something', `tekton.dev/git-2`, ''],
    handleAdd: function() {},
    handleRemove: function() {}
  };
  const {} = render(<Annotations {...props} />);

  const annotation1Input = document.getElementById('annotation1');
  const annotation2Input = document.getElementById('annotation2');
  const annotation3Input = document.getElementById('annotation3');
  const annotation5Input = document.getElementById('annotation5');

  expect(annotation1Input.getAttribute('data-invalid')).toBeTruthy();
  expect(annotation2Input.getAttribute('data-invalid')).toBeFalsy();
  expect(annotation3Input.getAttribute('data-invalid')).toBeFalsy();
  expect(annotation5Input.getAttribute('data-invalid')).toBeTruthy();
});
