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
import { renderWithRouter } from '../../utils/test';

import RunHeader from './RunHeader';

const props = {
  name: 'simple-pipeline',
  runName: 'simple-pipeline-run-1'
};

it('RunHeader renders the provided content', () => {
  const { queryByText } = renderWithRouter(<RunHeader {...props} />);
  expect(queryByText(/simple-pipeline/i)).toBeTruthy();
});

it('RunHeader renders the running state', () => {
  const { queryByText } = renderWithRouter(
    <RunHeader {...props} status="Unknown" reason="Running" />
  );
  expect(queryByText(/running/i)).toBeTruthy();
});

it('RunHeader renders the completed state', () => {
  const { queryByText } = renderWithRouter(
    <RunHeader {...props} status="True" reason="Completed" />
  );
  expect(queryByText(/completed/i)).toBeTruthy();
});

it('RunHeader renders the failed state', () => {
  const { queryByText } = renderWithRouter(
    <RunHeader {...props} status="False" reason="Failed" />
  );
  expect(queryByText(/failed/i)).toBeTruthy();
});

it('RunHeader renders the loading state', () => {
  const { queryByTestId } = renderWithRouter(<RunHeader loading />);
  expect(queryByTestId('loading')).toBeTruthy();
});
