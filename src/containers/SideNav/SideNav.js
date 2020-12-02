/*
Copyright 2019-2020 The Tekton Authors
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

import React, { Component } from 'react';
import { connect } from 'react-redux';
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
  DocumentImport20 as ImportResourcesIcon
} from '@carbon/icons-react';
import { ALL_NAMESPACES, urls } from '@tektoncd/dashboard-utils';

import { selectNamespace } from '../../actions/namespaces';
import {
  getExtensions,
  getSelectedNamespace,
  isReadOnly,
  isTriggersInstalled
} from '../../reducers';

import { ReactComponent as KubernetesIcon } from '../../images/kubernetes.svg';
import { ReactComponent as TektonIcon } from '../../images/tekton-logo-20x20.svg';

import './SideNav.scss';

class SideNav extends Component {
  componentDidMount() {
    const { match } = this.props;

    if (match && match.params.namespace) {
      this.props.selectNamespace(match.params.namespace);
    }
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    if (!match) {
      return;
    }

    const { namespace } = match.params;
    const { match: prevMatch } = prevProps;
    const prevNamespace = prevMatch && prevMatch.params.namespace;

    if (namespace !== prevNamespace) {
      this.props.selectNamespace(namespace);
    }
  }

  getPath(path, namespaced = true) {
    const { namespace } = this.props;
    if (namespaced && namespace && namespace !== ALL_NAMESPACES) {
      return urls.byNamespace({ namespace, path });
    }

    return path;
  }

  render() {
    const { expanded, extensions, intl, location } = this.props;

    return (
      <CarbonSideNav
        isFixedNav={expanded}
        isRail={!expanded}
        expanded={expanded}
        isChildOfHeader={false}
        aria-label="Main navigation"
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
            <SideNavMenuItem
              element={NavLink}
              isActive={
                !!matchPath(location.pathname, {
                  path: this.getPath(urls.pipelines.all())
                })
              }
              to={this.getPath(urls.pipelines.all())}
            >
              Pipelines
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              isActive={
                !!matchPath(location.pathname, {
                  path: this.getPath(urls.pipelineRuns.all())
                })
              }
              to={this.getPath(urls.pipelineRuns.all())}
            >
              PipelineRuns
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              isActive={
                !!matchPath(location.pathname, {
                  path: this.getPath(urls.pipelineResources.all())
                })
              }
              to={this.getPath(urls.pipelineResources.all())}
            >
              PipelineResources
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              isActive={
                !!matchPath(location.pathname, {
                  path: this.getPath(urls.tasks.all())
                })
              }
              to={this.getPath(urls.tasks.all())}
            >
              Tasks
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              isActive={
                !!matchPath(location.pathname, {
                  path: urls.clusterTasks.all()
                })
              }
              to={urls.clusterTasks.all()}
            >
              ClusterTasks
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              isActive={
                !!matchPath(location.pathname, {
                  path: this.getPath(urls.taskRuns.all())
                })
              }
              to={this.getPath(urls.taskRuns.all())}
            >
              TaskRuns
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              isActive={
                !!matchPath(location.pathname, {
                  path: this.getPath(urls.conditions.all())
                })
              }
              to={this.getPath(urls.conditions.all())}
            >
              Conditions
            </SideNavMenuItem>
            {this.props.isTriggersInstalled && (
              <SideNavMenuItem
                element={NavLink}
                isActive={
                  !!matchPath(location.pathname, {
                    path: this.getPath(urls.eventListeners.all())
                  })
                }
                to={this.getPath(urls.eventListeners.all())}
              >
                EventListeners
              </SideNavMenuItem>
            )}
            {this.props.isTriggersInstalled && (
              <SideNavMenuItem
                element={NavLink}
                isActive={
                  !!matchPath(location.pathname, {
                    path: this.getPath(urls.triggerBindings.all())
                  })
                }
                to={this.getPath(urls.triggerBindings.all())}
              >
                TriggerBindings
              </SideNavMenuItem>
            )}
            {this.props.isTriggersInstalled && (
              <SideNavMenuItem
                element={NavLink}
                isActive={
                  !!matchPath(location.pathname, {
                    path: urls.clusterTriggerBindings.all()
                  })
                }
                to={urls.clusterTriggerBindings.all()}
              >
                ClusterTriggerBindings
              </SideNavMenuItem>
            )}
            {this.props.isTriggersInstalled && (
              <SideNavMenuItem
                element={NavLink}
                isActive={
                  !!matchPath(location.pathname, {
                    path: this.getPath(urls.triggerTemplates.all())
                  })
                }
                to={this.getPath(urls.triggerTemplates.all())}
              >
                TriggerTemplates
              </SideNavMenuItem>
            )}
          </SideNavMenu>

          {!this.props.isReadOnly && (
            <SideNavMenu
              defaultExpanded
              renderIcon={KubernetesIcon}
              title={intl.formatMessage({
                id: 'dashboard.sideNav.kubernetesResources',
                defaultMessage: 'Kubernetes resources'
              })}
            >
              <SideNavMenuItem
                element={NavLink}
                isActive={
                  !!matchPath(location.pathname, {
                    path: this.getPath(urls.secrets.all())
                  })
                }
                to={this.getPath(urls.secrets.all())}
              >
                Secrets
              </SideNavMenuItem>
              <SideNavMenuItem
                element={NavLink}
                isActive={
                  !!matchPath(location.pathname, {
                    path: this.getPath(urls.serviceAccounts.all())
                  })
                }
                to={this.getPath(urls.serviceAccounts.all())}
              >
                ServiceAccounts
              </SideNavMenuItem>
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
                ({
                  apiGroup,
                  apiVersion,
                  displayName,
                  extensionType,
                  name,
                  namespaced
                }) => {
                  const to =
                    extensionType === 'kubernetes-resource'
                      ? this.getPath(
                          urls.kubernetesResources.all({
                            group: apiGroup,
                            version: apiVersion,
                            type: name
                          }),
                          namespaced
                        )
                      : urls.extensions.byName({ name });
                  return (
                    <SideNavMenuItem
                      element={NavLink}
                      isActive={
                        !!matchPath(location.pathname, {
                          path: to
                        })
                      }
                      to={to}
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

          {!this.props.isReadOnly && (
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

          <SideNavLink
            element={NavLink}
            renderIcon={AboutIcon}
            to={urls.about()}
          >
            {intl.formatMessage({
              id: 'dashboard.about.title',
              defaultMessage: 'About'
            })}
          </SideNavLink>
        </SideNavItems>
      </CarbonSideNav>
    );
  }
}

SideNav.defaultProps = {
  isTriggersInstalled: false
};

/* istanbul ignore next */
const mapStateToProps = state => ({
  extensions: getExtensions(state),
  isReadOnly: isReadOnly(state),
  isTriggersInstalled: isTriggersInstalled(state),
  namespace: getSelectedNamespace(state)
});

const mapDispatchToProps = {
  selectNamespace
};

export const SideNavWithIntl = injectIntl(SideNav);
export default connect(mapStateToProps, mapDispatchToProps)(SideNavWithIntl);
