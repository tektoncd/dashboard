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

import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button } from '@carbon/react';
import { DownToBottom, UpToTop } from '@carbon/react/icons';

export function ScrollButtons() {
  const intl = useIntl();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const maximizedContainerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      //Check for maximized container
      const maximizedContainer = maximizedContainerRef.current;
      setIsMaximized(!!maximizedContainer);
      let scrollTop, scrollHeight, clientHeight;

      if (maximizedContainer) {
        scrollTop = maximizedContainer.scrollTop; // how far scrolled down
        scrollHeight = maximizedContainer.scrollHeight; // content inside container
        clientHeight = maximizedContainer.clientHeight; //
      } else {
        scrollTop = window.scrollY; //scrolled down
        scrollHeight = document.documentElement.scrollHeight; // height of page
        clientHeight = window.innerHeight;
      }

      // Show scroll-to-top when not at top
      setShowScrollTop(scrollTop > 100);

      // Show scroll-to-bottom when not at bottom
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
      const isScrollable = scrollHeight > clientHeight;
      setShowScrollBottom(!isAtBottom && isScrollable);
    };

    // Initialize the ref with current maximized container
    maximizedContainerRef.current = document.querySelector(
      '.tkn--taskrun--maximized'
    );

    window.addEventListener('scroll', handleScroll, { passive: true });
    if (maximizedContainerRef.current) {
      maximizedContainerRef.current.addEventListener('scroll', handleScroll, {
        passive: true
      });
    }

    //Watch for maximize/minimize changes
    const observer = new MutationObserver(() => {
      const newMaximizedContainer = document.querySelector(
        '.tkn--taskrun--maximized'
      );

      // Remove listener from previous maximized container
      if (maximizedContainerRef.current) {
        maximizedContainerRef.current.removeEventListener(
          'scroll',
          handleScroll
        );
      }

      // Add listener to new maximized container
      if (newMaximizedContainer) {
        newMaximizedContainer.addEventListener('scroll', handleScroll, {
          passive: true
        });
        maximizedContainerRef.current = newMaximizedContainer;
      } else {
        maximizedContainerRef.current = null;
      }

      handleScroll();
    });

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class']
    });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      if (maximizedContainerRef.current) {
        maximizedContainerRef.current.removeEventListener(
          'scroll',
          handleScroll
        );
      }
    };
  }, []);

  const getScrollBehavior = () => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    return prefersReducedMotion ? 'auto' : 'smooth';
  };

  const scrollToTop = () => {
    if (maximizedContainerRef.current) {
      maximizedContainerRef.current.scrollTo({
        top: 0,
        behavior: getScrollBehavior()
      });
    } else {
      window.scrollTo({ top: 0, behavior: getScrollBehavior() });
    }
  };

  const scrollToBottom = () => {
    if (maximizedContainerRef.current) {
      maximizedContainerRef.current.scrollTo({
        top: maximizedContainerRef.current.scrollHeight,
        behavior: getScrollBehavior()
      });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: getScrollBehavior()
      });
    }
  };

  const scrollTopMessage = intl.formatMessage({
    id: 'dashboard.app.scrollToTop',
    defaultMessage: 'Scroll to top'
  });

  const scrollBottomMessage = intl.formatMessage({
    id: 'dashboard.app.scrollToBottom',
    defaultMessage: 'Scroll to bottom'
  });

  if (!showScrollTop && !showScrollBottom) {
    return null;
  }

  return (
    <div
      className={`tkn--scroll-buttons ${isMaximized ? 'tkn--scroll-buttons--maximized' : ''}`}
    >
      {showScrollTop && (
        <Button
          className="tkn--scroll-button"
          hasIconOnly
          iconDescription={scrollTopMessage}
          id="log-scroll-to-start-btn"
          kind="secondary"
          onClick={scrollToTop}
          renderIcon={UpToTop}
          size="md"
          tooltipPosition="left"
        />
      )}
      {showScrollBottom && (
        <Button
          className="tkn--scroll-button"
          hasIconOnly
          iconDescription={scrollBottomMessage}
          id="log-scroll-to-end-btn"
          kind="secondary"
          onClick={scrollToBottom}
          renderIcon={DownToBottom}
          size="md"
          tooltipPosition="left"
        />
      )}
    </div>
  );
}

export default ScrollButtons;
