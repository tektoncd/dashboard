/*
Copyright 2019-2020 The Tekton Authors
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
import { waitForElement } from '@testing-library/react';
import Log from './Log';
import { renderWithIntl } from '../../utils/test';

describe('Log', () => {
  it('renders default content', async () => {
    const { getByText } = renderWithIntl(<Log fetchLogs={() => undefined} />);
    await waitForElement(() => getByText(/No log available/i));
  });

  it('renders the provided content', async () => {
    const { getByText } = renderWithIntl(
      <Log
        stepStatus={{ terminated: { reason: 'Completed' } }}
        fetchLogs={() => 'testing'}
      />
    );
    await waitForElement(() => getByText(/testing/i));
  });

  it('renders trailer', async () => {
    const { getByText } = renderWithIntl(
      <Log
        stepStatus={{ terminated: { reason: 'Completed' } }}
        fetchLogs={() => 'testing'}
      />
    );
    await waitForElement(() => getByText(/step completed/i));
  });

  it('renders error trailer', async () => {
    const { getByText } = renderWithIntl(
      <Log
        stepStatus={{ terminated: { reason: 'Error' } }}
        fetchLogs={() => 'testing'}
      />
    );
    await waitForElement(() => getByText(/step failed/i));
  });

  it('renders virtualized list', async () => {
    const long = Array.from(
      { length: 60000 },
      (v, i) => `Line ${i + 1}\n`
    ).join('');
    const { getByText } = renderWithIntl(
      <Log
        stepStatus={{ terminated: { reason: 'Completed' } }}
        fetchLogs={() => long}
      />
    );

    await waitForElement(() => getByText('Line 1'));
  });

  it('renders the provided content when streaming logs', async () => {
    const { getByText } = renderWithIntl(
      <Log
        stepStatus={{ terminated: { reason: 'Completed' } }}
        fetchLogs={() =>
          Promise.resolve(
            new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode('testing'));
              }
            })
          )
        }
      />
    );
    await waitForElement(() => getByText(/testing/i));
  });

  it('renders trailer when streaming logs', async () => {
    const { getByText } = renderWithIntl(
      <Log
        stepStatus={{ terminated: { reason: 'Completed' } }}
        fetchLogs={() =>
          Promise.resolve(
            new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode('testing'));
              }
            })
          )
        }
      />
    );
    await waitForElement(() => getByText(/step completed/i));
  });

  it('renders error trailer when streaming logs', async () => {
    const { getByText } = renderWithIntl(
      <Log
        stepStatus={{ terminated: { reason: 'Error' } }}
        fetchLogs={() =>
          Promise.resolve(
            new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode('testing'));
              }
            })
          )
        }
      />
    );
    await waitForElement(() => getByText(/step failed/i));
  });
});
