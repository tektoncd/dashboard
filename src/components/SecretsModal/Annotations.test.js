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
import { render } from 'react-testing-library';
import Annotations from './Annotations';

it('Annotations shows blank fields', () => {
  const props = {
    handleChange() {},
    invalidFields: [],
    annotations: [
      { label: `tekton.dev/git-0`, value: '', id: 'aaaa' },
      { label: `tekton.dev/git-1`, value: '', id: 'bbbb' },
      { label: `tekton.dev/git-2`, value: '', id: 'cccc' }
    ],
    handleAdd() {},
    handleRemove() {}
  };
  const { getAllByDisplayValue, getByText } = render(
    <Annotations {...props} />
  );

  expect(getByText(/Server URL/i)).toBeTruthy();
  expect(getAllByDisplayValue('').length).toEqual(3);
  expect(getAllByDisplayValue(/tekton.dev\/git-/i).length).toEqual(3);
});

it('Annotations incorrect fields', () => {
  const props = {
    handleChange() {},
    invalidFields: [
      'annotation-label1',
      'annotation-label2',
      'annotation-value2'
    ],
    annotations: [
      { label: `tekton.dev/git-0`, value: 'https://domain.com', id: 'aaaa' },
      { label: `tekton.dev/git-1`, value: '', id: 'bbbb' },
      { label: `tekton.dev/git-2`, value: 'https://domain.com', id: 'cccc' },
      { label: `tekton.dev/git-3`, value: 'https://domain.com', id: 'dddd' }
    ],
    handleAdd() {},
    handleRemove() {}
  };
  const { getByLabelText } = render(<Annotations {...props} />);

  const annotationLabel0 = getByLabelText(/Annotation Label#0/i);
  const annotationLabel1 = getByLabelText(/Annotation Label#1/i);
  const annotationLabel2 = getByLabelText(/Annotation Label#2/i);
  const annotationLabel3 = getByLabelText(/Annotation Label#3/i);
  const annotationValue0 = getByLabelText(/Annotation Value#0/i);
  const annotationValue1 = getByLabelText(/Annotation Value#1/i);
  const annotationValue2 = getByLabelText(/Annotation Value#2/i);
  const annotationValue3 = getByLabelText(/Annotation Value#3/i);

  expect(annotationLabel0.getAttribute('data-invalid')).toBeFalsy();
  expect(annotationLabel1.getAttribute('data-invalid')).toBeTruthy();
  expect(annotationLabel2.getAttribute('data-invalid')).toBeTruthy();
  expect(annotationLabel3.getAttribute('data-invalid')).toBeFalsy();
  expect(annotationValue0.getAttribute('data-invalid')).toBeFalsy();
  expect(annotationValue1.getAttribute('data-invalid')).toBeFalsy();
  expect(annotationValue2.getAttribute('data-invalid')).toBeTruthy();
  expect(annotationValue3.getAttribute('data-invalid')).toBeFalsy();
});
