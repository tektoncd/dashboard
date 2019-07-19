/*
Copyright 2019 The Tekton Authors
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
import {
  SideNav as CarbonSideNav,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem
} from 'carbon-components-react';

import { NamespacesDropdown } from '..';

import { selectNamespace } from '../../actions/namespaces';
import { getExtensions, getSelectedNamespace } from '../../reducers';
import { ALL_NAMESPACES } from '../../constants';
import { urls } from '../../utils';

import './SideNav.scss';

export class SideNav extends Component {
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

  getPath(path) {
    const { match } = this.props;
    if (match && match.params.namespace) {
      return urls.byNamespace({ namespace: match.params.namespace, path });
    }

    return path;
  }

  selectNamespace = event => {
    const namespace = event.selectedItem.id;
    const { history, match } = this.props;

    if (!match) {
      this.props.selectNamespace(namespace);
      return;
    }

    if (namespace === ALL_NAMESPACES) {
      this.props.selectNamespace(namespace);
      history.push('/');
      return;
    }

    const newURL = generatePath(match.path, { namespace, 0: match.params[0] });
    history.push(newURL);
  };

  render() {
    const { extensions, namespace } = this.props;

    return (
      <CarbonSideNav
        isFixedNav
        expanded
        isChildOfHeader={false}
        aria-label="Side navigation"
      >
        <SideNavItems>
          <SideNavMenu defaultExpanded title="Tekton">
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
          </SideNavMenu>
          <SideNavMenuItem
            element={NamespacesDropdown}
            id="sidenav-namespace-dropdown"
            selectedItem={{ id: namespace, text: namespace }}
            showAllNamespaces
            onChange={this.selectNamespace}
          />
          <SideNavMenuItem
            element={NavLink}
            icon={<span />}
            to={urls.importResources()}
          >
            Import Tekton resources
          </SideNavMenuItem>
          <SideNavMenuItem element={NavLink} icon={<span />} to="/secrets">
            Secrets
          </SideNavMenuItem>
          {extensions.length > 0 &&
            extensions.map(({ displayName, name }) => (
              <SideNavMenuItem
                element={NavLink}
                icon={<span />}
                to={urls.extensions.byName({ name })}
                key={name}
                title={displayName}
              >
                {displayName}
              </SideNavMenuItem>
            ))}
        </SideNavItems>
      </CarbonSideNav>
    );
  }
}

/* istanbul ignore next */
const mapStateToProps = state => ({
  extensions: getExtensions(state),
  namespace: getSelectedNamespace(state)
});

const mapDispatchToProps = {
  selectNamespace
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SideNav);
