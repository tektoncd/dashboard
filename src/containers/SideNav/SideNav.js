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
import { NavLink } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import {
  SideNav as CarbonSideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem
} from 'carbon-components-react';
import { ALL_NAMESPACES, urls } from '@tektoncd/dashboard-utils';

import { selectNamespace } from '../../actions/namespaces';
import {
  getExtensions,
  getSelectedNamespace,
  isReadOnly,
  isTriggersInstalled
} from '../../reducers';

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
    const { extensions, intl } = this.props;

    return (
      <CarbonSideNav
        isFixedNav
        expanded
        isChildOfHeader={false}
        aria-label="Main navigation"
      >
        <SideNavItems>
          <SideNavMenu
            defaultExpanded
            title={intl.formatMessage({
              id: 'dashboard.sideNav.tektonResources',
              defaultMessage: 'Tekton resources'
            })}
          >
            <SideNavMenuItem
              element={NavLink}
              icon={<span />}
              to={this.getPath(urls.pipelines.all())}
            >
              Pipelines
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              icon={<span />}
              to={this.getPath(urls.pipelineRuns.all())}
            >
              PipelineRuns
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              icon={<span />}
              to={this.getPath(urls.pipelineResources.all())}
            >
              PipelineResources
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              icon={<span />}
              to={this.getPath(urls.tasks.all())}
            >
              Tasks
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              icon={<span />}
              to={urls.clusterTasks.all()}
            >
              ClusterTasks
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              icon={<span />}
              to={this.getPath(urls.taskRuns.all())}
            >
              TaskRuns
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              icon={<span />}
              to={this.getPath(urls.conditions.all())}
            >
              Conditions
            </SideNavMenuItem>
            {this.props.isTriggersInstalled && (
              <>
                <SideNavMenuItem
                  element={NavLink}
                  icon={<span />}
                  to={this.getPath(urls.eventListeners.all())}
                >
                  EventListeners
                </SideNavMenuItem>
                <SideNavMenuItem
                  element={NavLink}
                  icon={<span />}
                  to={this.getPath(urls.triggerBindings.all())}
                >
                  TriggerBindings
                </SideNavMenuItem>
                <SideNavMenuItem
                  element={NavLink}
                  icon={<span />}
                  to={urls.clusterTriggerBindings.all()}
                >
                  ClusterTriggerBindings
                </SideNavMenuItem>
                <SideNavMenuItem
                  element={NavLink}
                  icon={<span />}
                  to={this.getPath(urls.triggerTemplates.all())}
                >
                  TriggerTemplates
                </SideNavMenuItem>
              </>
            )}
          </SideNavMenu>

          {!this.props.isReadOnly && (
            <SideNavMenu
              defaultExpanded
              title={intl.formatMessage({
                id: 'dashboard.sideNav.kubernetesResources',
                defaultMessage: 'Kubernetes resources'
              })}
            >
              <SideNavMenuItem
                element={NavLink}
                icon={<span />}
                to={this.getPath(urls.secrets.all())}
              >
                Secrets
              </SideNavMenuItem>
              <SideNavMenuItem
                element={NavLink}
                icon={<span />}
                to={this.getPath(urls.serviceAccounts.all())}
              >
                ServiceAccounts
              </SideNavMenuItem>
            </SideNavMenu>
          )}

          {extensions.length > 0 && (
            <SideNavMenu
              defaultExpanded
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
                }) => (
                  <SideNavMenuItem
                    element={NavLink}
                    icon={<span />}
                    to={
                      extensionType === 'kubernetes-resource'
                        ? this.getPath(
                            urls.kubernetesResources.all({
                              group: apiGroup,
                              version: apiVersion,
                              type: name
                            }),
                            namespaced
                          )
                        : urls.extensions.byName({ name })
                    }
                    key={name}
                    title={displayName}
                  >
                    {displayName}
                  </SideNavMenuItem>
                )
              )}
            </SideNavMenu>
          )}

          {!this.props.isReadOnly && (
            <SideNavLink
              element={NavLink}
              icon={<span />}
              to={urls.importResources()}
            >
              {intl.formatMessage({
                id: 'dashboard.importResources.title',
                defaultMessage: 'Import resources'
              })}
            </SideNavLink>
          )}

          <SideNavLink element={NavLink} icon={<span />} to={urls.about()}>
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
