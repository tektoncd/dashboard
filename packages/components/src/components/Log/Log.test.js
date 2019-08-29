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
import { waitForElement } from 'react-testing-library';
import Log from './Log';
import { renderWithIntl } from '../../utils/test';

it('Log renders default content', () => {
  const { getByText } = renderWithIntl(<Log fetchLogs={() => undefined} />);
  waitForElement(() => getByText(/No log available/i));
});

it('Log renders the provided content', () => {
  const { getByText } = renderWithIntl(
    <Log
      stepStatus={{ terminated: { reason: 'Completed' } }}
      fetchLogs={() => 'testing'}
    />
  );
  waitForElement(() => getByText(/testing/i));
});

it('Log renders trailer', () => {
  const { getByText } = renderWithIntl(
    <Log stepStatus={{ terminated: { reason: 'Completed' } }} />
  );
  waitForElement(() => getByText(/step completed/i));
});

it('Log renders loading state', () => {
  const { queryByText } = renderWithIntl(
    <Log
      stepStatus={{ terminated: { reason: 'Completed' } }}
      fetchLogs={() => {
        return 'testing';
      }}
    />
  );
  expect(queryByText(/testing/i)).toBeFalsy();
});
