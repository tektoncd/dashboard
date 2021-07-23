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

import React, { useEffect } from 'react';
import { matchPath, NavLink } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import {
  SideNav as CarbonSideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem
} from 'carbon-components-react';
import {
  Information20 as AboutIcon,
  Chip20 as ExtensionsIcon,
  DocumentImport20 as ImportResourcesIcon,
  Settings20 as SettingsIcon
} from '@carbon/icons-react';
import { ALL_NAMESPACES, urls } from '@tektoncd/dashboard-utils';

import {
  useExtensions,
  useIsReadOnly,
  useIsTriggersInstalled,
  useSelectedNamespace,
  useTenantNamespace
} from '../../api';

import { ReactComponent as KubernetesIcon } from '../../images/kubernetes.svg';
import { ReactComponent as TektonIcon } from '../../images/tekton-logo-20x20.svg';

function SideNav(props) {
  const { expanded, intl, match, showKubernetesResources } = props;

  if (!expanded) {
    return null;
  }

  const { namespace } = match?.params || {};

  const { selectNamespace } = useSelectedNamespace();
  const tenantNamespace = useTenantNamespace();
  const { data: extensions = [] } = useExtensions({
    namespace: tenantNamespace || ALL_NAMESPACES
  });

  useEffect(() => {
    if (namespace) {
      selectNamespace(namespace);
    }
  }, [namespace]);

  function getMenuItemProps(to) {
    const { location } = props;

    return {
      element: NavLink,
      isActive: !!matchPath(location.pathname, {
        path: to
      }),
      to
    };
  }

  function getPath(path, namespaced = true) {
    if (namespaced && namespace && namespace !== ALL_NAMESPACES) {
      return urls.byNamespace({ namespace, path });
    }

    return path;
  }

  const isReadOnly = useIsReadOnly();
  const isTriggersInstalled = useIsTriggersInstalled();

  return (
    <CarbonSideNav
      aria-label="Main navigation"
      expanded
      isChildOfHeader={false}
      isFixedNav
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
            {...getMenuItemProps(getPath(urls.pipelineResources.all()))}
          >
            PipelineResources
          </SideNavMenuItem>
          <SideNavMenuItem {...getMenuItemProps(getPath(urls.tasks.all()))}>
            Tasks
          </SideNavMenuItem>
          <SideNavMenuItem {...getMenuItemProps(urls.clusterTasks.all())}>
            ClusterTasks
          </SideNavMenuItem>
          <SideNavMenuItem {...getMenuItemProps(getPath(urls.taskRuns.all()))}>
            TaskRuns
          </SideNavMenuItem>
          <SideNavMenuItem
            {...getMenuItemProps(getPath(urls.conditions.all()))}
          >
            Conditions
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
            renderIcon={ExtensionsIcon}
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
                    version: apiVersion,
                    type: name
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
            element={NavLink}
            renderIcon={ImportResourcesIcon}
            to={urls.importResources()}
          >
            {intl.formatMessage({
              id: 'dashboard.importResources.title',
              defaultMessage: 'Import resources'
            })}
          </SideNavLink>
        )}

        <SideNavLink element={NavLink} renderIcon={AboutIcon} to={urls.about()}>
          {intl.formatMessage({
            id: 'dashboard.about.title',
            defaultMessage: 'About'
          })}
        </SideNavLink>

        <SideNavLink
          element={NavLink}
          renderIcon={SettingsIcon}
          to={urls.settings()}
        >
          {intl.formatMessage({
            id: 'dashboard.settings.title',
            defaultMessage: 'Settings'
          })}
        </SideNavLink>
      </SideNavItems>
    </CarbonSideNav>
  );
}

SideNav.defaultProps = {
  showKubernetesResources: false
};

export default injectIntl(SideNav);
