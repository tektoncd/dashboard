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
  Redirect,
  Route,
  HashRouter as Router,
  Switch
} from 'react-router-dom';

import { Content } from 'carbon-components-react';

import {
  CustomResourceDefinition,
  Extension,
  Extensions,
  ImportResources,
  PipelineResource,
  PipelineResources,
  PipelineRun,
  PipelineRuns,
  Pipelines,
  SideNav,
  TaskRun,
  TaskRunList,
  TaskRuns,
  Tasks
} from '..';

import Header from '../../components/Header';
import Breadcrumbs from '../../components/Breadcrumbs';
import { fetchExtensions } from '../../actions/extensions';
import { fetchNamespaces, selectNamespace } from '../../actions/namespaces';
import { getExtensions, getSelectedNamespace } from '../../reducers';

import '../../components/App/App.scss';

export /* istanbul ignore next */ class App extends Component {
  componentDidMount() {
    this.props.fetchExtensions();
    this.props.fetchNamespaces();
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    const { extensions } = this.props;

    return (
      <Router>
        <>
          <Header>
            <Route path="*" component={Breadcrumbs} />
          </Header>
          <Route path="/namespaces/:namespace/*">
            {props => <SideNav {...props} />}
          </Route>

          <Content>
            <Switch>
              <Route path="/pipelines" exact component={Pipelines} />
              <Route
                path="/namespaces/:namespace/pipelines"
                exact
                component={Pipelines}
              />
              <Route path="/tasks" exact component={Tasks} />
              <Route
                path="/namespaces/:namespace/tasks"
                exact
                component={Tasks}
              />
              <Route path="/pipelineruns" component={PipelineRuns} />
              <Route
                path="/namespaces/:namespace/pipelineruns"
                component={PipelineRuns}
              />
              <Route
                path="/namespaces/:namespace/taskruns"
                exact
                component={TaskRunList}
              />
              <Route
                path="/namespaces/:namespace/taskruns/:taskRunName"
                exact
                component={TaskRun}
              />
              <Route
                path="/namespaces/:namespace/pipelines/:pipelineName/runs"
                exact
                component={PipelineRuns}
              />
              <Route path="/taskruns" component={TaskRunList} />
              <Route
                path="/namespaces/:namespace/tasks/:taskName/runs"
                exact
                component={TaskRuns}
              />
              <Route
                path="/namespaces/:namespace/pipelines/:pipelineName/runs/:pipelineRunName"
                component={PipelineRun}
              />
              <Route
                path="/pipelineresources"
                exact
                component={PipelineResources}
              />
              <Route
                path="/namespaces/:namespace/pipelineresources"
                exact
                component={PipelineResources}
              />
              <Route
                path="/namespaces/:namespace/pipelineresources/:pipelineResourceName"
                exact
                component={PipelineResource}
              />
              <Route path="/importresources" component={ImportResources} />
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
              <Route
                path="/namespaces/:namespace/:type/:name"
                exact
                component={CustomResourceDefinition}
              />
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
  onUnload: () => {}
};

/* istanbul ignore next */
const mapStateToProps = state => ({
  extensions: getExtensions(state),
  namespace: getSelectedNamespace(state)
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
