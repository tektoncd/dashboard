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
import { hot } from 'react-hot-loader/root';
import {
  HashRouter as Router,
  NavLink,
  Redirect,
  Route,
  Switch
} from 'react-router-dom';

import {
  Content,
  SideNav,
  SideNavItems,
  SideNavLink
} from 'carbon-components-react/lib/components/UIShell';

import {
  Extension,
  Extensions,
  PipelineRun,
  PipelineRuns,
  Pipelines,
  Secrets,
  Tasks,
  TaskRuns,
  NamespacesDropdown
} from '..';

import SideNavMenu from '../../components/SideNavMenu';
import Header from '../../components/Header';
import Breadcrumbs from '../../components/Breadcrumbs';
import { fetchExtensions } from '../../actions/extensions';
import { fetchNamespaces, selectNamespace } from '../../actions/namespaces';
import {
  getExtensions,
  getNamespaces,
  getSelectedNamespace
} from '../../reducers';

import '../../components/App/App.scss';

export /* istanbul ignore next */ class App extends Component {
  componentDidMount() {
    this.props.fetchExtensions();
    this.props.fetchNamespaces();
  }

  render() {
    const { extensions, namespace } = this.props;

    return (
      <Router>
        <>
          <Header>
            <Route path="*" component={Breadcrumbs} />
          </Header>
          <SideNav defaultExpanded expanded aria-label="Side navigation">
            <SideNavItems>
              <SideNavMenu title="Tekton">
                <SideNavLink element={NavLink} icon={<span />} to="/pipelines">
                  Pipelines
                </SideNavLink>
                <SideNavLink
                  element={NavLink}
                  icon={<span />}
                  to="/pipelineruns"
                >
                  PipelineRuns
                </SideNavLink>
                <SideNavLink element={NavLink} icon={<span />} to="/secrets">
                  Secrets
                </SideNavLink>
                <SideNavLink element={NavLink} icon={<span />} to="/tasks">
                  Tasks
                </SideNavLink>
              </SideNavMenu>
              <NamespacesDropdown
                titleText="Namespace"
                selectedItem={{ text: namespace }}
                onChange={event => {
                  this.props.selectNamespace(event.selectedItem.text);
                }}
              />
              {extensions.length > 0 && (
                <SideNavMenu title="Extensions">
                  {extensions.map(({ displayName, name }) => (
                    <SideNavLink
                      element={NavLink}
                      icon={<span />}
                      to={`/extensions/${name}`}
                      key={name}
                      title={displayName}
                    >
                      {displayName}
                    </SideNavLink>
                  ))}
                </SideNavMenu>
              )}
            </SideNavItems>
          </SideNav>

          <Content>
            <Switch>
              <Redirect
                from="/pipelines/:pipelineName"
                exact
                to="/pipelines/:pipelineName/runs"
              />
              <Redirect
                from="/tasks/:taskName"
                exact
                to="/tasks/:taskName/runs"
              />
              <Route path="/pipelines" exact component={Pipelines} />
              <Route path="/secrets" exact component={Secrets} />
              <Route path="/tasks" exact component={Tasks} />
              <Route path="/pipelineruns" component={PipelineRuns} />
              <Route
                path="/pipelines/:pipelineName/runs"
                exact
                component={PipelineRuns}
              />
              <Route path="/tasks/:taskName/runs" exact component={TaskRuns} />
              <Route
                path="/pipelines/:pipelineName/runs/:pipelineRunName"
                component={PipelineRun}
              />
              <Route path="/extensions" exact component={Extensions} />
              {extensions.map(({ displayName, name, source }) => (
                <Route
                  key={name}
                  path={`/extensions/${name}`}
                  render={({ match }) => (
                    <Extension
                      displayName={displayName}
                      match={match}
                      source={source}
                    />
                  )}
                />
              ))}
              <Redirect to="/pipelines" />
            </Switch>
          </Content>
        </>
      </Router>
    );
  }
}

App.defaultProps = {
  extensions: [],
  namespaces: ['default']
};

/* istanbul ignore next */
const mapStateToProps = state => ({
  extensions: getExtensions(state),
  namespace: getSelectedNamespace(state),
  namespaces: getNamespaces(state)
});

const mapDispatchToProps = {
  fetchExtensions,
  fetchNamespaces,
  selectNamespace
};

export default hot(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
