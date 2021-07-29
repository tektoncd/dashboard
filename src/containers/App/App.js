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

import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { connect } from 'react-redux';
import { hot } from 'react-hot-loader/root';
import {
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

import { isWebSocketConnected as selectIsWebSocketConnected } from '../../reducers';
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

/* istanbul ignore next */
export function App({ lang, onUnload, webSocketConnected }) {
  useEffect(() => onUnload, []);

  const [isSideNavExpanded, setIsSideNavExpanded] = useState(true);
  const [selectedNamespace, setSelectedNamespace] = useState(ALL_NAMESPACES);

  const {
    error: propertiesError,
    isFetching: isFetchingProperties,
    isPlaceholderData: isPropertiesPlaceholder,
    refetch: refetchProperties
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

  const { data: extensions = [], refetch: refetchExtensions } = useExtensions(
    { namespace: tenantNamespace || ALL_NAMESPACES },
    { enabled: !isFetchingConfig }
  );

  const loadingConfigError = propertiesError || messagesError;

  function fetchData() {
    refetchProperties();
    refetchExtensions();
  }

  useWebSocketReconnected(fetchData, webSocketConnected);

  useNamespaces({ enabled: !isFetchingConfig && !tenantNamespace });

  useEffect(() => {
    if (!isFetchingConfig && tenantNamespace) {
      setSelectedNamespace(tenantNamespace);
    }
  }, [isFetchingConfig, tenantNamespace]);

  const logoutButton = <LogoutButton getLogoutURL={() => logoutURL} />;

  return (
    <NamespaceContext.Provider
      value={{ selectedNamespace, selectNamespace: setSelectedNamespace }}
    >
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
                isSideNavExpanded={isSideNavExpanded}
                logoutButton={logoutButton}
                onHeaderMenuButtonClick={() => {
                  setIsSideNavExpanded(
                    prevIsSideNavExpanded => !prevIsSideNavExpanded
                  );
                }}
              />
              <Route path={paths.byNamespace({ path: '/*' })}>
                {props => <SideNav {...props} expanded={isSideNavExpanded} />}
              </Route>

              <Content
                id="main-content"
                className="tkn--main-content"
                aria-labelledby="main-content-header"
                tabIndex="0"
              >
                <PageErrorBoundary>
                  <Switch>
                    <Route
                      path={paths.pipelines.all()}
                      exact
                      component={Pipelines}
                    />
                    <Route
                      path={paths.pipelines.byNamespace()}
                      exact
                      component={Pipelines}
                    />
                    <ReadWriteRoute
                      isReadOnly={isReadOnly}
                      path={paths.pipelineRuns.create()}
                      exact
                      component={CreatePipelineRun}
                    />
                    <Route
                      path={paths.pipelineRuns.all()}
                      component={PipelineRuns}
                    />
                    <Route
                      path={paths.pipelineRuns.byNamespace()}
                      exact
                      component={PipelineRuns}
                    />
                    <Route
                      path={paths.pipelineRuns.byPipeline()}
                      exact
                      component={PipelineRuns}
                    />
                    <Route
                      path={paths.pipelineRuns.byName()}
                      component={PipelineRun}
                    />
                    <Route
                      path={paths.pipelineResources.all()}
                      exact
                      component={PipelineResources}
                    />
                    <Route
                      path={paths.pipelineResources.byNamespace()}
                      exact
                      component={PipelineResources}
                    />
                    <Route
                      path={paths.pipelineResources.byName()}
                      exact
                      component={PipelineResource}
                    />
                    <ReadWriteRoute
                      isReadOnly={isReadOnly}
                      path={paths.pipelineResources.create()}
                      exact
                      component={CreatePipelineResource}
                    />

                    <Route path={paths.tasks.all()} exact component={Tasks} />
                    <Route
                      path={paths.tasks.byNamespace()}
                      exact
                      component={Tasks}
                    />
                    <ReadWriteRoute
                      isReadOnly={isReadOnly}
                      path={paths.taskRuns.create()}
                      exact
                      component={CreateTaskRun}
                    />
                    <Route path={paths.taskRuns.all()} component={TaskRuns} />
                    <Route
                      path={paths.taskRuns.byNamespace()}
                      exact
                      component={TaskRuns}
                    />
                    <Route
                      path={paths.taskRuns.byTask()}
                      exact
                      component={TaskRuns}
                    />
                    <Route
                      path={paths.taskRuns.byName()}
                      exact
                      component={TaskRun}
                    />
                    <Route
                      path={paths.clusterTasks.all()}
                      exact
                      component={ClusterTasks}
                    />
                    <Route
                      path={paths.conditions.all()}
                      component={Conditions}
                    />
                    <Route
                      path={paths.conditions.byNamespace()}
                      exact
                      component={Conditions}
                    />
                    <Route
                      path={paths.conditions.byName()}
                      component={Condition}
                    />

                    <Route path={paths.about()} component={About} />
                    <Route path={paths.settings()} component={Settings} />

                    <ReadWriteRoute
                      isReadOnly={isReadOnly}
                      path={paths.importResources()}
                      component={ImportResources}
                    />

                    <Route
                      path={paths.eventListeners.all()}
                      exact
                      component={EventListeners}
                    />
                    <Route
                      path={paths.eventListeners.byNamespace()}
                      exact
                      component={EventListeners}
                    />
                    <Route
                      path={paths.eventListeners.byName()}
                      exact
                      component={EventListener}
                    />
                    <Route
                      path={paths.triggers.byName()}
                      exact
                      component={Trigger}
                    />
                    <Route
                      path={paths.triggers.all()}
                      exact
                      component={Triggers}
                    />
                    <Route
                      path={paths.triggers.byNamespace()}
                      exact
                      component={Triggers}
                    />
                    <Route
                      path={paths.triggerBindings.byName()}
                      exact
                      component={TriggerBinding}
                    />
                    <Route
                      path={paths.triggerBindings.all()}
                      exact
                      component={TriggerBindings}
                    />
                    <Route
                      path={paths.triggerBindings.byNamespace()}
                      exact
                      component={TriggerBindings}
                    />
                    <Route
                      path={paths.clusterTriggerBindings.byName()}
                      exact
                      component={ClusterTriggerBinding}
                    />
                    <Route
                      path={paths.clusterTriggerBindings.all()}
                      exact
                      component={ClusterTriggerBindings}
                    />
                    <Route
                      path={paths.triggerTemplates.byName()}
                      exact
                      component={TriggerTemplate}
                    />
                    <Route
                      path={paths.triggerTemplates.all()}
                      exact
                      component={TriggerTemplates}
                    />
                    <Route
                      path={paths.triggerTemplates.byNamespace()}
                      exact
                      component={TriggerTemplates}
                    />
                    <Route
                      path={paths.clusterInterceptors.all()}
                      exact
                      component={ClusterInterceptors}
                    />
                    <Route
                      path={paths.extensions.all()}
                      exact
                      component={Extensions}
                    />
                    {extensions
                      .filter(extension => !extension.type)
                      .map(({ displayName, name, source }) => (
                        <Route
                          key={name}
                          path={paths.extensions.byName({ name })}
                          render={({ match }) => (
                            <Extension
                              displayName={displayName}
                              match={match}
                              source={source}
                            />
                          )}
                        />
                      ))}

                    <Route
                      path={paths.rawCRD.byNamespace()}
                      exact
                      component={CustomResourceDefinition}
                    />
                    <Route
                      path={paths.rawCRD.cluster()}
                      exact
                      component={CustomResourceDefinition}
                    />
                    <Route
                      path={paths.kubernetesResources.all()}
                      exact
                      component={ResourceList}
                    />
                    <Route
                      path={paths.kubernetesResources.byNamespace()}
                      exact
                      component={ResourceList}
                    />
                    <Route
                      path={paths.kubernetesResources.byName()}
                      exact
                      component={CustomResourceDefinition}
                    />
                    <Route
                      path={paths.kubernetesResources.cluster()}
                      exact
                      component={CustomResourceDefinition}
                    />

                    <Redirect to={urls.pipelineRuns.all()} />
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

App.defaultProps = {
  onUnload: () => {}
};

/* istanbul ignore next */
const mapStateToProps = state => ({
  webSocketConnected: selectIsWebSocketConnected(state)
});

export default hot(connect(mapStateToProps)(App));
