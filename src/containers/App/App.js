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

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { hot } from 'react-hot-loader/root';
import {
  Link,
  Redirect,
  Route,
  HashRouter as Router,
  Switch
} from 'react-router-dom';

import { injectIntl, IntlProvider } from 'react-intl';
import { Content, InlineNotification } from 'carbon-components-react';

import {
  Header,
  LoadingShell,
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
  Condition,
  Conditions,
  CreatePipelineResource,
  CreatePipelineRun,
  CreateTaskRun,
  CustomResourceDefinition,
  EventListener,
  EventListeners,
  Extension,
  Extensions,
  ImportResources,
  NotFound,
  PipelineResource,
  PipelineResources,
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
  useExtensions,
  useIsReadOnly,
  useLogoutURL,
  useNamespaces,
  useProperties,
  useTenantNamespace
} from '../../api';

import config from '../../../config_frontend/config.json';

import '../../scss/App.scss';

const { default: defaultLocale, supported: supportedLocales } = config.locales;

/* istanbul ignore next */
const ConfigErrorComponent = ({ intl, loadingConfigError }) => {
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

const ConfigError = injectIntl(ConfigErrorComponent);

async function loadMessages(lang) {
  const isSupportedLocale = supportedLocales.includes(lang);
  const targetLocale = isSupportedLocale ? lang : defaultLocale;
  const { default: loadedMessages } = await import(
    /* webpackChunkName: "[request]" */ `../../nls/messages_${targetLocale}.json`
  );
  /* istanbul ignore next */
  if (process.env.I18N_PSEUDO) {
    const startBoundary = '[[%';
    const endBoundary = '%]]';
    // Make it easier to identify untranslated strings in the UI
    Object.keys(loadedMessages).forEach(loadedLang => {
      const messagesToDisplay = loadedMessages[loadedLang];
      Object.keys(messagesToDisplay).forEach(messageId => {
        if (messagesToDisplay[messageId].startsWith(startBoundary)) {
          // avoid repeating the boundaries when
          // hot reloading in dev mode
          return;
        }
        messagesToDisplay[
          messageId
        ] = `${startBoundary}${messagesToDisplay[messageId]}${endBoundary}`;
      });
    });
  }

  return loadedMessages;
}

function HeaderNameLink(props) {
  return <Link {...props} to={urls.about()} />;
}

/* istanbul ignore next */
export function App({ lang }) {
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(true);
  const [selectedNamespace, setSelectedNamespace] = useState(ALL_NAMESPACES);

  const {
    error: propertiesError,
    isFetching: isFetchingProperties,
    isPlaceholderData: isPropertiesPlaceholder
  } = useProperties();
  const isReadOnly = useIsReadOnly();
  const logoutURL = useLogoutURL();
  const tenantNamespace = useTenantNamespace();

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
    { namespace: tenantNamespace || ALL_NAMESPACES },
    { enabled: !isFetchingConfig }
  );

  const loadingConfigError = propertiesError || messagesError;

  const queryClient = useQueryClient();

  useNamespaces({
    enabled: !isFetchingConfig && !tenantNamespace
  });
  useWebSocketReconnected(
    () => queryClient.invalidateQueries(),
    isWebSocketConnected
  );

  useEffect(() => {
    if (!isFetchingConfig && tenantNamespace) {
      setSelectedNamespace(tenantNamespace);
    }
  }, [isFetchingConfig, tenantNamespace]);

  const logoutButton = <LogoutButton getLogoutURL={() => logoutURL} />;

  const namespaceContext = useMemo(
    () => ({ selectedNamespace, selectNamespace: setSelectedNamespace }),
    [selectedNamespace]
  );

  return (
    <NamespaceContext.Provider value={namespaceContext}>
      <IntlProvider
        defaultLocale={defaultLocale}
        locale={messages[lang] ? lang : defaultLocale}
        messages={messages[lang]}
      >
        <ConfigError loadingConfigError={loadingConfigError} />

        {showLoadingState && <LoadingShell />}
        {!showLoadingState && (
          <Router>
            <>
              <Header
                headerNameProps={{
                  element: HeaderNameLink
                }}
                isSideNavExpanded={isSideNavExpanded}
                logoutButton={logoutButton}
                onHeaderMenuButtonClick={() => {
                  setIsSideNavExpanded(
                    prevIsSideNavExpanded => !prevIsSideNavExpanded
                  );
                }}
              />
              <Route path={paths.byNamespace({ path: '/*' })}>
                {() => <SideNav expanded={isSideNavExpanded} />}
              </Route>

              <Content
                id="main-content"
                className="tkn--main-content"
                aria-labelledby="main-content-header"
                tabIndex="0"
              >
                <PageErrorBoundary>
                  <Switch>
                    <Redirect exact from="/" to={urls.about()} />
                    <Route path={paths.pipelines.all()} exact>
                      <Pipelines />
                    </Route>
                    <Route path={paths.pipelines.byNamespace()} exact>
                      <Pipelines />
                    </Route>
                    <ReadWriteRoute
                      isReadOnly={isReadOnly}
                      path={paths.pipelineRuns.create()}
                      exact
                      component={CreatePipelineRun}
                    />
                    <Route path={paths.pipelineRuns.all()}>
                      <PipelineRuns />
                    </Route>
                    <Route path={paths.pipelineRuns.byNamespace()} exact>
                      <PipelineRuns />
                    </Route>
                    <Route path={paths.pipelineRuns.byPipeline()} exact>
                      <PipelineRuns />
                    </Route>
                    <Route path={paths.pipelineRuns.byName()}>
                      <PipelineRun />
                    </Route>
                    <Route path={paths.pipelineResources.all()} exact>
                      <PipelineResources />
                    </Route>
                    <Route path={paths.pipelineResources.byNamespace()} exact>
                      <PipelineResources />
                    </Route>
                    <Route path={paths.pipelineResources.byName()} exact>
                      <PipelineResource />
                    </Route>
                    <ReadWriteRoute
                      isReadOnly={isReadOnly}
                      path={paths.pipelineResources.create()}
                      exact
                      component={CreatePipelineResource}
                    />

                    <Route path={paths.tasks.all()} exact>
                      <Tasks />
                    </Route>
                    <Route path={paths.tasks.byNamespace()} exact>
                      <Tasks />
                    </Route>
                    <ReadWriteRoute
                      isReadOnly={isReadOnly}
                      path={paths.taskRuns.create()}
                      exact
                      component={CreateTaskRun}
                    />
                    <Route path={paths.taskRuns.all()}>
                      <TaskRuns />
                    </Route>
                    <Route path={paths.taskRuns.byNamespace()} exact>
                      <TaskRuns />
                    </Route>
                    <Route path={paths.taskRuns.byTask()} exact>
                      <TaskRuns />
                    </Route>
                    <Route path={paths.taskRuns.byName()} exact>
                      <TaskRun />
                    </Route>
                    <Route path={paths.clusterTasks.all()} exact>
                      <ClusterTasks />
                    </Route>
                    <Route path={paths.conditions.all()}>
                      <Conditions />
                    </Route>
                    <Route path={paths.conditions.byNamespace()} exact>
                      <Conditions />
                    </Route>
                    <Route path={paths.conditions.byName()}>
                      <Condition />
                    </Route>

                    <Route path={paths.about()}>
                      <About />
                    </Route>
                    <Route path={paths.settings()}>
                      <Settings />
                    </Route>

                    <ReadWriteRoute
                      isReadOnly={isReadOnly}
                      path={paths.importResources()}
                      component={ImportResources}
                    />

                    <Route path={paths.eventListeners.all()} exact>
                      <EventListeners />
                    </Route>
                    <Route path={paths.eventListeners.byNamespace()} exact>
                      <EventListeners />
                    </Route>
                    <Route path={paths.eventListeners.byName()} exact>
                      <EventListener />
                    </Route>
                    <Route path={paths.triggers.byName()} exact>
                      <Trigger />
                    </Route>
                    <Route path={paths.triggers.all()} exact>
                      <Triggers />
                    </Route>
                    <Route path={paths.triggers.byNamespace()} exact>
                      <Triggers />
                    </Route>
                    <Route path={paths.triggerBindings.byName()} exact>
                      <TriggerBinding />
                    </Route>
                    <Route path={paths.triggerBindings.all()} exact>
                      <TriggerBindings />
                    </Route>
                    <Route path={paths.triggerBindings.byNamespace()} exact>
                      <TriggerBindings />
                    </Route>
                    <Route path={paths.clusterTriggerBindings.byName()} exact>
                      <ClusterTriggerBinding />
                    </Route>
                    <Route path={paths.clusterTriggerBindings.all()} exact>
                      <ClusterTriggerBindings />
                    </Route>
                    <Route path={paths.triggerTemplates.byName()} exact>
                      <TriggerTemplate />
                    </Route>
                    <Route path={paths.triggerTemplates.all()} exact>
                      <TriggerTemplates />
                    </Route>
                    <Route path={paths.triggerTemplates.byNamespace()} exact>
                      <TriggerTemplates />
                    </Route>
                    <Route path={paths.clusterInterceptors.all()} exact>
                      <ClusterInterceptors />
                    </Route>
                    <Route path={paths.extensions.all()} exact>
                      <Extensions />
                    </Route>
                    {extensions
                      .filter(extension => !extension.type)
                      .map(({ displayName, name, source }) => (
                        <Route
                          key={name}
                          path={paths.extensions.byName({ name })}
                        >
                          <Extension
                            displayName={displayName}
                            source={source}
                          />
                        </Route>
                      ))}

                    <Route path={paths.rawCRD.byNamespace()} exact>
                      <CustomResourceDefinition />
                    </Route>
                    <Route path={paths.rawCRD.cluster()} exact>
                      <CustomResourceDefinition />
                    </Route>
                    <Route path={paths.kubernetesResources.all()} exact>
                      <ResourceList />
                    </Route>
                    <Route path={paths.kubernetesResources.byNamespace()} exact>
                      <ResourceList />
                    </Route>
                    <Route path={paths.kubernetesResources.byName()} exact>
                      <CustomResourceDefinition />
                    </Route>
                    <Route path={paths.kubernetesResources.cluster()} exact>
                      <CustomResourceDefinition />
                    </Route>

                    <NotFound />
                  </Switch>
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
