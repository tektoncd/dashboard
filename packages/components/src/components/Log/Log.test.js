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
import { fireEvent, waitFor } from '@testing-library/react';
import Log from './Log';
import { render } from '../../utils/test';

describe('Log', () => {
  it('renders default content', async () => {
    const { getByText } = render(<Log fetchLogs={() => undefined} />);
    await waitFor(() => getByText(/No log available/i));
  });

  it('renders the provided content', async () => {
    const { getByText } = render(
      <Log
        stepStatus={{ terminated: { reason: 'Completed' } }}
        fetchLogs={() => 'testing'}
      />
    );
    await waitFor(() => getByText(/testing/i));
  });

  it('renders trailer', async () => {
    const { getByText } = render(
      <Log
        stepStatus={{ terminated: { reason: 'Completed' } }}
        fetchLogs={() => 'testing'}
      />
    );
    await waitFor(() => getByText(/step completed/i));
  });

  it('renders error trailer', async () => {
    const { getByText } = render(
      <Log
        stepStatus={{ terminated: { reason: 'Error' } }}
        fetchLogs={() => 'testing'}
      />
    );
    await waitFor(() => getByText(/step failed/i));
  });

  it('renders pending trailer when step complete and forcePolling is true', async () => {
    const { getByText, queryByText } = render(
      <Log
        fetchLogs={() => 'testing'}
        forcePolling
        stepStatus={{ terminated: { reason: 'Error' } }}
      />
    );
    await waitFor(() => getByText(/final logs pending/i));
    expect(queryByText(/step failed/)).toBeFalsy();
  });

  it('renders virtualized list', async () => {
    const long = Array.from(
      { length: 60000 },
      (v, i) => `Line ${i + 1}\n`
    ).join('');
    const { getByText } = render(
      <Log
        stepStatus={{ terminated: { reason: 'Completed' } }}
        fetchLogs={() => long}
      />
    );

    await waitFor(() => getByText('Line 1'));
  });

  it('auto-scrolls down, for a running step, when new logs are added and the Log component bottom is below the viewport', async () => {
    const medium = Array.from(
      { length: 199 },
      (_v, i) => `Line ${i + 2}\n`
    ).join('');
    jest
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({ bottom: 2500 })
      .mockReturnValueOnce({ bottom: 0 });
    const spiedFn = jest.spyOn(Element.prototype, 'scrollTop', 'set'); // the scrollTop value is changed in scrollToBottomLog

    const { rerender } = render(
      <Log
        stepStatus={{ running: true }}
        enableLogAutoScroll
        pollingInterval={100}
        fetchLogs={() => 'Line 1'}
      />
    );
    rerender(
      <Log
        stepStatus={{ running: true }}
        enableLogAutoScroll
        pollingInterval={100}
        fetchLogs={() => `Line1\n${medium}`}
      />
    );
    await waitFor(() => expect(spiedFn).toHaveBeenCalled());
  });

  it('auto-scrolls down, for a running step, when new logs are added and the Log component is scrollable', async () => {
    const long = Array.from(
      { length: 19999 },
      (_v, i) => `Line ${i + 1}\n`
    ).join('');
    jest
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({ bottom: 0 });
    jest
      .spyOn(Element.prototype, 'scrollTop', 'get')
      .mockReturnValue(-1) // to ensure el.scrollHeight - el.clientHeight > el.scrollTop i.e. 0 - 0 > -1
      .mockReturnValueOnce(0);
    const spiedFn = jest.spyOn(Element.prototype, 'scrollTop', 'set'); // the scrollTop value is changed in scrollToBottomLog

    const { rerender } = render(
      <Log
        stepStatus={{ running: true }}
        enableLogAutoScroll
        pollingInterval={100}
        fetchLogs={() => long}
      />
    );
    rerender(
      <Log
        stepStatus={{ running: true }}
        enableLogAutoScroll
        pollingInterval={100}
        fetchLogs={() => `${long}\nLine 20000`}
      />
    );
    await waitFor(() => expect(spiedFn).toHaveBeenCalled());
  });

  it('does not auto-scroll down when the step was never running after the component mounting', async () => {
    const long = Array.from(
      { length: 19999 },
      (_v, i) => `Line ${i + 1}\n`
    ).join('');
    jest
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({ bottom: 0 });
    jest
      .spyOn(Element.prototype, 'scrollTop', 'get')
      .mockReturnValue(-1) // to ensure el.scrollHeight - el.clientHeight > el.scrollTop i.e. 0 - 0 > -1
      .mockReturnValueOnce(0);
    const spiedFn = jest.spyOn(Element.prototype, 'scrollTop', 'set'); // the scrollTop value is changed in scrollToBottomLog

    const { rerender } = render(
      <Log
        stepStatus={{ terminated: { reason: 'Completed' } }}
        enableLogAutoScroll
        pollingInterval={100}
        fetchLogs={() => long}
      />
    );
    rerender(
      <Log
        stepStatus={{ terminated: { reason: 'Completed' } }}
        enableLogAutoScroll
        pollingInterval={100}
        fetchLogs={() => `${long}\nLine 20000`}
      />
    );
    await waitFor(() => expect(spiedFn).not.toHaveBeenCalled());
  });

  it('displays the scroll to top button when the virtualized list scroll is all the way down', async () => {
    const long = Array.from(
      { length: 20000 },
      (_v, i) => `Line ${i + 1}\n`
    ).join('');
    jest
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({ bottom: 0, top: 0, right: 0 });
    jest.spyOn(Element.prototype, 'scrollTop', 'get').mockReturnValue(1);
    const spiedFn = jest.spyOn(Element.prototype, 'scrollTop', 'set'); // the scrollTop value is changed in scrollToBottomLog

    const { container } = render(
      <Log
        stepStatus={{ terminated: { reason: 'Completed' } }}
        enableLogScrollButtons
        fetchLogs={() => long}
      />
    );
    await waitFor(() => {
      expect(container.querySelector('#log-scroll-to-top-btn')).not.toBeNull();
    });
    expect(container.querySelector('#log-scroll-to-bottom-btn')).toBeNull();
    fireEvent.click(container.querySelector('#log-scroll-to-top-btn'));

    await waitFor(() => expect(spiedFn).toHaveBeenCalled());
  });

  it('displays both scroll buttons when the virtualized list scrolled is neither all the way up nor down', async () => {
    const long = Array.from(
      { length: 20000 },
      (_v, i) => `Line ${i + 1}\n`
    ).join('');
    jest
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({ bottom: 0, top: 0, right: 0 });
    jest.spyOn(Element.prototype, 'scrollTop', 'get').mockReturnValue(1);
    jest.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(2);
    const spiedFn = jest.spyOn(Element.prototype, 'scrollTop', 'set'); // the scrollTop value is changed in scrollToBottomLog

    const { container } = render(
      <Log
        stepStatus={{ terminated: { reason: 'Completed' } }}
        enableLogScrollButtons
        fetchLogs={() => long}
      />
    );
    await waitFor(() => {
      expect(container.querySelector('#log-scroll-to-top-btn')).not.toBeNull();
    });
    expect(container.querySelector('#log-scroll-to-bottom-btn')).not.toBeNull();
    fireEvent.click(container.querySelector('#log-scroll-to-bottom-btn'));

    await waitFor(() => expect(spiedFn).toHaveBeenCalled());
  });

  it('renders the provided content when streaming logs', async () => {
    const { getByText } = render(
      <Log
        stepStatus={{ terminated: { reason: 'Completed' } }}
        fetchLogs={() =>
          Promise.resolve({
            getReader() {
              return {
                read() {
                  return Promise.resolve({
                    done: true,
                    value: new TextEncoder().encode('testing')
                  });
                }
              };
            }
          })
        }
      />
    );
    await waitFor(() => getByText(/testing/i));
  });

  it('renders trailer when streaming logs', async () => {
    const { getByText } = render(
      <Log
        stepStatus={{ terminated: { reason: 'Completed' } }}
        fetchLogs={() =>
          Promise.resolve({
            getReader() {
              return {
                read() {
                  return Promise.resolve({
                    done: true,
                    value: new TextEncoder().encode('testing')
                  });
                }
              };
            }
          })
        }
      />
    );
    await waitFor(() => getByText(/step completed/i));
  });

  it('renders error trailer when streaming logs', async () => {
    const { getByText } = render(
      <Log
        stepStatus={{ terminated: { reason: 'Error' } }}
        fetchLogs={() =>
          Promise.resolve({
            getReader() {
              return {
                read() {
                  return Promise.resolve({
                    done: true,
                    value: new TextEncoder().encode('testing')
                  });
                }
              };
            }
          })
        }
      />
    );
    await waitFor(() => getByText(/step failed/i));
  });
});
