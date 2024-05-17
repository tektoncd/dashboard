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
import { hot } from 'react-hot-loader/root';
import {
  Link,
  Navigate,
  Route,
  HashRouter as Router,
  Routes
} from 'react-router-dom';
import { IntlProvider, useIntl } from 'react-intl';
import { Content, InlineNotification } from 'carbon-components-react';
import {
  Header,
  LogoutButton,
  PageErrorBoundary
} from '@tektoncd/dashboard-components';
import {
  ALL_NAMESPACES,
  getErrorMessage,
  paths,
  urls,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';

import {
  About,
  ClusterInterceptors,
  ClusterTasks,
  ClusterTriggerBinding,
  ClusterTriggerBindings,
  CreateCustomRun,
  CreatePipelineRun,
  CreateTaskRun,
  CustomResourceDefinition,
  CustomRun,
  CustomRuns,
  EventListener,
  EventListeners,
  HeaderBarContent,
  ImportResources,
  Interceptors,
  LoadingShell,
  NamespacedRoute,
  NotFound,
  PipelineRun,
  PipelineRuns,
  Pipelines,
  ReadWriteRoute,
  ResourceList,
  Settings,
  SideNav,
  TaskRun,
  TaskRuns,
  Tasks,
  Trigger,
  TriggerBinding,
  TriggerBindings,
  Triggers,
  TriggerTemplate,
  TriggerTemplates
} from '..';

import {
  NamespaceContext,
  useDefaultNamespace,
  useExtensions,
  useLogoutURL,
  useNamespaces,
  useProperties,
  useTenantNamespaces
} from '../../api';
import { defaultLocale } from '../../utils';

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

/* istanbul ignore next */
export function App({ lang }) {
  const {
    error: propertiesError,
    isFetching: isFetchingProperties,
    isPlaceholderData: isPropertiesPlaceholder
  } = useProperties();
  const logoutURL = useLogoutURL();
  const tenantNamespaces = useTenantNamespaces();
  const defaultNamespace = useDefaultNamespace();

  const [isSideNavExpanded, setIsSideNavExpanded] = useState(true);
  const [selectedNamespace, setSelectedNamespace] = useState(
    tenantNamespaces[0] || ALL_NAMESPACES
  );
  const [namespacedMatch, setNamespacedMatch] = useState(null);

  const {
    data: messages,
    error: messagesError,
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

  const loadingConfigError = propertiesError || messagesError;

  const queryClient = useQueryClient();

  useNamespaces({
    enabled: !isFetchingConfig && !tenantNamespaces.length
  });
  useWebSocketReconnected(
    () => queryClient.invalidateQueries(),
    isWebSocketConnected
  );

  const logoutButton = <LogoutButton getLogoutURL={() => logoutURL} />;

  const namespaceContext = useMemo(
    () => ({
      namespacedMatch,
      selectedNamespace,
      selectNamespace: setSelectedNamespace,
      setNamespacedMatch
    }),
    [namespacedMatch, selectedNamespace]
  );

  const header = (
    <Header
      headerNameProps={{
        element: HeaderNameLink
      }}
      isSideNavExpanded={isSideNavExpanded}
      onHeaderMenuButtonClick={() => {
        setIsSideNavExpanded(prevIsSideNavExpanded => !prevIsSideNavExpanded);
      }}
    >
      <HeaderBarContent
        isFetchingConfig={isFetchingConfig}
        logoutButton={logoutButton}
      />
    </Header>
  );

  function HandleDefaultNamespace() {
    if (defaultNamespace) {
      setTimeout(() => setSelectedNamespace(defaultNamespace), 0);
    }
    return null;
  }

  return (
    <NamespaceContext.Provider value={namespaceContext}>
      <IntlProvider
        defaultLocale={defaultLocale}
        locale={messages ? lang : defaultLocale}
        messages={messages}
      >
        {showLoadingState && <LoadingShell />}
        {!showLoadingState && (
          <Router>
            <>
              <Routes>
                <Route
                  path={paths.byNamespace({ path: '/*' })}
                  element={header}
                />
                <Route path="*" element={header} />
              </Routes>
              <SideNav expanded={isSideNavExpanded} />

              <Content
                id="main-content"
                className="tkn--main-content"
                aria-labelledby="main-content-header"
                tabIndex="0"
              >
                <ConfigError loadingConfigError={loadingConfigError} />
                <PageErrorBoundary>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <>
                          <HandleDefaultNamespace />
                          <Navigate replace to={urls.about()} />
                        </>
                      }
                    />
                    <Route
                      path={paths.pipelines.all()}
                      element={
                        <NamespacedRoute>
                          <Pipelines />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.pipelines.byNamespace()}
                      element={
                        <NamespacedRoute>
                          <Pipelines />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.pipelineRuns.create()}
                      element={
                        <ReadWriteRoute>
                          <CreatePipelineRun />
                        </ReadWriteRoute>
                      }
                    />
                    <Route
                      path={paths.pipelineRuns.byName()}
                      element={
                        <NamespacedRoute isResourceDetails>
                          <PipelineRun />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.pipelineRuns.all()}
                      element={
                        <NamespacedRoute>
                          <PipelineRuns />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.pipelineRuns.byNamespace()}
                      element={
                        <NamespacedRoute>
                          <PipelineRuns />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.tasks.all()}
                      element={
                        <NamespacedRoute>
                          <Tasks />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.tasks.byNamespace()}
                      element={
                        <NamespacedRoute>
                          <Tasks />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.taskRuns.create()}
                      element={
                        <ReadWriteRoute>
                          <CreateTaskRun />
                        </ReadWriteRoute>
                      }
                    />
                    <Route
                      path={paths.taskRuns.byName()}
                      element={
                        <NamespacedRoute isResourceDetails>
                          <TaskRun />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.taskRuns.all()}
                      element={
                        <NamespacedRoute>
                          <TaskRuns />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.taskRuns.byNamespace()}
                      element={
                        <NamespacedRoute>
                          <TaskRuns />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.customRuns.create()}
                      element={
                        <ReadWriteRoute>
                          <CreateCustomRun />
                        </ReadWriteRoute>
                      }
                    />
                    <Route
                      path={paths.customRuns.all()}
                      element={
                        <NamespacedRoute>
                          <CustomRuns />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.customRuns.byNamespace()}
                      element={
                        <NamespacedRoute>
                          <CustomRuns />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.customRuns.byName()}
                      element={
                        <NamespacedRoute isResourceDetails>
                          <CustomRun />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.clusterTasks.all()}
                      element={<ClusterTasks />}
                    />
                    <Route path={paths.about()} element={<About />} />
                    <Route path={paths.settings()} element={<Settings />} />
                    <Route
                      path={paths.importResources()}
                      element={
                        <ReadWriteRoute>
                          <ImportResources />
                        </ReadWriteRoute>
                      }
                    />
                    <Route
                      path={paths.eventListeners.all()}
                      element={
                        <NamespacedRoute>
                          <EventListeners />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.eventListeners.byNamespace()}
                      element={
                        <NamespacedRoute>
                          <EventListeners />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.eventListeners.byName()}
                      element={
                        <NamespacedRoute isResourceDetails>
                          <EventListener />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.triggers.byName()}
                      element={
                        <NamespacedRoute isResourceDetails>
                          <Trigger />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.triggers.all()}
                      element={
                        <NamespacedRoute>
                          <Triggers />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.triggers.byNamespace()}
                      element={
                        <NamespacedRoute>
                          <Triggers />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.triggerBindings.byName()}
                      element={
                        <NamespacedRoute isResourceDetails>
                          <TriggerBinding />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.triggerBindings.all()}
                      element={
                        <NamespacedRoute>
                          <TriggerBindings />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.triggerBindings.byNamespace()}
                      element={
                        <NamespacedRoute>
                          <TriggerBindings />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.clusterTriggerBindings.byName()}
                      element={<ClusterTriggerBinding />}
                    />
                    <Route
                      path={paths.clusterTriggerBindings.all()}
                      element={<ClusterTriggerBindings />}
                    />
                    <Route
                      path={paths.triggerTemplates.byName()}
                      element={
                        <NamespacedRoute isResourceDetails>
                          <TriggerTemplate />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.triggerTemplates.all()}
                      element={
                        <NamespacedRoute>
                          <TriggerTemplates />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.triggerTemplates.byNamespace()}
                      element={
                        <NamespacedRoute>
                          <TriggerTemplates />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.interceptors.all()}
                      element={
                        <NamespacedRoute>
                          <Interceptors />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.interceptors.byNamespace()}
                      element={
                        <NamespacedRoute>
                          <Interceptors />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.clusterInterceptors.all()}
                      element={<ClusterInterceptors />}
                    />
                    <Route
                      path={paths.rawCRD.byNamespace()}
                      element={
                        <NamespacedRoute isResourceDetails>
                          <CustomResourceDefinition />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.rawCRD.cluster()}
                      element={<CustomResourceDefinition />}
                    />
                    <Route
                      path={paths.kubernetesResources.all()}
                      element={
                        <NamespacedRoute>
                          <ResourceList />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.kubernetesResources.byNamespace()}
                      element={
                        <NamespacedRoute>
                          <ResourceList />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.kubernetesResources.byName()}
                      element={
                        <NamespacedRoute isResourceDetails>
                          <CustomResourceDefinition />
                        </NamespacedRoute>
                      }
                    />
                    <Route
                      path={paths.kubernetesResources.cluster()}
                      element={<CustomResourceDefinition />}
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PageErrorBoundary>
              </Content>
            </>
          </Router>
        )}
      </IntlProvider>
    </NamespaceContext.Provider>
  );
}

export default hot(App);
