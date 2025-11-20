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

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createHashRouter,
  Link,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { IntlProvider, useIntl } from 'react-intl';
import {
  Button,
  Content,
  HeaderContainer,
  InlineNotification
} from '@carbon/react';
import { PageErrorBoundary } from '@tektoncd/dashboard-components';
import {
  ALL_NAMESPACES,
  getErrorMessage,
  urls,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import { DownToBottom, UpToTop } from '@carbon/react/icons';

import {
  ErrorPage,
  Header,
  HeaderBarContent,
  LoadingShell,
  NotFound
} from '..';

import {
  NamespaceContext,
  useDefaultNamespace,
  useExtensions,
  useNamespaces,
  useProperties,
  useSelectedNamespace,
  useTenantNamespaces
} from '../../api';
import { defaultLocale, getLocale } from '../../utils';
import routes from '../../routes';

import '../../scss/App.scss';

/* istanbul ignore next */
const ConfigErrorComponent = ({ loadingConfigError }) => {
  const intl = useIntl();
  if (!loadingConfigError) {
    return null;
  }

  return (
    <InlineNotification
      kind="error"
      title={intl.formatMessage({
        id: 'dashboard.app.loadingConfigError',
        defaultMessage: 'Error loading configuration'
      })}
      subtitle={getErrorMessage(loadingConfigError)}
      lowContrast
    />
  );
};

const ConfigError = ConfigErrorComponent;

function ScrollButtons() {
  const intl = useIntl();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      //Check for maximized container
      const maximizedContainer = document.querySelector(
        '.tkn--taskrun--maximized'
      );
      setIsMaximized(!!maximizedContainer);
      let scrollTop, scrollHeight, clientHeight;

      if (maximizedContainer) {
        scrollTop = maximizedContainer.scrollTop;
        scrollHeight = maximizedContainer.scrollHeight;
        clientHeight = maximizedContainer.clientHeight;
      } else {
        scrollTop = window.scrollY;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      }

      // Show scroll-to-top when not at top
      setShowScrollTop(scrollTop > 200);

      // Show scroll-to-bottom when not at bottom
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
      const isScrollable = scrollHeight > clientHeight;
      setShowScrollBottom(!isAtBottom && isScrollable);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const maximizedContainer = document.querySelector(
      '.tkn--taskrun--maximized'
    );
    if (maximizedContainer) {
      maximizedContainer.addEventListener('scroll', handleScroll, {
        passive: true
      });
    }

    //Watch for maximize/minimize changes
    const observer = new MutationObserver(() => {
      const newMaximizedContainer = document.querySelector(
        '.tkn--taskrun--maximized'
      );
      if (newMaximizedContainer) {
        newMaximizedContainer.addEventListener('scroll', handleScroll, {
          passive: true
        });
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
      const maxContainer = document.querySelector('.tkn--taskrun--maximized');
      if (maxContainer) {
        maxContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    const maximizedContainer = document.querySelector(
      '.tkn--taskrun--maximized'
    );

    if (maximizedContainer) {
      maximizedContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    const maximizedContainer = document.querySelector(
      '.tkn--taskrun--maximized'
    );

    if (maximizedContainer) {
      maximizedContainer.scrollTo({
        top: maximizedContainer.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
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
          renderIcon={() => (
            <UpToTop>
              <title>{scrollTopMessage}</title>
            </UpToTop>
          )}
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
          renderIcon={() => (
            <DownToBottom>
              <title>{scrollBottomMessage}</title>
            </DownToBottom>
          )}
          size="md"
          tooltipPosition="left"
        />
      )}
    </div>
  );
}

async function loadMessages(lang) {
  const loadedMessages = (await import(`../../nls/messages_${lang}.json`))
    .default;
  /* istanbul ignore next */
  if (import.meta.env.MODE === 'i18n:pseudo') {
    const startBoundary = '[[%';
    const endBoundary = '%]]';
    // Make it easier to identify untranslated strings in the UI
    Object.keys(loadedMessages).forEach(messageId => {
      if (loadedMessages[messageId].startsWith(startBoundary)) {
        // avoid repeating the boundaries when
        // hot reloading in dev mode
        return;
      }
      loadedMessages[messageId] =
        `${startBoundary}${loadedMessages[messageId]}${endBoundary}`;
    });
  }

  return loadedMessages;
}

function HeaderNameLink(props) {
  return <Link {...props} to={urls.about()} />;
}

function Root() {
  const lang = getLocale(navigator.language);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { error: propertiesError } =
    queryClient.getQueryState(['properties']) || {};
  const { error: messagesError } =
    queryClient.getQueryState(['i18n', lang]) || {};
  const loadingConfigError = propertiesError || messagesError;
  const defaultNamespace = useDefaultNamespace();
  const { selectNamespace } = useSelectedNamespace();

  if (location.state?.fromDefaultRoute && defaultNamespace) {
    setTimeout(() => {
      selectNamespace(defaultNamespace);
      // reset state to disable defaulting behaviour and allow
      // user to select different namespace after initial load
      navigate(location.pathname, { replace: true, state: {} });
    }, 0);
  }

  return (
    <>
      <HeaderContainer
        isSideNavExpanded
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
          <Header
            headerNameProps={{
              as: HeaderNameLink
            }}
            isSideNavExpanded={isSideNavExpanded}
            onHeaderMenuButtonClick={onClickSideNavExpand}
          >
            <HeaderBarContent />
          </Header>
        )}
      />

      <Content
        id="main-content"
        className="tkn--main-content"
        aria-labelledby="main-content-header"
      >
        <ConfigError loadingConfigError={loadingConfigError} />
        <PageErrorBoundary>
          <Outlet />
        </PageErrorBoundary>
      </Content>
      <ScrollButtons />
    </>
  );
}

const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: (
              <Navigate
                to={urls.about()}
                replace
                state={{ fromDefaultRoute: true }}
              />
            )
          },
          ...routes.dashboard,
          ...routes.pipelines,
          ...routes.triggers,
          {
            path: '*',
            element: <NotFound />
          }
        ]
      }
    ]
  }
]);

