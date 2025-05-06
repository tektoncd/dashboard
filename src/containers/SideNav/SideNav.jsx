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

import { matchPath, NavLink, useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  SideNav as CarbonSideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
  Theme
} from '@carbon/react';
import {
  Information as AboutIcon,
  Chip as ExtensionsIcon,
  DocumentImport as ImportResourcesIcon,
  Settings as SettingsIcon
} from '@carbon/react/icons';
import { ALL_NAMESPACES, urls } from '@tektoncd/dashboard-utils';

import {
  useExtensions,
  useIsReadOnly,
  useIsTriggersInstalled,
  useSelectedNamespace,
  useTenantNamespaces
} from '../../api';

import KubernetesIcon from '../../images/kubernetes.svg?react';
import TektonIcon from '../../images/tekton-logo-20x20.svg?react';

function SideNav({ expanded, showKubernetesResources = false }) {
  const intl = useIntl();
  if (!expanded) {
    return null;
  }

  const location = useLocation();

  const { selectedNamespace } = useSelectedNamespace();
  const tenantNamespaces = useTenantNamespaces();
  const { data: extensions = [] } = useExtensions(
    {
      namespace: tenantNamespaces[0] || ALL_NAMESPACES
    },
    { disableWebSocket: true }
  );

  function getMenuItemProps(to) {
    return {
      as: NavLink,
      isActive: !!matchPath(
        {
          path: to
        },
        location.pathname
      ),
      to
    };
  }

  function getPath(path, namespaced = true) {
    if (
      namespaced &&
      selectedNamespace &&
      selectedNamespace !== ALL_NAMESPACES
    ) {
      return urls.byNamespace({
        namespace: selectedNamespace,
        path
      });
    }

    return path;
  }

  const isReadOnly = useIsReadOnly();
  const isTriggersInstalled = useIsTriggersInstalled();

  return (
    <Theme
      aria-label="Main navigation"
      as={CarbonSideNav}
      expanded={expanded}
      isFixedNav
      theme="g100"
    >
      <SideNavItems>
        <SideNavMenu
          defaultExpanded
          renderIcon={TektonIcon}
          title={intl.formatMessage({
            id: 'dashboard.sideNav.tektonResources',
            defaultMessage: 'Tekton resources'
          })}
        >
          <SideNavMenuItem {...getMenuItemProps(getPath(urls.pipelines.all()))}>
            Pipelines
          </SideNavMenuItem>
          <SideNavMenuItem
            {...getMenuItemProps(getPath(urls.pipelineRuns.all()))}
          >
            PipelineRuns
          </SideNavMenuItem>
          <SideNavMenuItem
            {...getMenuItemProps(getPath(urls.stepActions.all()))}
          >
            StepActions
          </SideNavMenuItem>
          <SideNavMenuItem {...getMenuItemProps(getPath(urls.tasks.all()))}>
            Tasks
          </SideNavMenuItem>
          <SideNavMenuItem {...getMenuItemProps(getPath(urls.taskRuns.all()))}>
            TaskRuns
          </SideNavMenuItem>
          <SideNavMenuItem
            {...getMenuItemProps(getPath(urls.customRuns.all()))}
          >
            CustomRuns
          </SideNavMenuItem>
          {isTriggersInstalled && (
            <SideNavMenuItem
              {...getMenuItemProps(getPath(urls.eventListeners.all()))}
            >
              EventListeners
            </SideNavMenuItem>
          )}
          {isTriggersInstalled && (
            <SideNavMenuItem
              {...getMenuItemProps(getPath(urls.triggers.all()))}
            >
              Triggers
            </SideNavMenuItem>
          )}
          {isTriggersInstalled && (
            <SideNavMenuItem
              {...getMenuItemProps(getPath(urls.triggerBindings.all()))}
            >
              TriggerBindings
            </SideNavMenuItem>
          )}
          {isTriggersInstalled && (
            <SideNavMenuItem
              {...getMenuItemProps(urls.clusterTriggerBindings.all())}
            >
              ClusterTriggerBindings
            </SideNavMenuItem>
          )}
          {isTriggersInstalled && (
            <SideNavMenuItem
              {...getMenuItemProps(getPath(urls.triggerTemplates.all()))}
            >
              TriggerTemplates
            </SideNavMenuItem>
          )}
          {isTriggersInstalled && (
            <SideNavMenuItem
              {...getMenuItemProps(getPath(urls.interceptors.all()))}
            >
              Interceptors
            </SideNavMenuItem>
          )}
          {isTriggersInstalled && (
            <SideNavMenuItem
              {...getMenuItemProps(urls.clusterInterceptors.all())}
            >
              ClusterInterceptors
            </SideNavMenuItem>
          )}
        </SideNavMenu>

        {showKubernetesResources && (
          <SideNavMenu
            defaultExpanded
            renderIcon={KubernetesIcon}
            title={intl.formatMessage({
              id: 'dashboard.sideNav.kubernetesResources',
              defaultMessage: 'Kubernetes resources'
            })}
          >
            placeholder
          </SideNavMenu>
        )}

        {extensions.length > 0 && (
          <SideNavMenu
            defaultExpanded
            renderIcon={props => <ExtensionsIcon size={20} {...props} />}
            title={intl.formatMessage({
              id: 'dashboard.extensions.title',
              defaultMessage: 'Extensions'
            })}
          >
            {extensions.map(
              ({ apiGroup, apiVersion, displayName, name, namespaced }) => {
                const to = getPath(
                  urls.kubernetesResources.all({
                    group: apiGroup,
                    kind: name,
                    version: apiVersion
                  }),
                  namespaced
                );
                return (
                  <SideNavMenuItem
                    {...getMenuItemProps(to)}
                    key={name}
                    title={displayName}
                  >
                    {displayName}
                  </SideNavMenuItem>
                );
              }
            )}
          </SideNavMenu>
        )}

        {!isReadOnly && (
          <SideNavLink
            as={NavLink}
            renderIcon={props => <ImportResourcesIcon size={20} {...props} />}
            to={urls.importResources()}
          >
            {intl.formatMessage({
              id: 'dashboard.importResources.title',
              defaultMessage: 'Import resources'
            })}
          </SideNavLink>
        )}

        <SideNavLink
          as={NavLink}
          renderIcon={props => <AboutIcon size={20} {...props} />}
          to={urls.about()}
        >
          {intl.formatMessage({
            id: 'dashboard.about.title',
            defaultMessage: 'About Tekton'
          })}
        </SideNavLink>

        <SideNavLink
          as={NavLink}
          renderIcon={props => <SettingsIcon size={20} {...props} />}
          to={urls.settings()}
        >
          {intl.formatMessage({
            id: 'dashboard.settings.title',
            defaultMessage: 'Settings'
          })}
        </SideNavLink>
      </SideNavItems>
    </Theme>
  );
}

export default SideNav;
