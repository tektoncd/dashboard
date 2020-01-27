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
import StepStatus from './StepStatus';
import { renderWithIntl } from '../../utils/test';

it('StepStatus renders default content', () => {
  const { queryByText } = renderWithIntl(<StepStatus />);

  expect(queryByText(/Container status:/i)).toBeTruthy();
  expect(queryByText(/No status available/i)).toBeTruthy();
});

it('StepStatus renders the provided content', () => {
  const container = 'fake_container';
  const imageID = 'fake_imageID';
  const name = 'fake_name';
  const terminated = 'fake_terminated';
  const status = { container, imageID, name, terminated };
  const { queryByText } = renderWithIntl(<StepStatus status={status} />);

  expect(queryByText(new RegExp(container, 'i'))).toBeTruthy();
  expect(queryByText(new RegExp(imageID, 'i'))).toBeTruthy();
  expect(queryByText(new RegExp(name, 'i'))).toBeTruthy();
  expect(queryByText(new RegExp(terminated, 'i'))).toBeTruthy();
});
