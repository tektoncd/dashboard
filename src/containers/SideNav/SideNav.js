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
import { generatePath, NavLink } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import {
  SideNav as CarbonSideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem
} from 'carbon-components-react';
import { ALL_NAMESPACES, urls } from '@tektoncd/dashboard-utils';

import { NamespacesDropdown } from '..';

import { selectNamespace } from '../../actions/namespaces';
import {
  getExtensions,
  getSelectedNamespace,
  getTenantNamespace,
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

  setPath(path) {
    const { history, location } = this.props;
    history.push(path + location.search);
  }

  getPath(path) {
    const { match } = this.props;
    if (match && match.params.namespace) {
      return urls.byNamespace({ namespace: match.params.namespace, path });
    }

    return path;
  }

  selectNamespace = event => {
    const namespace = event.selectedItem
      ? event.selectedItem.id
      : ALL_NAMESPACES;
    const { history, match } = this.props;
    if (!match) {
      this.props.selectNamespace(namespace);
      return;
    }

    if (namespace !== ALL_NAMESPACES) {
      const newURL = generatePath(match.path, {
        namespace,
        0: match.params[0]
      });
      this.setPath(newURL);
      return;
    }

    this.props.selectNamespace(namespace);
    const currentURL = this.props.match.url;
    if (currentURL.includes(urls.taskRuns.all())) {
      this.setPath(urls.taskRuns.all());
      return;
    }
    if (currentURL.includes(urls.pipelineResources.all())) {
      this.setPath(urls.pipelineResources.all());
      return;
    }
    if (currentURL.includes(urls.pipelines.all())) {
      this.setPath(urls.pipelines.all());
      return;
    }
    if (currentURL.includes(urls.pipelineRuns.all())) {
      this.setPath(urls.pipelineRuns.all());
      return;
    }
    if (currentURL.includes(urls.serviceAccounts.all())) {
      this.setPath(urls.serviceAccounts.all());
      return;
    }
    if (currentURL.includes(urls.eventListeners.all())) {
      this.setPath(urls.eventListeners.all());
      return;
    }
    if (currentURL.includes(urls.triggerBindings.all())) {
      this.setPath(urls.triggerBindings.all());
      return;
    }
    if (currentURL.includes(urls.clusterTriggerBindings.all())) {
      this.setPath(urls.clusterTriggerBindings.all());
      return;
    }
    if (currentURL.includes(urls.triggerTemplates.all())) {
      this.setPath(urls.triggerTemplates.all());
      return;
    }
    if (currentURL.includes(urls.secrets.all())) {
      this.setPath(urls.secrets.all());
      return;
    }
    if (currentURL.includes(urls.tasks.all())) {
      this.setPath(urls.tasks.all());
      return;
    }

    history.push('/');
  };

  render() {
    const { extensions, intl, namespace } = this.props;

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

          <SideNavMenuItem
            element={NamespacesDropdown}
            id="sidenav-namespace-dropdown"
            selectedItem={{ id: namespace, text: namespace }}
            showAllNamespaces={!this.props.tenantNamespace}
            onChange={this.selectNamespace}
          >
            &nbsp;
          </SideNavMenuItem>

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
                  displayName,
                  name,
                  extensionType,
                  apiGroup,
                  apiVersion
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
                            })
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
  namespace: getSelectedNamespace(state),
  tenantNamespace: getTenantNamespace(state)
});

const mapDispatchToProps = {
  selectNamespace
};

export const SideNavWithIntl = injectIntl(SideNav);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SideNavWithIntl);