/* istanbul ignore next */
export function App() {
  const lang = getLocale(navigator.language);
  const {
    isFetching: isFetchingProperties,
    isPlaceholderData: isPropertiesPlaceholder
  } = useProperties();
  const tenantNamespaces = useTenantNamespaces();

  const [selectedNamespace, setSelectedNamespace] = useState(
    tenantNamespaces[0] || ALL_NAMESPACES
  );

  const {
    data: messages,
    isFetching: isFetchingMessages,
    isPlaceholderData: isMessagesPlaceholder
  } = useQuery({
    queryKey: ['i18n', lang],
    queryFn: () => loadMessages(lang),
    placeholderData: {}
  });

  const showLoadingState = isPropertiesPlaceholder || isMessagesPlaceholder;
  const isFetchingConfig = isFetchingProperties || isFetchingMessages;

  const { isWebSocketConnected } = useExtensions(
    { namespace: tenantNamespaces[0] || ALL_NAMESPACES },
    { enabled: !isFetchingConfig }
  );

  const queryClient = useQueryClient();

  useNamespaces({
    enabled: !isFetchingConfig && !tenantNamespaces.length
  });
  useWebSocketReconnected(
    () => queryClient.invalidateQueries(),
    isWebSocketConnected
  );

  const namespaceContext = useMemo(
    () => ({
      selectedNamespace,
      selectNamespace: setSelectedNamespace
    }),
    [selectedNamespace]
  );

  return (
    <NamespaceContext.Provider value={namespaceContext}>
      <IntlProvider
        defaultLocale={defaultLocale}
        locale={messages ? lang : defaultLocale}
        messages={messages}
      >
        {showLoadingState && <LoadingShell />}
        {!showLoadingState && <RouterProvider router={router} />}
      </IntlProvider>
    </NamespaceContext.Provider>
  );
}

export default App;
