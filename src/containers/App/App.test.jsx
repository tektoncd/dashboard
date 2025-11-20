/*
Copyright 2019-2024 The Tekton Authors
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

import { fireEvent, waitFor } from '@testing-library/react';

import { App } from './App';
import { render } from '../../utils/test';
import * as API from '../../api';
import * as PipelinesAPI from '../../api/pipelines';

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(API, 'useProperties').mockImplementation(() => ({ data: {} }));
    vi.spyOn(PipelinesAPI, 'usePipelines').mockImplementation(() => ({
      data: []
    }));
    vi.spyOn(API, 'useIsReadOnly').mockImplementation(() => true);
    vi.spyOn(API, 'useIsTriggersInstalled').mockImplementation(() => false);
    vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({ data: [] }));
  });

  it('renders successfully in full cluster mode', async () => {
    vi.spyOn(API, 'useTenantNamespaces').mockImplementation(() => []);
    const { findAllByText, queryAllByText, queryByText } = render(
      <App lang="en" />
    );

    await waitFor(() => queryByText('Tekton resources'));
    await findAllByText('PipelineRuns');
    fireEvent.click(queryAllByText('PipelineRuns')[0]);

    expect(queryByText('Pipelines')).toBeTruthy();
    expect(queryByText('Tasks')).toBeTruthy();
  });

  it('renders successfully in tenant namespace mode', async () => {
    vi.spyOn(API, 'useTenantNamespaces').mockImplementation(() => ['fake']);
    const { findAllByText, queryAllByText, queryByText } = render(
      <App lang="en" />
    );

    await waitFor(() => queryByText('Tekton resources'));
    await findAllByText('PipelineRuns');
    fireEvent.click(queryAllByText('PipelineRuns')[0]);

    expect(queryByText('Pipelines')).toBeTruthy();
    expect(queryByText('Tasks')).toBeTruthy();
  });

  it('does not call namespaces API in tenant namespace mode', async () => {
    vi.spyOn(API, 'useTenantNamespaces').mockImplementation(() => ['fake']);
    const { queryByText } = render(<App lang="en" />);

    await waitFor(() => queryByText('Tekton resources'));
    expect(API.useNamespaces).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });

  it('calls namespaces API in full cluster mode', async () => {
    vi.spyOn(API, 'useTenantNamespaces').mockImplementation(() => []);
    const { queryByText } = render(<App lang="en" />);

    await waitFor(() => queryByText('Tekton resources'));
    await waitFor(() =>
      expect(API.useNamespaces).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: true })
      )
    );
  });
});

describe('App - ScrollButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();

    vi.spyOn(API, 'useProperties').mockImplementation(() => ({ data: {} }));
    vi.spyOn(PipelinesAPI, 'usePipelines').mockImplementation(() => ({
      data: []
    }));
    vi.spyOn(API, 'useIsReadOnly').mockImplementation(() => true);
    vi.spyOn(API, 'useIsTriggersInstalled').mockImplementation(() => false);
    vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({ data: [] }));
  });

  it('show scroll buttons container when scrolling', async () => {
    Object.defineProperty(window, 'scrollY', {
      value: 150,
      writable: true,
      configurable: true
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      writable: true,
      configurable: true
    });

    const { queryByText, container } = render(<App />);

    await waitFor(() => queryByText('Tekton resources'));

    fireEvent.scroll(window, { y: 150 });

    await waitFor(() => {
      const scrollButtonsContainer = container.querySelector(
        '.tkn--scroll-buttons'
      );
      expect(scrollButtonsContainer).not.toBeNull();
    });
  });

  it('does not show scroll-to-bottom button when there is no scroll', async () => {
    const { queryByTestId, queryByText } = render(<App />);

    await waitFor(() => queryByText('Tekton resources'));

    // scroll-to-bottom button should not show
    expect(queryByTestId('log-scroll-to-end-btn')).toBeNull();
  });

  it('calls scrollTo when scroll-to-top button is clicked', async () => {
    Object.defineProperty(window, 'scrollY', {
      value: 250,
      writable: true,
      configurable: true
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      writable: true,
      configurable: true
    });

    const { queryByText } = render(<App />);

    await waitFor(() => queryByText('Tekton resources'));

    fireEvent.scroll(window, { y: 250 });

    await waitFor(() => {
      const button = document.getElementById('log-scroll-to-start-btn');
      expect(button).not.toBeNull();
      fireEvent.click(button);
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });
  });

  it('calls scrollTo when scroll-to-bottom button is clicked', async () => {
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
      configurable: true
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      writable: true,
      configurable: true
    });

    const { queryByText } = render(<App />);

    await waitFor(() => queryByText('Tekton resources'));

    fireEvent.scroll(window, { y: 0 });

    await waitFor(() => {
      const button = document.getElementById('log-scroll-to-end-btn');
      expect(button).not.toBeNull();
      fireEvent.click(button);
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 2000,
      behavior: 'smooth'
    });
  });

  it('scroll to top when logs container is maximized', async () => {
    const { queryByText, container: appContainer } = render(<App />);

    await waitFor(() => queryByText('Tekton resources'));

    // Create a maximized container
    const maximizedContainer = document.createElement('div');
    maximizedContainer.className = 'tkn--taskrun--maximized';
    maximizedContainer.scrollTo = vi.fn();
    Object.defineProperty(maximizedContainer, 'scrollHeight', { value: 3000 });
    Object.defineProperty(maximizedContainer, 'clientHeight', { value: 800 });
    Object.defineProperty(maximizedContainer, 'scrollTop', {
      value: 250,
      writable: true
    });
    document.body.appendChild(maximizedContainer);

    fireEvent.scroll(maximizedContainer);

    await waitFor(() => {
      const scrollButtonsDiv = appContainer.querySelector(
        '.tkn--scroll-buttons'
      );
      expect(scrollButtonsDiv).not.toBeNull();
      expect(
        scrollButtonsDiv.classList.contains('tkn--scroll-buttons--maximized')
      ).toBe(true);
    });

    await waitFor(() => {
      const button = document.getElementById('log-scroll-to-start-btn');
      expect(button).not.toBeNull();
    });

    const button = document.getElementById('log-scroll-to-start-btn');
    fireEvent.click(button);

    // Check container.scrollTo was called (not window.scrollTo)
    expect(maximizedContainer.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });

    document.body.removeChild(maximizedContainer);
  });

  it('scroll to bottom when logs container is maximized', async () => {
    const { queryByText } = render(<App />);

    await waitFor(() => queryByText('Tekton resources'));

    const maximizedContainer = document.createElement('div');
    maximizedContainer.className = 'tkn--taskrun--maximized';
    maximizedContainer.scrollTo = vi.fn();
    Object.defineProperty(maximizedContainer, 'scrollHeight', { value: 3000 });
    Object.defineProperty(maximizedContainer, 'clientHeight', { value: 800 });
    Object.defineProperty(maximizedContainer, 'scrollTop', {
      value: 0,
      writable: true
    });

    document.body.appendChild(maximizedContainer);

    fireEvent.scroll(maximizedContainer);

    await waitFor(() =>
      expect(document.getElementById('log-scroll-to-end-btn')).not.toBeNull()
    );

    fireEvent.click(document.getElementById('log-scroll-to-end-btn'));

    expect(maximizedContainer.scrollTo).toHaveBeenCalledWith({
      top: 3000,
      behavior: 'smooth'
    });

    document.body.removeChild(maximizedContainer);
  });
});
