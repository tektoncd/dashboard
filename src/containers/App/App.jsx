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
import { Link, Redirect, HashRouter as Router, Switch } from 'react-router-dom';
import {
  CompatRoute,
  CompatRouter,
  Route,
  Routes
} from 'react-router-dom-v5-compat';
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
  Extension,
  Extensions,
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

  const { data: extensions = [], isWebSocketConnected } = useExtensions(
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
            <CompatRouter>
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
                    <Switch>
                      <CompatRoute path="/" exact>
                        <>
                          <HandleDefaultNamespace />
                          <Redirect to={urls.about()} />
                        </>
                      </CompatRoute>
                      <CompatRoute path={paths.pipelines.all()} exact>
                        <NamespacedRoute>
                          <Pipelines />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.pipelines.byNamespace()} exact>
                        <NamespacedRoute>
                          <Pipelines />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.pipelineRuns.create()} exact>
                        <ReadWriteRoute>
                          <CreatePipelineRun />
                        </ReadWriteRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.pipelineRuns.byName()}>
                        <NamespacedRoute isResourceDetails>
                          <PipelineRun />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.pipelineRuns.all()}>
                        <NamespacedRoute>
                          <PipelineRuns />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.pipelineRuns.byNamespace()}>
                        <NamespacedRoute>
                          <PipelineRuns />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.tasks.all()} exact>
                        <NamespacedRoute>
                          <Tasks />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.tasks.byNamespace()} exact>
                        <NamespacedRoute>
                          <Tasks />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.taskRuns.create()} exact>
                        <ReadWriteRoute>
                          <CreateTaskRun />
                        </ReadWriteRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.taskRuns.byName()}>
                        <NamespacedRoute isResourceDetails>
                          <TaskRun />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.taskRuns.all()}>
                        <NamespacedRoute>
                          <TaskRuns />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.taskRuns.byNamespace()}>
                        <NamespacedRoute>
                          <TaskRuns />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.customRuns.create()} exact>
                        <ReadWriteRoute>
                          <CreateCustomRun />
                        </ReadWriteRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.customRuns.all()}>
                        <NamespacedRoute>
                          <CustomRuns />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.customRuns.byNamespace()} exact>
                        <NamespacedRoute>
                          <CustomRuns />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.customRuns.byName()} exact>
                        <NamespacedRoute isResourceDetails>
                          <CustomRun />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.clusterTasks.all()} exact>
                        <ClusterTasks />
                      </CompatRoute>
                      <CompatRoute path={paths.about()}>
                        <About />
                      </CompatRoute>
                      <CompatRoute path={paths.settings()}>
                        <Settings />
                      </CompatRoute>
                      <CompatRoute path={paths.importResources()}>
                        <ReadWriteRoute>
                          <ImportResources />
                        </ReadWriteRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.eventListeners.all()} exact>
                        <NamespacedRoute>
                          <EventListeners />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute
                        path={paths.eventListeners.byNamespace()}
                        exact
                      >
                        <NamespacedRoute>
                          <EventListeners />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.eventListeners.byName()} exact>
                        <NamespacedRoute isResourceDetails>
                          <EventListener />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.triggers.byName()} exact>
                        <NamespacedRoute isResourceDetails>
                          <Trigger />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.triggers.all()} exact>
                        <NamespacedRoute>
                          <Triggers />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.triggers.byNamespace()} exact>
                        <NamespacedRoute>
                          <Triggers />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.triggerBindings.byName()} exact>
                        <NamespacedRoute isResourceDetails>
                          <TriggerBinding />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.triggerBindings.all()} exact>
                        <NamespacedRoute>
                          <TriggerBindings />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute
                        path={paths.triggerBindings.byNamespace()}
                        exact
                      >
                        <NamespacedRoute>
                          <TriggerBindings />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute
                        path={paths.clusterTriggerBindings.byName()}
                        exact
                      >
                        <ClusterTriggerBinding />
                      </CompatRoute>
                      <CompatRoute
                        path={paths.clusterTriggerBindings.all()}
                        exact
                      >
                        <ClusterTriggerBindings />
                      </CompatRoute>
                      <CompatRoute path={paths.triggerTemplates.byName()} exact>
                        <NamespacedRoute isResourceDetails>
                          <TriggerTemplate />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.triggerTemplates.all()} exact>
                        <NamespacedRoute>
                          <TriggerTemplates />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute
                        path={paths.triggerTemplates.byNamespace()}
                        exact
                      >
                        <NamespacedRoute>
                          <TriggerTemplates />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.interceptors.all()} exact>
                        <NamespacedRoute>
                          <Interceptors />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute
                        path={paths.interceptors.byNamespace()}
                        exact
                      >
                        <NamespacedRoute>
                          <Interceptors />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.clusterInterceptors.all()} exact>
                        <ClusterInterceptors />
                      </CompatRoute>
                      <CompatRoute path={paths.extensions.all()} exact>
                        <Extensions />
                      </CompatRoute>
                      {extensions
                        .filter(extension => !extension.type)
                        .map(({ displayName, name, source }) => (
                          <CompatRoute
                            key={name}
                            path={paths.extensions.byName({ name })}
                          >
                            <Extension
                              displayName={displayName}
                              source={source}
                            />
                          </CompatRoute>
                        ))}
                      <CompatRoute path={paths.rawCRD.byNamespace()} exact>
                        <NamespacedRoute isResourceDetails>
                          <CustomResourceDefinition />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute path={paths.rawCRD.cluster()} exact>
                        <CustomResourceDefinition />
                      </CompatRoute>
                      <CompatRoute path={paths.kubernetesResources.all()} exact>
                        <NamespacedRoute>
                          <ResourceList />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute
                        path={paths.kubernetesResources.byNamespace()}
                        exact
                      >
                        <NamespacedRoute>
                          <ResourceList />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute
                        path={paths.kubernetesResources.byName()}
                        exact
                      >
                        <NamespacedRoute isResourceDetails>
                          <CustomResourceDefinition />
                        </NamespacedRoute>
                      </CompatRoute>
                      <CompatRoute
                        path={paths.kubernetesResources.cluster()}
                        exact
                      >
                        <CustomResourceDefinition />
                      </CompatRoute>
                      <NotFound />
                    </Switch>
                  </PageErrorBoundary>
                </Content>
              </>
            </CompatRouter>
          </Router>
        )}
      </IntlProvider>
    </NamespaceContext.Provider>
  );
}

export default hot(App);
