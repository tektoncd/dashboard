/*
Copyright 2019-2021 The Tekton Authors
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
import { render } from '../../utils/test';
import StepDefinition from './StepDefinition';

it('StepDefinition renders default content', () => {
  const { queryByText } = render(<StepDefinition taskRun={{}} />);
  expect(queryByText(/Step definition not available/i)).toBeTruthy();
});

it('StepDefinition renders the provided content', () => {
  const definition = {
    args: ['--someArg'],
    command: ['docker'],
    name: 'test name'
  };
  const { queryByText } = render(
    <StepDefinition definition={definition} taskRun={{}} />
  );

  expect(queryByText(/--someArg/)).toBeTruthy();
  expect(queryByText(/test name/)).toBeTruthy();
  expect(queryByText(/Input resources/)).toBeNull();
  expect(queryByText(/Output resources/)).toBeNull();
});
