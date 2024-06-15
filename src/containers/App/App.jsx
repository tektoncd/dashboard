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

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createHashRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { IntlProvider, useIntl } from 'react-intl';
import {
  Content,
  HeaderContainer,
  InlineNotification
} from 'carbon-components-react';
import { PageErrorBoundary } from '@tektoncd/dashboard-components';
import {
  ALL_NAMESPACES,
  getErrorMessage,
  paths,
  urls,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';

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

  const header = (
    <HeaderContainer
      isSideNavExpanded
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <Header
          headerNameProps={{
            element: HeaderNameLink
          }}
          isSideNavExpanded={isSideNavExpanded}
          onHeaderMenuButtonClick={onClickSideNavExpand}
        >
          <HeaderBarContent />
        </Header>
      )}
    />
  );

  return (
    <>
      <Routes>
        <Route path={paths.byNamespace({ path: '/*' })} element={header} />
        <Route path="*" element={header} />
      </Routes>

      <Content
        id="main-content"
        className="tkn--main-content"
        aria-labelledby="main-content-header"
        tabIndex="0"
      >
        <ConfigError loadingConfigError={loadingConfigError} />
        <PageErrorBoundary>
          <Outlet />
        </PageErrorBoundary>
      </Content>
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
  const [namespacedMatch, setNamespacedMatch] = useState(null);

  const {
    data: messages,
    isFetching: isFetchingMessages,
    isPlaceholderData: isMessagesPlaceholder
  } = useQuery(['i18n', lang], () => loadMessages(lang), {
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
      namespacedMatch,
      selectedNamespace,
      selectNamespace: setSelectedNamespace,
      setNamespacedMatch
    }),
    [namespacedMatch, selectedNamespace]
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
