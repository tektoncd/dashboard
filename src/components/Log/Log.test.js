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
import Log from './Log';

it('Log renders default content', () => {
  const { queryByText } = render(<Log />);
  expect(queryByText(/No log available/i)).toBeTruthy();
});

it('Log renders the provided content', () => {
  const { queryByText } = render(<Log log="testing" />);
  expect(queryByText(/testing/i)).toBeTruthy();
});

it('Log renders trailer', () => {
  const { queryByText } = render(<Log status="Completed" />);
  expect(queryByText(/step completed/i)).toBeTruthy();
});

it('Log renders loading state', () => {
  const { queryByText } = render(<Log loading log="testing" />);
  expect(queryByText(/testing/i)).toBeFalsy();
});
