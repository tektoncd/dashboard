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
import { renderWithIntl, renderWithRouter } from '../../utils/test';
import StepDefinition from './StepDefinition';

it('StepDefinition renders default content', () => {
  const { queryByText } = renderWithIntl(<StepDefinition taskRun={{}} />);
  expect(queryByText(/step definition not available/i)).toBeTruthy();
});

it('StepDefinition renders the provided content', () => {
  const definition = {
    args: ['--someArg'],
    command: ['docker'],
    name: 'test name'
  };
  const { queryByText } = renderWithIntl(
    <StepDefinition definition={definition} taskRun={{}} />
  );

  expect(queryByText(/--someArg/)).toBeTruthy();
  expect(queryByText(/test name/)).toBeTruthy();
  expect(queryByText(/Input Resources/)).toBeNull();
  expect(queryByText(/Output Resources/)).toBeNull();
  expect(queryByText(/Parameters/)).toBeNull();
});

it('StepDefinition renders the provided content with resources and params', () => {
  const inputResourceName = 'testInputResource';
  const outputResourceName = 'testOutputResource';
  const testParamName = 'testParamName';
  const testParam = 'testParam';
  const taskRun = {
    namespace: 'test',
    inputResources: [
      {
        resourceRef: {
          name: inputResourceName
        }
      }
    ],
    outputResources: [
      {
        resourceRef: {
          name: outputResourceName
        }
      }
    ],
    params: [
      {
        name: testParamName,
        value: testParam
      }
    ]
  };
  const definition = {
    args: ['--someArg'],
    command: ['docker'],
    name: 'test name'
  };
  const { queryByText } = renderWithRouter(
    <StepDefinition definition={definition} showIO taskRun={taskRun} />
  );

  expect(queryByText(/--someArg/)).toBeTruthy();
  expect(queryByText(/test name/)).toBeTruthy();
  expect(queryByText(/Input Resources/)).toBeTruthy();
  expect(queryByText(/Output Resources/)).toBeTruthy();
  expect(queryByText(/Parameters/)).toBeTruthy();
  expect(queryByText(testParamName)).toBeTruthy();
  expect(queryByText(testParam)).toBeTruthy();
  expect(queryByText(inputResourceName)).toBeTruthy();
  expect(queryByText(outputResourceName)).toBeTruthy();
});
