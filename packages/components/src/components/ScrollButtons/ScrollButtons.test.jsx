/*
Copyright 2019-2025 The Tekton Authors
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
import { render } from '../../utils/test';
import ScrollButtons from './ScrollButtons';

describe('ScrollButtons', () => {
  beforeEach(() => {
    // Reset scroll position
    window.scrollY = 0;
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 2000
    });
  });

  afterEach(() => {
    // Clean up any maximized containers
    const maximizedContainers = document.querySelectorAll(
      '.tkn--taskrun--maximized'
    );
    maximizedContainers.forEach(container => container.remove());
  });

  it('renders nothing when at top of non-scrollable page', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 800
    });

    const { container } = render(<ScrollButtons />);
    expect(container.querySelector('.tkn--scroll-buttons')).toBeFalsy();
  });

  it('shows scroll-to-bottom button when at the top of scrollable page', async () => {
    const { queryByLabelText } = render(<ScrollButtons />);

    await waitFor(() => {
      expect(queryByLabelText('Scroll to bottom')).toBeTruthy();
    });
    expect(queryByLabelText('Scroll to top')).toBeFalsy();
  });

  it('shows scroll-to-top button when at the bottom of scrollable page', async () => {
    const { queryByLabelText } = render(<ScrollButtons />);

    // Simulate scrolling down
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 200
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(queryByLabelText('Scroll to top')).toBeTruthy();
    });
  });

  it('shows both buttons when in middle of page', async () => {
    const { queryByLabelText } = render(<ScrollButtons />);

    // Simulate scrolling to middle
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 500
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(queryByLabelText('Scroll to top')).toBeTruthy();
      expect(queryByLabelText('Scroll to bottom')).toBeTruthy();
    });
  });

  it('hides scroll-to-bottom button when at bottom', async () => {
    const { queryByLabelText } = render(<ScrollButtons />);

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 1200 // scrollHeight (2000) - innerHeight (800)
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(queryByLabelText('Scroll to top')).toBeTruthy();
      expect(queryByLabelText('Scroll to bottom')).toBeFalsy();
    });
  });

  it('scrolls to top when scroll to top button is clicked', async () => {
    const scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy;

    const { queryByLabelText } = render(<ScrollButtons />);

    // scroll down first
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 500
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(queryByLabelText('Scroll to top')).toBeTruthy();
    });

    const scrollTopButton = queryByLabelText('Scroll to top');
    fireEvent.click(scrollTopButton);

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });
  });

  it('scrolls to bottom when scroll-to-bottom button is clicked', async () => {
    const scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy;

    const { queryByLabelText } = render(<ScrollButtons />);

    await waitFor(() => {
      expect(queryByLabelText('Scroll to bottom')).toBeTruthy();
    });

    const scrollBottomButton = queryByLabelText('Scroll to bottom');
    fireEvent.click(scrollBottomButton);

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  });

  it('handles maximized container scroll events', async () => {
    const { queryByLabelText, container } = render(<ScrollButtons />);

    // Create container first, then add the maximized class to trigger MutationObserver later
    const maximizedContainer = document.createElement('div');
    document.body.appendChild(maximizedContainer);

    const containerScrollToSpy = vi.fn();
    maximizedContainer.scrollTo = containerScrollToSpy;
    Object.defineProperty(maximizedContainer, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 0
    });
    Object.defineProperty(maximizedContainer, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 2000
    });
    Object.defineProperty(maximizedContainer, 'clientHeight', {
      writable: true,
      configurable: true,
      value: 500
    });

    // Add the maximized class to trigger the MutationObserver
    maximizedContainer.className = 'tkn--taskrun--maximized';

    // Wait for MutationObserver to detect the class change and apply maximized class
    await waitFor(() => {
      expect(queryByLabelText('Scroll to bottom')).toBeTruthy();
      const scrollButtonsContainer = container.querySelector(
        '.tkn--scroll-buttons'
      );
      expect(
        scrollButtonsContainer?.classList.contains(
          'tkn--scroll-buttons--maximized'
        )
      ).toBe(true);
    });

    // scroll down the maximized container
    Object.defineProperty(maximizedContainer, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 500
    });
    fireEvent.scroll(maximizedContainer);

    // Both buttons should be visible
    await waitFor(() => {
      expect(queryByLabelText('Scroll to top')).toBeTruthy();
      expect(queryByLabelText('Scroll to bottom')).toBeTruthy();
    });

    // test scroll-to-top button in maximized mode
    const scrollTopButton = queryByLabelText('Scroll to top');
    fireEvent.click(scrollTopButton);

    expect(containerScrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });

    // test scroll-to-bottom button in maximized mode
    const scrollBottomButton = queryByLabelText('Scroll to bottom');
    fireEvent.click(scrollBottomButton);

    expect(containerScrollToSpy).toHaveBeenCalledWith({
      top: 2000, // scrollHeight of maximized container
      behavior: 'smooth'
    });

    // scroll to bottom - only scroll-to-top should be visible
    Object.defineProperty(maximizedContainer, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 1500 // 2000 - 500 = 1500 (at bottom)
    });
    fireEvent.scroll(maximizedContainer);

    await waitFor(() => {
      expect(queryByLabelText('Scroll to top')).toBeTruthy();
      expect(queryByLabelText('Scroll to bottom')).toBeFalsy();
    });

    // test removal of maximized container
    maximizedContainer.className = '';

    await waitFor(() => {
      const scrollButtonsContainer = container.querySelector(
        '.tkn--scroll-buttons'
      );
      expect(
        scrollButtonsContainer?.classList.contains(
          'tkn--scroll-buttons--maximized'
        )
      ).toBe(false);
    });
  });

  it('renders correct button IDs', async () => {
    const { container } = render(<ScrollButtons />);

    // scroll to middle - both buttons should be visible
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 500
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(container.querySelector('#log-scroll-to-start-btn')).toBeTruthy();
      expect(container.querySelector('#log-scroll-to-end-btn')).toBeTruthy();
    });
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<ScrollButtons />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });

  it('uses custom threshold values', async () => {
    const { queryByLabelText } = render(
      <ScrollButtons topThreshold={50} bottomThreshold={50} />
    );

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 60
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(queryByLabelText('Scroll to top')).toBeTruthy();
    });
  });

  it('uses auto scroll behavior when prefers-reduced-motion is enabled', async () => {
    // mock matchMedia - return true for prefers-reduced-motion
    vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)'
    }));

    const scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy;

    const { queryByLabelText } = render(<ScrollButtons />);

    // Scroll down - show scroll-to-top button
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 500
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(queryByLabelText('Scroll to top')).toBeTruthy();
    });

    const scrollTopButton = queryByLabelText('Scroll to top');
    fireEvent.click(scrollTopButton);

    // Should use 'auto' behavior instead of 'smooth'
    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: 'auto'
    });
  });
});
